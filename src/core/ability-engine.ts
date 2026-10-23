// src/core/ability-engine.ts
// Motor puro de habilidades: no sabe nada de React. Recibe un FEN y devuelve
// el FEN resultante (con el turno ya pasado al rival) o el motivo por el que
// la habilidad no se puede usar.
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { AbilityEffect } from '../types/civilization.types';

export type Side = 'w' | 'b';

export interface AbilityOutcome {
  fen: string;
  /** Casillas cuyas piezas enemigas fueron eliminadas */
  captured: string[];
  /** Casillas que reciben escudo */
  shielded: string[];
  shieldTurns: number;
  /** Piezas que cambiaron de casilla (para que los escudos las sigan) */
  moved: Array<[from: string, to: string]>;
  /** Casillas donde una pieza cambió de bando */
  converted: string[];
}

export type AbilityResult =
  | { ok: true; outcome: AbilityOutcome }
  | { ok: false; reason: string };

// ── Utilidades de coordenadas ───────────────────────────────────────────────

const FILES = 'abcdefgh';

export const ALL_SQUARES: string[] = Array.from({ length: 64 }, (_, i) =>
  FILES[i % 8] + String(Math.floor(i / 8) + 1),
);

function toXY(sq: string): [number, number] {
  return [sq.charCodeAt(0) - 97, Number(sq[1]) - 1];
}

