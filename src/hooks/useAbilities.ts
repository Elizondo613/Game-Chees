// src/hooks/useAbilities.ts
import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Civilization, ActiveAbility } from '../types/civilization.types';
import { applyActiveEffect, getAoeSquares } from '../core/ability-engine';

export interface AbilityState {
  // pieceSquare -> turnosRestantes (0 = disponible)
  cooldowns: Record<string, number>;
  // piezas con escudo activo
  shieldedSquares: Record<string, number>; // square -> turnosRestantes
  // si estamos en modo "seleccionar objetivo"
  pendingAbility: {
    fromSquare: string;
    ability: ActiveAbility;
    aoePreview: string[];
  } | null;
}

export function useAbilities(civilization: Civilization) {
  const [state, setState] = useState<AbilityState>({
    cooldowns: {},
    shieldedSquares: {},
    pendingAbility: null,
  });

  // Llamar al inicio de cada turno para decrementar cooldowns
  const tickTurn = useCallback(() => {
    setState(prev => {
      const newCooldowns = { ...prev.cooldowns };
      const newShields = { ...prev.shieldedSquares };

      for (const sq in newCooldowns) {
        if (newCooldowns[sq] > 0) newCooldowns[sq]--;
      }
      for (const sq in newShields) {
        if (newShields[sq] > 0) newShields[sq]--;
        if (newShields[sq] === 0) delete newShields[sq];
      }

      return { ...prev, cooldowns: newCooldowns, shieldedSquares: newShields };
    });
  }, []);

  // Inicia el modo de activación — muestra preview del AOE
  const startAbility = useCallback((fromSquare: string, ability: ActiveAbility) => {
    const aoePreview = ability.effect.type === 'aoe_capture'
      ? getAoeSquares(fromSquare, ability.effect.radius)
      : [];

    setState(prev => ({
      ...prev,
      pendingAbility: { fromSquare, ability, aoePreview },
    }));
  }, []);

  // Cancela la activación
  const cancelAbility = useCallback(() => {
    setState(prev => ({ ...prev, pendingAbility: null }));
  }, []);

  // Ejecuta la habilidad activa
  const executeAbility = useCallback((
    game: Chess,
    color: 'w' | 'b',
    onGameUpdate: (newFen: string, affected: string[]) => void,
  ) => {
    const { pendingAbility } = state;
    if (!pendingAbility) return;

    const { fromSquare, ability } = pendingAbility;

    if (ability.effect.type === 'shield') {
      const shieldTurns = ability.effect.type === 'shield' ? ability.effect.turns : 2;
      setState(prev => ({
        ...prev,
        shieldedSquares: {
          ...prev.shieldedSquares,
          [fromSquare]: shieldTurns,
        },
        cooldowns: {
          ...prev.cooldowns,
          [fromSquare]: ability.cooldownTurns,
        },
        pendingAbility: null,
      }));

      // ✅ Pasa el turno a negras sin tocar el tablero
      const fenParts = game.fen().split(' ');
      fenParts[1] = 'b';
      fenParts[3] = '-';
      onGameUpdate(fenParts.join(' '), [fromSquare]);
      return;
    }

    const { newFen, affectedSquares } = applyActiveEffect(
      game, fromSquare, ability.effect, color,
    );

    setState(prev => ({
      ...prev,
      cooldowns: {
        ...prev.cooldowns,
        [fromSquare]: ability.cooldownTurns,
      },
      pendingAbility: null,
    }));

    onGameUpdate(newFen, affectedSquares);
  }, [state]);

  // Verifica si una pieza puede usar su habilidad
  const canUseAbility = useCallback((square: string): boolean => {
    return !state.cooldowns[square] || state.cooldowns[square] === 0;
  }, [state.cooldowns]);

  // Verifica si una pieza tiene escudo
  const isShielded = useCallback((square: string): boolean => {
    return !!state.shieldedSquares[square] && state.shieldedSquares[square] > 0;
  }, [state.shieldedSquares]);

  // Cooldown restante de una pieza
  const getCooldown = useCallback((square: string): number => {
    return state.cooldowns[square] ?? 0;
  }, [state.cooldowns]);

  // Obtiene la habilidad activa de una pieza según su tipo
  const getAbilityForPiece = useCallback((pieceType: string): ActiveAbility | undefined => {
    const role = pieceType.toUpperCase() as 'K'|'Q'|'R'|'B'|'N'|'P';
    return civilization.pieces.find(p => p.replaces === role)?.activeAbility;
  }, [civilization]);

  return {
    state,
    tickTurn,
    startAbility,
    cancelAbility,
    executeAbility,
    canUseAbility,
    isShielded,
    getCooldown,
    getAbilityForPiece,
  };
}