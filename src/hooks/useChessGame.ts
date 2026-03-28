// src/hooks/useChessGame.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { useStockfish } from './useStockfish';
import { useSounds } from './useSounds';

export type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SKILL: Record<Difficulty, number> = {
  easy: 2,
  medium: 8,
  hard: 18,
};

export function useChessGame(difficulty: Difficulty = 'medium') {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Timer: segundos restantes por jugador
  const [whiteTime, setWhiteTime] = useState(600); // 10 min
  const [blackTime, setBlackTime] = useState(600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gameRef = useRef(game);
  gameRef.current = game;

  const { playMove, playCapture, playCheck, playCheckmate } = useSounds();

  const applyAIMove = useCallback((moveStr: string) => {
    const current = gameRef.current;
    if (current.isGameOver() || current.turn() !== 'b') return;
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
      else if (gameCopy.isCheck()) { playCheck(); setShakeKey(k => k + 1); }
      setGame(gameCopy);
    } catch { /* movimiento inválido */ }
    finally { setIsAIThinking(false); }
  }, [playMove, playCapture, playCheck, playCheckmate]);

  const { getBestMove } = useStockfish(applyAIMove, DIFFICULTY_SKILL[difficulty]);

  // Timer logic
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (game.isGameOver()) return;
    timerRef.current = setInterval(() => {
      if (game.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1));
      else setBlackTime(t => Math.max(0, t - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game]);

  const handleSquareClick = useCallback((square: Square) => {
    if (game.isGameOver() || game.turn() !== 'w' || isAIThinking) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (move.captured) playCapture();
      else playMove();
      if (gameCopy.isCheckmate()) playCheckmate();
      else if (gameCopy.isCheck()) { playCheck(); setShakeKey(k => k + 1); }
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
  }, [game, selectedSquare, legalMoves, isAIThinking, playMove, playCapture, playCheck, playCheckmate]);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver() && isAIThinking) {
      const timer = setTimeout(() => getBestMove(game.fen()), 300);
      return () => clearTimeout(timer);
    }
  }, [game, isAIThinking, getBestMove]);

  const reset = useCallback(() => {
    setGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsAIThinking(false);
    setWhiteTime(600);
    setBlackTime(600);
    setShakeKey(0);
  }, []);

  return {
    game, selectedSquare, legalMoves, handleSquareClick,
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isGameOver: game.isGameOver(),
    turn: game.turn(),
    history: game.history(),
    isAIThinking, shakeKey,
    whiteTime, blackTime,
    reset,
  };
}