function chebyshev(a: string, b: string): number {
  const [ax, ay] = toXY(a);
  const [bx, by] = toXY(b);
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function inPattern(from: string, to: string, range: number,
  pattern: 'any' | 'orthogonal' | 'diagonal'): boolean {
  if (from === to) return false;
  const [fx, fy] = toXY(from);
  const [tx, ty] = toXY(to);
  const dx = Math.abs(fx - tx);
  const dy = Math.abs(fy - ty);
  if (Math.max(dx, dy) > range) return false;
  if (pattern === 'orthogonal') return dx === 0 || dy === 0;
  if (pattern === 'diagonal') return dx === dy;
  return true;
}

const NONE: ReadonlySet<string> = new Set();

const INVALID: AbilityResult = { ok: false, reason: 'Posición inválida' };

const opposite = (s: Side): Side => (s === 'w' ? 'b' : 'w');
const isBackRank = (sq: string) => sq[1] === '1' || sq[1] === '8';

// ── Clasificación de efectos ────────────────────────────────────────────────

/** ¿El jugador debe elegir una casilla objetivo en el tablero? */
export function needsTarget(effect: AbilityEffect): boolean {
  switch (effect.type) {
    case 'ranged_capture':
    case 'teleport':
    case 'convert':
    case 'swap':
      return true;
    case 'shield':
      return effect.range > 0;
    default:
      return false;
  }
}

/** ¿Es un efecto defensivo que se aplica al instante, sin confirmar? */
export function isInstantDefense(effect: AbilityEffect): boolean {
  return effect.type === 'aura_shield' || (effect.type === 'shield' && effect.range === 0);
}

// ── Candidatos geométricos (aún sin validar legalidad) ──────────────────────

function candidateTargets(
  chess: Chess, from: string, effect: AbilityEffect, side: Side, prot: ReadonlySet<string>,
): string[] {
  const enemy = opposite(side);
  return ALL_SQUARES.filter(sq => {
    const p = chess.get(sq as Square);
    switch (effect.type) {
      case 'ranged_capture':
        return !!p && p.color === enemy && p.type !== 'k' && !prot.has(sq)
          && (!effect.pawnsOnly || p.type === 'p')
          && inPattern(from, sq, effect.range, effect.pattern);
      case 'convert':
        return !!p && p.color === enemy && p.type === 'p' && !prot.has(sq)
          && chebyshev(from, sq) <= effect.range;
      case 'swap':
        return !!p && p.color === side && p.type !== 'k' && sq !== from
          && chebyshev(from, sq) <= effect.range;
      case 'teleport':
        return !p && chebyshev(from, sq) <= effect.range;
      case 'shield':
        return !!p && p.color === side && chebyshev(from, sq) <= effect.range;
      default:
        return false;
    }
  });
}

// ── Cierre de la posición: pasar turno + validar ────────────────────────────

function finalize(chess: Chess, original: string, side: Side, hadCapture: boolean): AbilityResult {
  // Ningún peón puede quedar en la primera/última fila
  for (const sq of ALL_SQUARES) {
    const p = chess.get(sq as Square);
    if (p?.type === 'p' && isBackRank(sq)) {
      return { ok: false, reason: 'Un peón no puede quedar en la primera o última fila' };
    }
  }

  // Ambos reyes deben seguir en el tablero
  const kings = ALL_SQUARES.filter(sq => chess.get(sq as Square)?.type === 'k');
  if (kings.length !== 2) return { ok: false, reason: 'Posición inválida' };

  // Tu rey no puede quedar atacado (equivale a "no puedes dejarte en jaque")
  const myKing = kings.find(sq => chess.get(sq as Square)?.color === side)!;
  if (chess.isAttacked(myKing as Square, opposite(side))) {
    return { ok: false, reason: 'Tu rey quedaría en jaque' };
  }

  const [, , castling, , halfmove, fullmove] = original.split(' ');
  const board = chess.fen().split(' ')[0];

  // Derechos de enroque: solo se conservan si rey y torre siguen en su sitio
  const at = (sq: string, type: string, color: Side) => {
    const p = chess.get(sq as Square);
    return !!p && p.type === type && p.color === color;
  };
  let rights = '';
  if (castling.includes('K') && at('e1', 'k', 'w') && at('h1', 'r', 'w')) rights += 'K';
  if (castling.includes('Q') && at('e1', 'k', 'w') && at('a1', 'r', 'w')) rights += 'Q';
  if (castling.includes('k') && at('e8', 'k', 'b') && at('h8', 'r', 'b')) rights += 'k';
  if (castling.includes('q') && at('e8', 'k', 'b') && at('a8', 'r', 'b')) rights += 'q';

  const nextHalf = hadCapture ? 0 : Number(halfmove) + 1;
  const nextFull = side === 'b' ? Number(fullmove) + 1 : Number(fullmove);
  const fen = `${board} ${opposite(side)} ${rights || '-'} - ${nextHalf} ${nextFull}`;

  try {
    new Chess(fen);
  } catch {
    return { ok: false, reason: 'Posición inválida' };
  }

  return {
    ok: true,
    outcome: { fen, captured: [], shielded: [], shieldTurns: 0, moved: [], converted: [] },
  };
}

// ── Resolución ──────────────────────────────────────────────────────────────

/**
 * @param prot casillas cuyas piezas no pueden ser capturadas ni convertidas
 *             (escudos activos y zonas de inmunidad)
 */
export function resolveAbility(
  fen: string,
  from: string,
  effect: AbilityEffect,
  side: Side,
  target?: string,
  prot: ReadonlySet<string> = NONE,
): AbilityResult {
  const chess = new Chess(fen);
  const self = chess.get(from as Square);
  if (!self || self.color !== side) return { ok: false, reason: 'Esa pieza ya no está ahí' };
  if (chess.turn() !== side) return { ok: false, reason: 'No es tu turno' };

  if (needsTarget(effect)) {
    if (!target) return { ok: false, reason: 'Elige un objetivo' };
    if (!candidateTargets(chess, from, effect, side, prot).includes(target)) {
      return { ok: false, reason: 'Objetivo fuera de alcance' };
    }
  }

  const captured: string[] = [];
  const shielded: string[] = [];
  const moved: Array<[string, string]> = [];
  const converted: string[] = [];
  let shieldTurns = 0;

  switch (effect.type) {
    case 'aoe_capture': {
      const enemy = opposite(side);
      for (const sq of ALL_SQUARES) {
        if (sq === from || chebyshev(from, sq) > effect.radius) continue;
        const p = chess.get(sq as Square);
        if (p && p.color === enemy && p.type !== 'k' && !prot.has(sq)
          && (!effect.pawnsOnly || p.type === 'p')) {
          chess.remove(sq as Square);
          captured.push(sq);
        }
      }
      if (captured.length === 0) return { ok: false, reason: 'No hay enemigos en rango' };
      break;
    }
    case 'ranged_capture': {
      chess.remove(target as Square);
      captured.push(target!);
      break;
    }
    case 'convert': {
      chess.remove(target as Square);
      if (!chess.put({ type: 'p', color: side }, target as Square)) return INVALID;
      converted.push(target!);
      break;
    }
    case 'teleport': {
      chess.remove(from as Square);
      if (!chess.put(self, target as Square)) return INVALID;
      moved.push([from, target!]);
      break;
    }
    case 'swap': {
      const other = chess.get(target as Square)!;
      chess.remove(from as Square);
      chess.remove(target as Square);
      if (!chess.put(self, target as Square) || !chess.put(other, from as Square)) return INVALID;
      moved.push([from, target!], [target!, from]);
      break;
    }
    case 'shield': {
      shielded.push(effect.range > 0 ? target! : from);
      shieldTurns = effect.turns;
      break;
    }
    case 'aura_shield': {
      for (const sq of ALL_SQUARES) {
        const p = chess.get(sq as Square);
        if (p && p.color === side && chebyshev(from, sq) <= 1) shielded.push(sq);
      }
      shieldTurns = effect.turns;
      break;
    }
  }

  const result = finalize(chess, fen, side, captured.length > 0);
  if (!result.ok) return result;
  return {
    ok: true,
    outcome: { ...result.outcome, captured, shielded, shieldTurns, moved, converted },
  };
}

/** Casillas que el jugador puede elegir, ya filtradas por legalidad */
export function getValidTargets(
  fen: string, from: string, effect: AbilityEffect, side: Side, prot: ReadonlySet<string> = NONE,
): string[] {
  if (!needsTarget(effect)) return [];
  const chess = new Chess(fen);
  return candidateTargets(chess, from, effect, side, prot)
    .filter(t => resolveAbility(fen, from, effect, side, t, prot).ok);
}

/** Casillas que se verían afectadas por un efecto sin objetivo (vista previa) */
export function getPreviewSquares(
  fen: string, from: string, effect: AbilityEffect, side: Side, prot: ReadonlySet<string> = NONE,
): string[] {
  if (needsTarget(effect)) return [];
  const r = resolveAbility(fen, from, effect, side, undefined, prot);
  if (!r.ok) return [];
  return effect.type === 'aoe_capture' ? r.outcome.captured : r.outcome.shielded;
}

// ── Escudos y la IA ─────────────────────────────────────────────────────────

/**
 * Movimientos legales (en notación UCI) que NO capturan una pieza protegida.
 * Se le pasan a Stockfish con `go searchmoves ...` para que respete los escudos.
 * Si TODAS las jugadas legales capturan algo protegido, se devuelven todas
 * (el escudo cede antes que dejar a alguien sin poder mover).
 */
export function movesRespectingShields(fen: string, shielded: ReadonlySet<string>): string[] {
  const chess = new Chess(fen);
  const allowed = chess.moves({ verbose: true })
    .filter(m => {
      if (!m.captured) return true;
      // En passant: la pieza capturada no está en la casilla destino
      const capturedSq = m.flags.includes('e') ? m.to[0] + m.from[1] : m.to;
      return !shielded.has(capturedSq);
    })
    .map(m => m.from + m.to + (m.promotion ?? ''));
  if (allowed.length > 0) return allowed;
  return chess.moves({ verbose: true }).map(m => m.from + m.to + (m.promotion ?? ''));
}
