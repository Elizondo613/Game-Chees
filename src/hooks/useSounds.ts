// src/hooks/useSounds.ts
import { useCallback, useRef } from 'react';

function createAudioContext() {
  const AudioCtx = (window.AudioContext || 
  (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)!;
    return new AudioCtx();
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = createAudioContext();
    return ctxRef.current;
  }

  const playMove = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }, []);

  const playCapture = useCallback(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  }, []);

  const playCheck = useCallback(() => {
    const ctx = getCtx();
    [0, 0.12].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  }, []);

  const playCheckmate = useCallback(() => {
    const ctx = getCtx();
    [0, 0.2, 0.4, 0.7].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      const freqs = [523, 440, 349, 262];
      osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  }, []);

  return { playMove, playCapture, playCheck, playCheckmate };
}