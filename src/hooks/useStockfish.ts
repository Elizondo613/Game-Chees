// src/hooks/useStockfish.ts
import { useEffect, useRef, useCallback } from 'react';

export function useStockfish(onBestMove: (move: string) => void, skillLevel = 8) {
  const workerRef = useRef<Worker | null>(null);
  const depthRef = useRef(skillLevel <= 2 ? 1 : skillLevel <= 8 ? 4 : 8);

  useEffect(() => {
    depthRef.current = skillLevel <= 2 ? 1 : skillLevel <= 8 ? 4 : 8;
    workerRef.current?.postMessage(`setoption name Skill Level value ${skillLevel}`);
  }, [skillLevel]);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/stockfish.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent) => {
      const msg: string = e.data;
      if (msg.startsWith('bestmove')) {
        const move = msg.split(' ')[1];
        if (move && move !== '(none)') onBestMove(move);
      }
    };
    return () => worker.terminate();
  }, [onBestMove]);

  const getBestMove = useCallback((fen: string) => {
    const worker = workerRef.current;
    if (!worker) return;
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depthRef.current}`);
  }, [skillLevel]);

  return { getBestMove };
}