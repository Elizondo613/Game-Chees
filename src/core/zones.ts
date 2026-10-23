// src/core/zones.ts
import type { BoardZone, Civilization } from '../types/civilization.types';

export function zoneAt(civ: Civilization, square: string): BoardZone | undefined {
  return civ.boardZones?.find(z => z.squares.includes(square));
}

/** Casillas donde nadie puede ser capturado */
export function immuneSquares(civ: Civilization): Set<string> {
  return new Set(
    (civ.boardZones ?? [])
      .filter(z => z.effect.type === 'capture_immunity')
      .flatMap(z => z.squares),
  );
}

/** Turnos que se descuentan al enfriamiento si la habilidad se usa desde `square` */
export function cooldownBoostAt(civ: Civilization, square: string): number {
  const z = zoneAt(civ, square);
  return z?.effect.type === 'cooldown_boost' ? z.effect.value : 0;
}
