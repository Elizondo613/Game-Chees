// src/hooks/useChessGame.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { useStockfish } from './useStockfish';
import { useSounds } from './useSounds';
import { useAbilities } from './useAbilities';
import type { Civilization } from '../types/civilization.types';

export type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SKILL: Record<Difficulty, number> = {
  easy: 2,
  medium: 8,
  hard: 18,
};

// Delay visual de la IA según dificultad (ms)
const DIFFICULTY_DELAY: Record<Difficulty, number> = {
  easy: 1200,    // lenta — parece que "piensa"
  medium: 700,
  hard: 200,     // rápida — da sensación de poder
};

export function useChessGame(
  difficulty: Difficulty = 'medium',
  civilization: Civilization,
  initialTime: number = 600, // segundos
) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameRef = useRef(game);
  gameRef.current = game;

  const { playMove, playCapture, playCheck, playCheckmate } = useSounds();
  const abilities = useAbilities(civilization);
  const abilitiesRef = useRef(abilities);
  abilitiesRef.current = abilities;

  const applyAIMove = useCallback((moveStr: string) => {
    const current = gameRef.current;
    if (!current || current.isGameOver() || current.turn() !== 'b') {
      setIsAIThinking(false);
      return;
    }
    try {
      const gameCopy = new Chess(current.fen());
      const move = gameCopy.move({
        from: moveStr.slice(0, 2) as Square,
        to: moveStr.slice(2, 4) as Square,
        promotion: moveStr[4] || 'q',
      });
      if (move.captured) playCapture();
      else playMove();
      if (gameCopy.isCheckmate()) playCheckmate();
      else if (gameCopy.isCheck()) {
        playCheck();
        setShakeKey(k => k + 1);
      }
      setGame(gameCopy);
      abilitiesRef.current.tickTurn();
    } catch { 
      setIsAIThinking(false);
      setTimeout(() => {
        setIsAIThinking(true);
      }, 200);
     }
    finally { setIsAIThinking(false); }
  }, [playMove, playCapture, playCheck, playCheckmate]);

  const { getBestMove } = useStockfish(applyAIMove, DIFFICULTY_SKILL[difficulty]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!gameStarted || game.isGameOver() || isAIThinking) return;

    // Habilidad pendiente — ejecutar
    if (abilities.state.pendingAbility) {
      abilities.executeAbility(game, 'w', (newFen) => {
        const newGame = new Chess(newFen);
        gameRef.current = newGame;
        setGame(newGame);
        setSelectedSquare(null);
        setLegalMoves([]);
        setIsAIThinking(false);
        setTimeout(() => setIsAIThinking(true), 100);
      });
      return;
    }

    if (game.turn() !== 'w') return;

    if (selectedSquare && legalMoves.includes(square)) {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (move.captured) playCapture();
      else playMove();
      if (gameCopy.isCheckmate()) playCheckmate();
      else if (gameCopy.isCheck()) {
        playCheck();
        setShakeKey(k => k + 1);
      }
      setGame(gameCopy);
      setSelectedSquare(null);
      setLegalMoves([]);
      setIsAIThinking(true);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [game, selectedSquare, legalMoves, isAIThinking,
      gameStarted, abilities, playMove, playCapture, playCheck, playCheckmate]);

  // IA con delay según dificultad
  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver() && isAIThinking && gameStarted) {
      const timer = setTimeout(() => {
        getBestMove(gameRef.current.fen());
      }, DIFFICULTY_DELAY[difficulty]);
      return () => clearTimeout(timer);
    }
  }, [game, isAIThinking, getBestMove, difficulty, gameStarted]);

  // Timer — solo corre si el juego está iniciado
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!gameStarted || game.isGameOver()) return;

    timerRef.current = setInterval(() => {
      if (gameRef.current.turn() === 'w') {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, game]);

  // Reinicia el timer al cambiar la configuración o al reiniciar el juego
  useEffect(() => {
  if (!gameStarted) {
      setWhiteTime(initialTime);
      setBlackTime(initialTime);
    }
  }, [initialTime, gameStarted]);

  const startGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const reset = useCallback((newTime?: number) => {
    const timeToUse = newTime ?? initialTime;
    setGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsAIThinking(false);
    setShakeKey(0);
    setGameStarted(false);
    setWhiteTime(timeToUse);
    setBlackTime(timeToUse);
  }, [initialTime]);

  return {
    game, selectedSquare, legalMoves, handleSquareClick,
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isGameOver: game.isGameOver(),
    turn: game.turn(),
    history: game.history(),
    isAIThinking, shakeKey,
    whiteTime, blackTime,
    gameStarted, startGame,
    abilities,
    reset,
  };
}