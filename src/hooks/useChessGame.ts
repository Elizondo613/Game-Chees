// src/hooks/useChessGame.ts
import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';
import { useStockfish } from './useStockfish';
import { useSounds } from './useSounds';
import { useAbilities } from './useAbilities';
import type { AbilityUse } from './useAbilities';
import { movesRespectingShields } from '../core/ability-engine';
import { planAIAbility } from '../core/ai-abilities';
import type { AIAbilityPlan } from '../core/ai-abilities';
import type { Civilization } from '../types/civilization.types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameResult {
  /** null = tablas */
  winner: 'w' | 'b' | null;
  reason: 'checkmate' | 'timeout' | 'stalemate' | 'draw';
}

export interface LogEntry {
  side: 'w' | 'b';
  text: string;
  kind: 'move' | 'ability';
}

export interface BoardFx {
  squares: string[];
  kind: 'capture' | 'shield' | 'magic';
  key: number;
}

const DIFFICULTY_SKILL: Record<Difficulty, number> = {
  easy: 2,
  medium: 8,
  hard: 18,
};

// Pausa antes de que la IA mueva: en fácil "piensa" más, en difícil es rápida
const DIFFICULTY_DELAY: Record<Difficulty, number> = {
  easy: 1200,
  medium: 700,
  hard: 250,
};

// Probabilidad de que la IA use una habilidad cuando encuentra una que le conviene
const AI_ABILITY_CHANCE: Record<Difficulty, number> = {
  easy: 0.3,
  medium: 0.6,
  hard: 0.9,
};

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

// Si Stockfish no responde en este tiempo, la IA juega una jugada de respaldo
const AI_WATCHDOG_MS = 10000;

