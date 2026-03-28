// src/workers/stockfish.worker.ts

const STOCKFISH_URL = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

let engine: Worker | null = null;

async function init() {
  // Descargamos el script y lo ejecutamos como blob
  const response = await fetch(STOCKFISH_URL);
  const text = await response.text();
  const blob = new Blob([text], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  engine = new Worker(url);
  
  engine.onmessage = (e: MessageEvent) => {
    self.postMessage(e.data);
  };

  engine.postMessage('uci');
  engine.postMessage('setoption name Skill Level value 8');
  engine.postMessage('isready');
}

self.onmessage = (e: MessageEvent) => {
  engine?.postMessage(e.data);
};

init();