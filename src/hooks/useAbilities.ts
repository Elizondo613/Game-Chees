// src/hooks/useAbilities.ts
import { useState, useCallback, useMemo } from 'react';
import type { Move } from 'chess.js';
import type { Civilization, ActiveAbility } from '../types/civilization.types';
import {
  resolveAbility, getValidTargets, getPreviewSquares,
  needsTarget, isInstantDefense,
} from '../core/ability-engine';
import type { AbilityOutcome, Side } from '../core/ability-engine';
import { immuneSquares, cooldownBoostAt } from '../core/zones';

export interface PendingAbility {
  from: string;
  ability: ActiveAbility;
  /** Casillas clicables (habilidades con objetivo) */
  targets: string[];
  /** Casillas que se verán afectadas (habilidades de área) */
  preview: string[];
}

export interface AbilityUse {
  side: Side;
  from: string;
  ability: ActiveAbility;
  outcome: AbilityOutcome;
}

export interface Shield {
  side: Side;
  /** Turnos del rival que faltan para que caiga el escudo */
  turns: number;
}

export interface AbilityState {
  /** Enfriamiento por bando: abilityId -> turnos restantes */
  cooldowns: Record<Side, Record<string, number>>;
  /** casilla -> escudo. El escudo viaja con la pieza. */
  shields: Record<string, Shield>;
  /** Solo para el jugador humano (blancas) */
  pending: PendingAbility | null;
  error: string | null;
}

const INITIAL: AbilityState = {
  cooldowns: { w: {}, b: {} },
  shields: {},
  pending: null,
  error: null,
};

const opposite = (s: Side): Side => (s === 'w' ? 'b' : 'w');

