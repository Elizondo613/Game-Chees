// src/hooks/useAbilities.ts
import { useState, useCallback } from 'react';
import type { Move } from 'chess.js';
import type { Civilization, ActiveAbility } from '../types/civilization.types';
import {
  resolveAbility, getValidTargets, getPreviewSquares,
  needsTarget, isInstantDefense,
} from '../core/ability-engine';
import type { AbilityOutcome, Side } from '../core/ability-engine';

export interface PendingAbility {
  from: string;
  ability: ActiveAbility;
  /** Casillas clicables (habilidades con objetivo) */
  targets: string[];
  /** Casillas que se verán afectadas (habilidades de área) */
  preview: string[];
}

export interface AbilityUse {
  ability: ActiveAbility;
  outcome: AbilityOutcome;
}

export interface AbilityState {
  /** abilityId -> rondas que faltan (compartido por todas las piezas del mismo tipo) */
  cooldowns: Record<string, number>;
  /** casilla -> turnos de escudo restantes. El escudo viaja con la pieza. */
  shields: Record<string, number>;
  pending: PendingAbility | null;
  error: string | null;
}

const INITIAL: AbilityState = { cooldowns: {}, shields: {}, pending: null, error: null };

export function useAbilities(civilization: Civilization) {
  const [state, setState] = useState<AbilityState>(INITIAL);

  const reset = useCallback(() => setState(INITIAL), []);

  /** Se llama una vez por ronda (después de que responde la IA) */
  const tick = useCallback(() => {
    setState(prev => {
      const cooldowns: Record<string, number> = {};
      for (const [id, cd] of Object.entries(prev.cooldowns)) {
        if (cd > 1) cooldowns[id] = cd - 1;
      }
      const shields: Record<string, number> = {};
      for (const [sq, t] of Object.entries(prev.shields)) {
        if (t > 1) shields[sq] = t - 1;
      }
      return { ...prev, cooldowns, shields };
    });
  }, []);

  const abilityFor = useCallback((pieceType: string): ActiveAbility | undefined => {
    const role = pieceType.toUpperCase();
    return civilization.pieces.find(p => p.replaces === role)?.activeAbility;
  }, [civilization]);

  const getCooldown = useCallback(
    (abilityId: string) => state.cooldowns[abilityId] ?? 0,
    [state.cooldowns],
  );

  const isShielded = useCallback(
    (square: string) => (state.shields[square] ?? 0) > 0,
    [state.shields],
  );

  const shieldedSquares = useCallback(
    () => new Set(Object.keys(state.shields)),
    [state.shields],
  );

  const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), []);

  const cancel = useCallback(() => setState(prev => ({ ...prev, pending: null })), []);

  /** Registra el uso: cooldown + escudos nuevos + escudos que se mueven con su pieza */
  const commit = useCallback((ability: ActiveAbility, outcome: AbilityOutcome) => {
    setState(prev => {
      const shields = { ...prev.shields };
      for (const sq of outcome.captured) delete shields[sq];
      // Traslados (teleport / swap): leemos todo antes de escribir
      const carried = outcome.moved.map(([from, to]) => [to, shields[from]] as const);
      for (const [from] of outcome.moved) delete shields[from];
      for (const [to, turns] of carried) if (turns) shields[to] = turns;
      for (const sq of outcome.shielded) {
        shields[sq] = Math.max(shields[sq] ?? 0, outcome.shieldTurns);
      }
      return {
        ...prev,
        shields,
        cooldowns: { ...prev.cooldowns, [ability.id]: ability.cooldownTurns },
        pending: null,
        error: null,
      };
    });
  }, []);

  /**
   * Botón "Activar". Devuelve el resultado si la habilidad se resolvió al
   * instante (defensas), o null si quedó pendiente / falló.
   */
  const activate = useCallback((fen: string, from: string, side: Side): AbilityUse | null => {
    const pieceType = pieceTypeAt(fen, from);
    const ability = pieceType ? abilityFor(pieceType) : undefined;
    if (!ability) return null;

    if (isInstantDefense(ability.effect)) {
      const r = resolveAbility(fen, from, ability.effect, side);
      if (!r.ok) {
        setState(prev => ({ ...prev, error: r.reason, pending: null }));
        return null;
      }
      commit(ability, r.outcome);
      return { ability, outcome: r.outcome };
    }

    if (needsTarget(ability.effect)) {
      const targets = getValidTargets(fen, from, ability.effect, side);
      if (targets.length === 0) {
        setState(prev => ({ ...prev, error: 'No hay objetivos válidos en rango', pending: null }));
        return null;
      }
      setState(prev => ({ ...prev, error: null, pending: { from, ability, targets, preview: [] } }));
      return null;
    }

    // Área de efecto: mostramos qué caería y esperamos confirmación
    const r = resolveAbility(fen, from, ability.effect, side);
    if (!r.ok) {
      setState(prev => ({ ...prev, error: r.reason, pending: null }));
      return null;
    }
    const preview = getPreviewSquares(fen, from, ability.effect, side);
    setState(prev => ({ ...prev, error: null, pending: { from, ability, targets: [], preview } }));
    return null;
  }, [abilityFor, commit]);

  /** Confirma la habilidad pendiente (con objetivo si lo necesita) */
  const confirm = useCallback((fen: string, side: Side, target?: string): AbilityUse | null => {
    const pending = state.pending;
    if (!pending) return null;
    if (needsTarget(pending.ability.effect) && (!target || !pending.targets.includes(target))) {
      return null;
    }
    const r = resolveAbility(fen, pending.from, pending.ability.effect, side, target);
    if (!r.ok) {
      setState(prev => ({ ...prev, error: r.reason, pending: null }));
      return null;
    }
    commit(pending.ability, r.outcome);
    return { ability: pending.ability, outcome: r.outcome };
  }, [state.pending, commit]);

  /** Mantiene los escudos pegados a su pieza cuando se mueve normalmente */
  const onMove = useCallback((move: Move) => {
    setState(prev => {
      if (Object.keys(prev.shields).length === 0) return prev;
      const shields = { ...prev.shields };
      // Si capturaron algo protegido (no debería pasar), el escudo desaparece
      delete shields[move.to];
      if (move.flags.includes('e')) delete shields[move.to[0] + move.from[1]];
      if (shields[move.from] !== undefined) {
        shields[move.to] = shields[move.from];
        delete shields[move.from];
      }
      // Enroque: la torre también se mueve
      const rank = move.from[1];
      const rookMove = move.flags.includes('k') ? [`h${rank}`, `f${rank}`]
        : move.flags.includes('q') ? [`a${rank}`, `d${rank}`] : null;
      if (rookMove && shields[rookMove[0]] !== undefined) {
        shields[rookMove[1]] = shields[rookMove[0]];
        delete shields[rookMove[0]];
      }
      return { ...prev, shields };
    });
  }, []);

  return {
    state,
    reset,
    tick,
    activate,
    confirm,
    cancel,
    clearError,
    onMove,
    abilityFor,
    getCooldown,
    isShielded,
    shieldedSquares,
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
