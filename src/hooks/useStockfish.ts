// src/hooks/useStockfish.ts
import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

/**
 * onBestMove recibe la jugada y el FEN para el que se pidió, así el juego
 * puede descartar respuestas viejas (p. ej. si se reinició la partida).
 */
export function useStockfish(
  onBestMove: (move: string, fen: string) => void,
  skillLevel = 8,
  onEngineError?: () => void,
) {
  const workerRef = useRef<Worker | null>(null);
  const requestedFenRef = useRef<string | null>(null);
  const searchingRef = useRef(false);
  const skipRef = useRef(0);
  const onBestMoveRef = useRef(onBestMove);
  const onErrorRef = useRef(onEngineError);
  useLayoutEffect(() => {
    onBestMoveRef.current = onBestMove;
    onErrorRef.current = onEngineError;
  });

  const depth = skillLevel <= 2 ? 1 : skillLevel <= 8 ? 4 : 8;

  // Un solo worker durante toda la vida del componente
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/stockfish.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent) => {
      const msg = String(e.data);
      if (msg === 'engine-error') {
        searchingRef.current = false;
        onErrorRef.current?.();
        return;
      }
      if (!msg.startsWith('bestmove')) return;
      searchingRef.current = false;
      if (skipRef.current > 0) { skipRef.current--; return; }
      const move = msg.split(' ')[1];
      const fen = requestedFenRef.current;
      if (move && move !== '(none)' && fen) onBestMoveRef.current(move, fen);
    };
    return () => worker.terminate();
  }, []);

  const getBestMove = useCallback((fen: string, searchMoves?: string[]) => {
    const worker = workerRef.current;
    if (!worker) return;
    if (searchingRef.current) {
      // Hay una búsqueda vieja en curso: su bestmove se ignora
      worker.postMessage('stop');
      skipRef.current++;
    }
    requestedFenRef.current = fen;
    searchingRef.current = true;
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    worker.postMessage(`position fen ${fen}`);
    const restrict = searchMoves && searchMoves.length > 0 ? ` searchmoves ${searchMoves.join(' ')}` : '';
    worker.postMessage(`go depth ${depth}${restrict}`);
  }, [skillLevel, depth]);

  const cancelSearch = useCallback(() => {
    if (searchingRef.current) {
      workerRef.current?.postMessage('stop');
      skipRef.current++;
      searchingRef.current = false;
    }
    requestedFenRef.current = null;
  }, []);

  return { getBestMove, cancelSearch };
}
