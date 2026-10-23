// src/core/ai-abilities.ts
// Heurística sencilla para que la IA decida si usar una habilidad en vez de
// mover. Stockfish no conoce las habilidades, así que esto va aparte: se
// evalúa el material que gana cada opción contra lo que deja colgando.
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { ActiveAbility, Civilization } from '../types/civilization.types';
import {
  ALL_SQUARES, resolveAbility, getValidTargets, needsTarget, movesRespectingShields,
} from './ability-engine';
import type { AbilityOutcome, Side } from './ability-engine';

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const opposite = (s: Side): Side => (s === 'w' ? 'b' : 'w');

export interface AIAbilityPlan {
  from: string;
  ability: ActiveAbility;
  target?: string;
  outcome: AbilityOutcome;
  /** Ganancia neta estimada en peones */
  score: number;
}

/** Valor de la pieza propia más valiosa que está atacada y sin defensa */
function hangingValue(chess: Chess, side: Side, prot: ReadonlySet<string>): number {
  const enemy = opposite(side);
  let worst = 0;
  for (const sq of ALL_SQUARES) {
    const p = chess.get(sq as Square);
    if (!p || p.color !== side || p.type === 'k' || prot.has(sq)) continue;
    if (chess.isAttacked(sq as Square, enemy) && !chess.isAttacked(sq as Square, side)) {
      worst = Math.max(worst, VALUE[p.type]);
    }
  }
  return worst;
}

/** ¿La pieza en `sq` puede huir con una jugada normal a una casilla no atacada? */
function canEscape(chess: Chess, sq: string, side: Side): boolean {
  for (const m of chess.moves({ square: sq as Square, verbose: true })) {
    const after = new Chess(chess.fen());
    after.move({ from: m.from, to: m.to, promotion: m.promotion ?? 'q' });
    if (!after.isAttacked(m.to as Square, opposite(side))) return true;
  }
  return false;
}

/** La mejor captura "gratis" (pieza sin defensa) que tiene el bando con una jugada normal */
function bestFreeCapture(chess: Chess, side: Side, prot: ReadonlySet<string>): number {
  const allowed = new Set(movesRespectingShields(chess.fen(), prot));
  let best = 0;
  for (const m of chess.moves({ verbose: true })) {
    if (!m.captured || !allowed.has(m.from + m.to + (m.promotion ?? ''))) continue;
    const defended = chess.isAttacked(m.to as Square, opposite(side));
    best = Math.max(best, defended ? VALUE[m.captured] - VALUE[m.piece] : VALUE[m.captured]);
  }
  return best;
}

export function planAIAbility(
  fen: string,
  civ: Civilization,
  side: Side,
  cooldowns: Record<string, number>,
  prot: ReadonlySet<string>,
): AIAbilityPlan | null {
  const chess = new Chess(fen);
  if (chess.turn() !== side) return null;

  let best: AIAbilityPlan | null = null;

  for (const from of ALL_SQUARES) {
    const piece = chess.get(from as Square);
    if (!piece || piece.color !== side) continue;
    const ability = civ.pieces.find(p => p.replaces === piece.type.toUpperCase())?.activeAbility;
    if (!ability || (cooldowns[ability.id] ?? 0) > 0) continue;
    const effect = ability.effect;
    if (effect.type === 'swap') continue; // posicional: mejor dejárselo a Stockfish

    const targets = needsTarget(effect)
      ? getValidTargets(fen, from, effect, side, prot)
      : [undefined];

    for (const target of targets) {
      const r = resolveAbility(fen, from, effect, side, target, prot);
      if (!r.ok) continue;
      const out = r.outcome;

      let gain = 0;
      for (const sq of out.captured) gain += VALUE[chess.get(sq as Square)?.type ?? 'k'];
      gain += out.converted.length * 2; // un peón menos para él, uno más para mí

      // Defensas: solo valen si salvan una pieza colgando que no puede huir
      // moviéndose (si puede huir, mejor que Stockfish la mueva)
      const trapped = (sq: string) => {
        const p = chess.get(sq as Square);
        return !!p && !prot.has(sq) && chess.isAttacked(sq as Square, opposite(side))
          && !chess.isAttacked(sq as Square, side) && !canEscape(chess, sq, side);
      };
      for (const sq of out.shielded) {
        if (trapped(sq)) gain += VALUE[chess.get(sq as Square)!.type];
      }
      // Teleport: mismo criterio, como escape de una pieza atrapada
      if (effect.type === 'teleport') {
        if (!trapped(from)) continue;
        gain += VALUE[piece.type] * 0.8;
      }
      if (gain <= 0) continue;

      const after = new Chess(out.fen);
      const afterProt = new Set([...prot, ...out.shielded].filter(sq => !out.captured.includes(sq)));
      for (const [f, t] of out.moved) if (afterProt.delete(f)) afterProt.add(t);
      let score = gain - hangingValue(after, side, afterProt);
      if (after.isCheckmate()) score += 100;

      if (!best || score > best.score) best = { from, ability, target, outcome: out, score };
    }
  }

  if (!best || best.score < 1) return null;
  // Si con una jugada normal gana lo mismo o más, que juegue Stockfish
  if (bestFreeCapture(chess, side, prot) >= best.score) return null;
  return best;
}
