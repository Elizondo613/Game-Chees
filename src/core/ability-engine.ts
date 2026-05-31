// src/core/ability-engine.ts
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { AbilityEffect, PassiveEffect } from '../types/civilization.types';

// ── Utilidades ──────────────────────────────────────────────────────────────

function squareToCoords(sq: string): [number, number] {
  return [sq.charCodeAt(0) - 97, parseInt(sq[1]) - 1]; // [col 0-7, row 0-7]
}

function coordsToSquare(col: number, row: number): string | null {
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return String.fromCharCode(97 + col) + (row + 1);
}

// ── Efectos activos ──────────────────────────────────────────────────────────

export function applyActiveEffect(
  game: Chess,
  fromSquare: string,
  effect: AbilityEffect,
  color: 'w' | 'b',
): { newFen: string; affectedSquares: string[] } {
  const fen = game.fen();
  const affected: string[] = [];

  if (effect.type === 'aoe_capture') {
    const [col, row] = squareToCoords(fromSquare);
    const gameCopy = new Chess(fen);
    
    for (let dc = -effect.radius; dc <= effect.radius; dc++) {
      for (let dr = -effect.radius; dr <= effect.radius; dr++) {
        if (dc === 0 && dr === 0) continue;
        const target = coordsToSquare(col + dc, row + dr);
        if (!target) continue;
        const piece = gameCopy.get(target as Square);
        if (piece && piece.color !== color) {
          gameCopy.remove(target as Square);
          affected.push(target);
        }
      }
    }
      //Fuerza turno de negras en el FEN resultante
    const fenParts = gameCopy.fen().split(' ');
    fenParts[1] = 'b'; // turno de negras
    fenParts[3] = '-'; // limpia en passant
    const newFen = fenParts.join(' ');

    return { newFen, affectedSquares: affected };
  }

  /*if (effect.type === 'teleport') {
    const [col, row] = squareToCoords(fromSquare);
    const gameCopy = new Chess(fen);
    const piece = gameCopy.get(fromSquare as Square);
    if (!piece) return { newFen: fen, affectedSquares: [] };

    for (const [dc, dr] of effect.pattern) {
      const target = coordsToSquare(col + dc, row + dr);
      if (!target) continue;
      const targetPiece = gameCopy.get(target as Square);
      if (!targetPiece) {
        gameCopy.remove(fromSquare as Square);
        gameCopy.put(piece, target as Square);
        affected.push(target);
        break;
      }
    }
    return { newFen: gameCopy.fen(), affectedSquares: affected };
  }

  return { newFen: fen, affectedSquares: [] };*/

    if (effect.type === 'shield') {
    // El shield no modifica el tablero, solo fuerza turno de negras
    const fenParts = game.fen().split(' ');
    fenParts[1] = 'b';
    fenParts[3] = '-';
    const newFen = fenParts.join(' ');
    return { newFen, affectedSquares: [fromSquare] };
  }

  // Para cualquier otro efecto, fuerza turno de negras
  const fenParts = fen.split(' ');
  fenParts[1] = 'b';
  fenParts[3] = '-';
  return { newFen: fenParts.join(' '), affectedSquares: [] };
}

// ── Efectos pasivos ──────────────────────────────────────────────────────────

export function getPassiveMovementBonus(
  square: string,
  effect: PassiveEffect,
  allPieces: { square: string; color: string }[],
): number {
  if (effect.type !== 'aura_movement') return 0;

  const [col, row] = squareToCoords(square);
  for (const p of allPieces) {
    const [pc, pr] = squareToCoords(p.square);
    const dist = Math.max(Math.abs(pc - col), Math.abs(pr - row));
    if (dist <= effect.radius) return effect.bonus;
  }
  return 0;
}

// ── Casillas afectadas por AOE (para resaltar en UI) ────────────────────────

export function getAoeSquares(fromSquare: string, radius: number): string[] {
  const [col, row] = squareToCoords(fromSquare);
  const squares: string[] = [];
  for (let dc = -radius; dc <= radius; dc++) {
    for (let dr = -radius; dr <= radius; dr++) {
      if (dc === 0 && dr === 0) continue;
      const sq = coordsToSquare(col + dc, row + dr);
      if (sq) squares.push(sq);
    }
  }
  return squares;
}