// Pruebas del motor de habilidades: npx tsx tests/ability-engine.test.ts
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  resolveAbility, getValidTargets, getPreviewSquares, movesRespectingShields,
} from '../src/core/ability-engine';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log('  ✓', name);
}

test('AOE nunca captura al rey', () => {
  const r = resolveAbility('4k3/3pQ3/8/8/8/8/8/4K3 w - - 0 1', 'e7', { type: 'aoe_capture', radius: 1 }, 'w');
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.outcome.captured, ['d7']);
    assert.ok(new Chess(r.outcome.fen).get('e8'), 'el rey sigue');
    assert.equal(new Chess(r.outcome.fen).turn(), 'b');
  }
});

test('AOE sin enemigos en rango no gasta la habilidad', () => {
  const r = resolveAbility('4k3/8/8/8/8/8/8/4K2Q w - - 0 1', 'h1', { type: 'aoe_capture', radius: 1 }, 'w');
  assert.equal(r.ok, false);
});

test('No se puede usar una habilidad que deja tu rey en jaque', () => {
  const fen = '4k3/8/8/8/1b6/8/8/4K2R w K - 0 1';
  const r = resolveAbility(fen, 'h1', { type: 'shield', turns: 2, range: 0 }, 'w');
  assert.equal(r.ok, false);
});

test('Una captura a distancia que quita el jaque sí es válida', () => {
  const fen = '4k3/8/8/8/1b6/8/8/R3K3 w Q - 0 1';
  const targets = getValidTargets(fen, 'a1', { type: 'ranged_capture', range: 4, pattern: 'any' }, 'w');
  assert.deepEqual(targets, ['b4']);
});

test('Derechos de enroque se limpian si la torre desaparece', () => {
  const fen = 'r3k2r/8/8/8/8/8/6Q1/4K3 w kq - 0 1';
  const r = resolveAbility(fen, 'g2', { type: 'ranged_capture', range: 7, pattern: 'diagonal' }, 'w', 'a8');
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.outcome.fen.split(' ')[2], 'k');
});

test('Teleport no puede dejar un peón en la última fila', () => {
  const t = getValidTargets('4k3/8/8/8/8/8/1P6/4K3 w - - 0 1', 'b2', { type: 'teleport', range: 7 }, 'w');
  assert.ok(t.length > 0);
  assert.ok(t.every(sq => sq[1] !== '1' && sq[1] !== '8'));
});

test('Swap no puede mandar un peón a la primera fila', () => {
  const t = getValidTargets('4k3/8/8/8/8/8/3P4/3QK3 w - - 0 1', 'd2', { type: 'swap', range: 1 }, 'w');
  assert.deepEqual(t, []);
});

test('Convert transforma un peón enemigo adyacente', () => {
  const r = resolveAbility('4k3/8/8/3p4/4Q3/8/8/4K3 w - - 0 1', 'e4', { type: 'convert', range: 1 }, 'w', 'd5');
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(new Chess(r.outcome.fen).get('d5'), { type: 'p', color: 'w' });
});

test('Aura shield protege a la pieza y a sus vecinos', () => {
  const s = getPreviewSquares('4k3/8/8/8/8/8/3PPP2/3QK3 w - - 0 1', 'd1', { type: 'aura_shield', turns: 2 }, 'w');
  assert.deepEqual(s.sort(), ['d1', 'd2', 'e1', 'e2'].sort());
});

test('La IA no puede capturar piezas con escudo (incluido en passant)', () => {
  const fen = '4k3/8/8/3Pp3/8/8/8/4K3 b - - 0 1';
  const all = movesRespectingShields(fen, new Set());
  assert.ok(all.length > 0);
  const ep = '4k3/8/8/8/3pP3/8/8/4K3 b - e3 0 1';
  assert.ok(movesRespectingShields(ep, new Set()).includes('d4e3'));
  assert.ok(!movesRespectingShields(ep, new Set(['e4'])).includes('d4e3'));
});

test('El turno pasa al rival y el FEN es válido tras cada efecto', () => {
  const start = new Chess().fen();
  const r = resolveAbility(start, 'b1', { type: 'teleport', range: 3 }, 'w', 'b4');
  assert.ok(r.ok);
  if (r.ok) {
    const c = new Chess(r.outcome.fen);
    assert.equal(c.turn(), 'b');
    assert.ok(c.moves().length > 0);
  }
});

console.log(`\n${passed} pruebas OK`);