export function useChessGame(
  difficulty: Difficulty = 'medium',
  civilization: Civilization,
  initialTime: number = 600,
  onGameEnd?: (result: GameResult, info: { moves: number; durationSec: number }) => void,
) {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [fx, setFx] = useState<BoardFx | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // La partida termina sola: jaque mate / tablas según el tablero, o reloj en 0
  const result = useMemo<GameResult | null>(() => {
    if (!gameStarted) return null;
    if (game.isCheckmate()) return { winner: game.turn() === 'w' ? 'b' : 'w', reason: 'checkmate' };
    if (game.isStalemate()) return { winner: null, reason: 'stalemate' };
    if (game.isDraw()) return { winner: null, reason: 'draw' };
    if (whiteTime === 0) return { winner: 'b', reason: 'timeout' };
    if (blackTime === 0) return { winner: 'w', reason: 'timeout' };
    return null;
  }, [game, gameStarted, whiteTime, blackTime]);

  // Refs para leer el estado actual desde timers y respuestas del worker.
  // gameRef además se actualiza a mano al mover, para que la IA vea la
  // posición nueva aunque React todavía no haya re-renderizado.
  const gameRef = useRef(game);
  const resultRef = useRef(result);
  const startedAtRef = useRef(0);
  const savedRef = useRef(false);
  const onGameEndRef = useRef(onGameEnd);

  const sounds = useSounds();
  const abilities = useAbilities(civilization);
  const abilitiesRef = useRef(abilities);
  const civRef = useRef(civilization);
  useLayoutEffect(() => {
    gameRef.current = game;
    resultRef.current = result;
    onGameEndRef.current = onGameEnd;
    abilitiesRef.current = abilities;
    civRef.current = civilization;
  });

  const flash = useCallback((squares: string[], kind: BoardFx['kind']) => {
    if (squares.length) setFx({ squares, kind, key: Date.now() });
  }, []);

  const feedbackForPosition = useCallback((next: Chess) => {
    if (next.isCheckmate()) sounds.playCheckmate();
    else if (next.isCheck()) {
      sounds.playCheck();
      setShakeKey(k => k + 1);
    }
  }, [sounds]);

  /** Aplica una habilidad ya resuelta (del jugador o de la IA) y pasa el turno */
  const applyAbilityUse = useCallback((use: AbilityUse) => {
    const { side, ability, outcome } = use;
    const next = new Chess(outcome.fen);
    const defensive = outcome.shielded.length > 0;
    if (defensive) sounds.playShield();
    else sounds.playAbility();
    if (outcome.captured.length) setTimeout(() => sounds.playCapture(), 120);
    feedbackForPosition(next);
    flash(
      defensive ? outcome.shielded
        : outcome.captured.length ? outcome.captured
        : [...outcome.converted, ...outcome.moved.map(([, to]) => to)],
      defensive ? 'shield' : outcome.captured.length ? 'capture' : 'magic',
    );
    abilitiesRef.current.endTurn(side);
    gameRef.current = next;
    setGame(next);
    setLastMove(outcome.moved.length ? { from: outcome.moved[0][0], to: outcome.moved[0][1] } : null);
    setLog(l => [...l, { side, text: `${ability.icon} ${ability.name}`, kind: 'ability' }]);
    setSelectedSquare(null);
    setLegalMoves([]);
    // Si jugó el humano, ahora le toca a la IA (y viceversa)
    setIsAIThinking(side === 'w');
  }, [sounds, feedbackForPosition, flash]);

  /** La IA usa una habilidad planificada */
  const applyAIAbility = useCallback((plan: AIAbilityPlan) => {
    const use: AbilityUse = { side: 'b', from: plan.from, ability: plan.ability, outcome: plan.outcome };
    abilitiesRef.current.commit(use);
    applyAbilityUse(use);
  }, [applyAbilityUse]);

  // ── Movimiento de la IA ─────────────────────────────────────────────────

  const commitAIMove = useCallback((move: Move, next: Chess) => {
    if (move.captured) sounds.playCapture();
    else sounds.playMove();
    feedbackForPosition(next);
    abilitiesRef.current.onMove(move);
    abilitiesRef.current.endTurn('b');
    gameRef.current = next;
    setGame(next);
    setLastMove({ from: move.from, to: move.to });
    setLog(l => [...l, { side: 'b', text: move.san, kind: 'move' }]);
    setIsAIThinking(false);
  }, [sounds, feedbackForPosition]);

  /** Jugada de respaldo: prefiere capturas, respeta escudos */
  const playFallbackMove = useCallback(() => {
    const current = gameRef.current;
    if (resultRef.current || current.turn() !== 'b' || current.isGameOver()) return;
    const allowed = new Set(movesRespectingShields(current.fen(), abilitiesRef.current.protectedSquares));
    let options = current.moves({ verbose: true })
      .filter(m => allowed.size === 0 || allowed.has(m.from + m.to + (m.promotion ?? '')));
    const captures = options.filter(m => m.captured);
    if (captures.length) options = captures;
    const pick = options[Math.floor(Math.random() * options.length)];
    if (!pick) return;
    const next = new Chess(current.fen());
    const move = next.move({ from: pick.from, to: pick.to, promotion: pick.promotion ?? 'q' });
    commitAIMove(move, next);
  }, [commitAIMove]);

  const applyAIMove = useCallback((moveStr: string, requestedFen: string) => {
    const current = gameRef.current;
    // Respuesta vieja (se reinició la partida, o ya se movió): se ignora
    if (resultRef.current || current.fen() !== requestedFen || current.turn() !== 'b') return;

    const allowed = movesRespectingShields(current.fen(), abilitiesRef.current.protectedSquares);
    if (allowed.length > 0 && !allowed.includes(moveStr)) {
      playFallbackMove();
      return;
    }
    try {
      const next = new Chess(current.fen());
      const move = next.move({
        from: moveStr.slice(0, 2) as Square,
        to: moveStr.slice(2, 4) as Square,
        promotion: moveStr[4] || 'q',
      });
      commitAIMove(move, next);
    } catch {
      playFallbackMove();
    }
  }, [commitAIMove, playFallbackMove]);

  const { getBestMove, cancelSearch } = useStockfish(
    applyAIMove, DIFFICULTY_SKILL[difficulty], playFallbackMove,
  );

  // Refs para que el efecto de abajo no se reinicie en cada render (el reloj
  // re-renderiza cada segundo y cancelaría la pausa de la IA)
  const getBestMoveRef = useRef(getBestMove);
  const fallbackRef = useRef(playFallbackMove);
  const aiAbilityRef = useRef(applyAIAbility);
  useLayoutEffect(() => {
    getBestMoveRef.current = getBestMove;
    fallbackRef.current = playFallbackMove;
    aiAbilityRef.current = applyAIAbility;
  });

  // Dispara la IA (con pausa según dificultad) y un vigilante por si no responde
  useEffect(() => {
    if (!gameStarted || result || !isAIThinking || game.turn() !== 'b' || game.isGameOver()) return;
    const fen = game.fen();
    const think = setTimeout(() => {
      // ¿Le conviene usar una habilidad? (más probable en difícil)
      const ab = abilitiesRef.current;
      const plan = planAIAbility(fen, civRef.current, 'b', ab.state.cooldowns.b, ab.protectedSquares);
      if (plan && Math.random() < AI_ABILITY_CHANCE[difficulty]) {
        aiAbilityRef.current(plan);
        return;
      }
      const legalCount = game.moves().length;
      const allowed = movesRespectingShields(fen, abilitiesRef.current.protectedSquares);
      const restrict = allowed.length > 0 && allowed.length < legalCount ? allowed : undefined;
      getBestMoveRef.current(fen, restrict);
    }, DIFFICULTY_DELAY[difficulty]);
    const watchdog = setTimeout(() => {
      if (gameRef.current.fen() === fen) fallbackRef.current();
    }, DIFFICULTY_DELAY[difficulty] + AI_WATCHDOG_MS);
    return () => { clearTimeout(think); clearTimeout(watchdog); };
  }, [game, isAIThinking, gameStarted, result, difficulty]);

  // ── Turno del jugador ───────────────────────────────────────────────────

  const canPlayerAct = gameStarted && !result && !isAIThinking && game.turn() === 'w';

  /** Jugada normal del jugador (promotion: pieza elegida al coronar) */
  const playerMove = useCallback((from: Square, to: Square, promotion: PromotionPiece = 'q') => {
    const next = new Chess(game.fen());
    const move = next.move({ from, to, promotion });
    if (move.captured) sounds.playCapture();
    else sounds.playMove();
    feedbackForPosition(next);
    abilities.onMove(move);
    abilities.endTurn('w');
    gameRef.current = next;
    setGame(next);
    setLastMove({ from: move.from, to: move.to });
    setLog(l => [...l, { side: 'w', text: move.san, kind: 'move' }]);
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setIsAIThinking(true);
  }, [game, sounds, feedbackForPosition, abilities]);

  /** Botón "Activar" del panel de habilidades */
  const activateAbility = useCallback((from: Square) => {
    if (!canPlayerAct) return;
    const use = abilities.activate(game.fen(), from);
    if (use) applyAbilityUse(use);
  }, [canPlayerAct, abilities, game, applyAbilityUse]);

  /** Botón "Confirmar" (habilidades de área) */
  const confirmAbility = useCallback(() => {
    if (!canPlayerAct) return;
    const use = abilities.confirm(game.fen());
    if (use) applyAbilityUse(use);
  }, [canPlayerAct, abilities, game, applyAbilityUse]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!canPlayerAct) return;
    abilities.clearError();
    if (pendingPromotion) setPendingPromotion(null);

    // Habilidad pendiente: el clic elige objetivo / confirma, o la cancela
    const pending = abilities.state.pending;
    if (pending) {
      const isTarget = pending.targets.includes(square);
      const isAreaConfirm = pending.targets.length === 0
        && (square === pending.from || pending.preview.includes(square));
      if (isTarget || isAreaConfirm) {
        const use = abilities.confirm(game.fen(), isTarget ? square : undefined);
        if (use) applyAbilityUse(use);
        return;
      }
      abilities.cancel();
    }

    if (selectedSquare && legalMoves.includes(square)) {
      const isPromotion = game.moves({ square: selectedSquare, verbose: true })
        .some(m => m.to === square && m.promotion);
      if (isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      playerMove(selectedSquare, square);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === 'w' && square !== selectedSquare) {
      // No se puede capturar una pieza con escudo o en zona de inmunidad
      const allowed = new Set(movesRespectingShields(game.fen(), abilities.protectedSquares));
      const targets = game.moves({ square, verbose: true })
        .filter(m => allowed.has(m.from + m.to + (m.promotion ?? '')))
        .map(m => m.to as Square);
      setSelectedSquare(square);
      setLegalMoves([...new Set(targets)]);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [canPlayerAct, abilities, game, selectedSquare, legalMoves, applyAbilityUse, playerMove,
      pendingPromotion]);

  /** Elige la pieza de coronación pendiente */
  const choosePromotion = useCallback((piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    playerMove(pendingPromotion.from, pendingPromotion.to, piece);
  }, [pendingPromotion, playerMove]);

  const cancelPromotion = useCallback(() => setPendingPromotion(null), []);

  // ── Reloj ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!gameStarted || result) return;
    const id = setInterval(() => {
      if (gameRef.current.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1));
      else setBlackTime(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [gameStarted, result]);

  // ── Fin de partida ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!result || savedRef.current) return;
    savedRef.current = true;
    cancelSearch();
    onGameEndRef.current?.(result, {
      moves: log.filter(e => e.side === 'w').length,
      durationSec: Math.round((Date.now() - startedAtRef.current) / 1000),
    });
  }, [result, log, cancelSearch]);

  // ── Controles ───────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    startedAtRef.current = Date.now();
    savedRef.current = false;
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setGameStarted(true);
  }, [initialTime]);

  const reset = useCallback((newTime?: number) => {
    const timeToUse = newTime ?? initialTime;
    cancelSearch();
    const fresh = new Chess();
    gameRef.current = fresh;
    setGame(fresh);
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsAIThinking(false);
    setShakeKey(0);
    setGameStarted(false);
    setWhiteTime(timeToUse);
    setBlackTime(timeToUse);
    setLastMove(null);
    setLog([]);
    setFx(null);
    setPendingPromotion(null);
    savedRef.current = false;
    abilities.reset();
  }, [initialTime, cancelSearch, abilities]);

  // Solo en desarrollo: carga una posición desde la consola para probar
  // habilidades rápido, p. ej. __chess.loadFen('4k3/8/8/8/8/8/8/4K2R w K - 0 1')
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __chess?: { loadFen: (fen: string) => void; fen: () => string } };
    w.__chess = {
      loadFen: (fen: string) => {
        const next = new Chess(fen);
        gameRef.current = next;
        setGame(next);
        setLog([]);
        setLastMove(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        abilitiesRef.current.reset();
        setIsAIThinking(next.turn() === 'b');
      },
      fen: () => gameRef.current.fen(),
    };
    return () => { delete w.__chess; };
  }, []);

  return {
    game, selectedSquare,
    legalMoves: result ? [] : legalMoves,
    handleSquareClick,
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isGameOver: !!result,
    result,
    turn: game.turn(),
    log,
    lastMove,
    fx,
    isAIThinking: isAIThinking && !result,
    shakeKey,
    // Antes de empezar, el reloj muestra el tiempo elegido
    whiteTime: gameStarted ? whiteTime : initialTime,
    blackTime: gameStarted ? blackTime : initialTime,
    gameStarted, startGame,
    canPlayerAct,
    abilities,
    pendingPromotion: result ? null : pendingPromotion,
    choosePromotion,
    cancelPromotion,
    activateAbility,
    confirmAbility,
    reset,
  };
}