export function useAbilities(civilization: Civilization) {
  const [state, setState] = useState<AbilityState>(INITIAL);

  const zoneImmunity = useMemo(() => immuneSquares(civilization), [civilization]);

  /** Escudos + zonas de inmunidad: lo que nadie puede capturar ahora mismo */
  const protectedSquares = useMemo(
    () => new Set([...Object.keys(state.shields), ...zoneImmunity]),
    [state.shields, zoneImmunity],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  /**
   * Se llama cuando `side` termina su turno (jugada o habilidad). Bajan los
   * enfriamientos y escudos del RIVAL: así "2 turnos" siempre significa dos
   * turnos del oponente, juegue quien juegue.
   */
  const endTurn = useCallback((side: Side) => {
    const other = opposite(side);
    setState(prev => {
      const cds: Record<string, number> = {};
      for (const [id, cd] of Object.entries(prev.cooldowns[other])) {
        if (cd > 1) cds[id] = cd - 1;
      }
      const shields: Record<string, Shield> = {};
      for (const [sq, sh] of Object.entries(prev.shields)) {
        if (sh.side !== other) shields[sq] = sh;
        else if (sh.turns > 1) shields[sq] = { ...sh, turns: sh.turns - 1 };
      }
      return { ...prev, cooldowns: { ...prev.cooldowns, [other]: cds }, shields };
    });
  }, []);

  const abilityFor = useCallback((pieceType: string): ActiveAbility | undefined => {
    const role = pieceType.toUpperCase();
    return civilization.pieces.find(p => p.replaces === role)?.activeAbility;
  }, [civilization]);

  const getCooldown = useCallback(
    (abilityId: string, side: Side = 'w') => state.cooldowns[side][abilityId] ?? 0,
    [state.cooldowns],
  );

  const isShielded = useCallback(
    (square: string) => !!state.shields[square],
    [state.shields],
  );

  const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), []);

  const cancel = useCallback(() => setState(prev => ({ ...prev, pending: null })), []);

  /** Registra el uso: enfriamiento + escudos nuevos + escudos que siguen a su pieza */
  const commit = useCallback((use: AbilityUse) => {
    const { side, from, ability, outcome } = use;
    const cd = Math.max(1, ability.cooldownTurns - cooldownBoostAt(civilization, from));
    setState(prev => {
      const shields = { ...prev.shields };
      for (const sq of outcome.captured) delete shields[sq];
      for (const sq of outcome.converted) delete shields[sq];
      // Traslados (teleport / swap): leemos todo antes de escribir
      const carried = outcome.moved.map(([f, to]) => [to, shields[f]] as const);
      for (const [f] of outcome.moved) delete shields[f];
      for (const [to, sh] of carried) if (sh) shields[to] = sh;
      for (const sq of outcome.shielded) {
        shields[sq] = { side, turns: Math.max(shields[sq]?.turns ?? 0, outcome.shieldTurns) };
      }
      return {
        ...prev,
        shields,
        cooldowns: { ...prev.cooldowns, [side]: { ...prev.cooldowns[side], [ability.id]: cd } },
        pending: null,
        error: null,
      };
    });
  }, [civilization]);

  /**
   * Botón "Activar" (jugador). Devuelve el uso si se resolvió al instante
   * (defensas), o null si quedó pendiente / falló.
   */
  const activate = useCallback((fen: string, from: string): AbilityUse | null => {
    const side: Side = 'w';
    const pieceType = pieceTypeAt(fen, from);
    const ability = pieceType ? abilityFor(pieceType) : undefined;
    if (!ability) return null;
    const fail = (reason: string) => {
      setState(prev => ({ ...prev, error: reason, pending: null }));
      return null;
    };

    if (isInstantDefense(ability.effect)) {
      const r = resolveAbility(fen, from, ability.effect, side, undefined, protectedSquares);
      if (!r.ok) return fail(r.reason);
      const use: AbilityUse = { side, from, ability, outcome: r.outcome };
      commit(use);
      return use;
    }

    if (needsTarget(ability.effect)) {
      const targets = getValidTargets(fen, from, ability.effect, side, protectedSquares);
      if (targets.length === 0) return fail('No hay objetivos válidos en rango');
      setState(prev => ({ ...prev, error: null, pending: { from, ability, targets, preview: [] } }));
      return null;
    }

    // Área de efecto: mostramos qué caería y esperamos confirmación
    const r = resolveAbility(fen, from, ability.effect, side, undefined, protectedSquares);
    if (!r.ok) return fail(r.reason);
    const preview = getPreviewSquares(fen, from, ability.effect, side, protectedSquares);
    setState(prev => ({ ...prev, error: null, pending: { from, ability, targets: [], preview } }));
    return null;
  }, [abilityFor, commit, protectedSquares]);

  /** Confirma la habilidad pendiente del jugador (con objetivo si lo necesita) */
  const confirm = useCallback((fen: string, target?: string): AbilityUse | null => {
    const pending = state.pending;
    if (!pending) return null;
    if (needsTarget(pending.ability.effect) && (!target || !pending.targets.includes(target))) {
      return null;
    }
    const r = resolveAbility(fen, pending.from, pending.ability.effect, 'w', target, protectedSquares);
    if (!r.ok) {
      setState(prev => ({ ...prev, error: r.reason, pending: null }));
      return null;
    }
    const use: AbilityUse = { side: 'w', from: pending.from, ability: pending.ability, outcome: r.outcome };
    commit(use);
    return use;
  }, [state.pending, commit, protectedSquares]);

  /** Mantiene los escudos pegados a su pieza en jugadas normales */
  const onMove = useCallback((move: Move) => {
    setState(prev => {
      if (Object.keys(prev.shields).length === 0) return prev;
      const shields = { ...prev.shields };
      // Si capturaron algo protegido (solo pasa si el escudo tuvo que ceder)
      delete shields[move.to];
      if (move.flags.includes('e')) delete shields[move.to[0] + move.from[1]];
      if (shields[move.from]) {
        shields[move.to] = shields[move.from];
        delete shields[move.from];
      }
      // Enroque: la torre también se mueve
      const rank = move.from[1];
      const rookMove = move.flags.includes('k') ? [`h${rank}`, `f${rank}`]
        : move.flags.includes('q') ? [`a${rank}`, `d${rank}`] : null;
      if (rookMove && shields[rookMove[0]]) {
        shields[rookMove[1]] = shields[rookMove[0]];
        delete shields[rookMove[0]];
      }
      return { ...prev, shields };
    });
  }, []);

  return {
    state,
    protectedSquares,
    reset,
    endTurn,
    activate,
    confirm,
    commit,
    cancel,
    clearError,
    onMove,
    abilityFor,
    getCooldown,
    isShielded,
  };
}

function pieceTypeAt(fen: string, square: string): string | null {
  const rows = fen.split(' ')[0].split('/');
  const rank = Number(square[1]);
  const file = square.charCodeAt(0) - 97;
  let col = 0;
  for (const ch of rows[8 - rank]) {
    if (/\d/.test(ch)) { col += Number(ch); continue; }
    if (col === file) return ch.toLowerCase();
    col++;
  }
  return null;
}
