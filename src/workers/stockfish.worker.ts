// src/workers/stockfish.worker.ts
// Descarga Stockfish desde el CDN, lo ejecuta como worker clásico (blob) y
// reenvía los mensajes. Los comandos que llegan antes de que el motor esté
// listo se guardan en cola en lugar de perderse.

const STOCKFISH_URL = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

let engine: Worker | null = null;
const queue: string[] = [];

async function init() {
  try {
    const response = await fetch(STOCKFISH_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const blob = new Blob([text], { type: 'application/javascript' });
    engine = new Worker(URL.createObjectURL(blob));

    engine.onmessage = (e: MessageEvent) => self.postMessage(e.data);
    engine.onerror = () => self.postMessage('engine-error');

    engine.postMessage('uci');
    engine.postMessage('isready');
    while (queue.length) engine.postMessage(queue.shift()!);
  } catch {
    self.postMessage('engine-error');
  }
}

self.onmessage = (e: MessageEvent) => {
  if (engine) engine.postMessage(e.data);
  else queue.push(e.data);
};

init();
