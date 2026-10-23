// src/components/Abilities/AbilityPanel.tsx
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { Civilization } from '../../types/civilization.types';
import type { useAbilities } from '../../hooks/useAbilities';
import { ALL_SQUARES, needsTarget } from '../../core/ability-engine';

type AbilitiesHook = ReturnType<typeof useAbilities>;

interface AbilityPanelProps {
  game: Chess;
  civilization: Civilization;
  abilities: AbilitiesHook;
  selectedSquare: Square | null;
  canAct: boolean;
  onActivate: (from: Square) => void;
  onConfirm: () => void;
}

const card = {
  background: '#f5f5f5', border: '0.5px solid #ddd', borderRadius: 10,
  padding: '12px 14px', display: 'flex', flexDirection: 'column' as const, gap: 10,
  textAlign: 'left' as const,
};

const btn = (bg: string) => ({
  flex: 1, padding: '6px 0', borderRadius: 5, border: 'none', background: bg,
  color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
});

export function AbilityPanel({
  game, civilization, abilities, selectedSquare, canAct, onActivate, onConfirm,
}: AbilityPanelProps) {
  const { state, getCooldown, isShielded, cancel } = abilities;
  const pending = state.pending;
  const piecesWithAbility = civilization.pieces.filter(p => p.activeAbility);

  const selectedPiece = selectedSquare ? game.get(selectedSquare) : null;
  const selectedCivPiece = selectedPiece?.color === 'w'
    ? civilization.pieces.find(p => p.replaces === selectedPiece.type.toUpperCase())
    : undefined;

  return (
    <div style={card}>
      <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Habilidades
      </div>

      {state.error && (
        <div style={{ fontSize: 11, color: '#b91c1c', background: '#fef2f2',
          border: '0.5px solid #fecaca', borderRadius: 6, padding: '6px 8px' }}>
          {state.error}
        </div>
      )}

      {/* Habilidad en curso */}
      {pending && (
        <div style={{ background: '#faf5ff', border: '0.5px solid #d8b4fe',
          borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#581c87', marginBottom: 4 }}>
            {pending.ability.icon} {pending.ability.name}
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#6b21a8', lineHeight: 1.4 }}>
            {needsTarget(pending.ability.effect)
              ? 'Haz clic en una casilla marcada en morado.'
              : `Caerán ${pending.preview.length} pieza${pending.preview.length !== 1 ? 's' : ''} (marcadas en rojo).`}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {!needsTarget(pending.ability.effect) && (
              <button onClick={onConfirm} style={btn('#7c3aed')}>✓ Confirmar</button>
            )}
            <button onClick={cancel} style={btn('#9ca3af')}>✕ Cancelar</button>
          </div>
        </div>
      )}

      {/* Pieza seleccionada */}
      {!pending && selectedSquare && selectedCivPiece?.activeAbility && (() => {
        const ability = selectedCivPiece.activeAbility;
        const cd = getCooldown(ability.id);
        const shieldTurns = state.shields[selectedSquare];
        return (
          <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{selectedCivPiece.name}</span>
              {isShielded(selectedSquare) && (
                <span style={{ fontSize: 10, background: '#fef9c3', color: '#854d0e',
                  padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
                  🛡️ Protegida · {shieldTurns}t
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>
                {ability.icon} {ability.name}
              </span>
              <span style={{ fontSize: 10, fontWeight: 500, color: cd === 0 ? '#16a34a' : '#999' }}>
                {cd === 0 ? 'Disponible' : `${cd} turno${cd !== 1 ? 's' : ''}`}
              </span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#666', lineHeight: 1.4 }}>
              {ability.description}
            </p>
            {cd > 0 && <CooldownBar value={cd} max={ability.cooldownTurns} />}
            <button
              disabled={cd > 0 || !canAct}
              onClick={() => onActivate(selectedSquare)}
              style={{ ...btn(cd > 0 || !canAct ? '#bbb' : '#1a1a1a'), width: '100%',
                cursor: cd > 0 || !canAct ? 'default' : 'pointer' }}>
              ⚡ Activar
            </button>
          </div>
        );
      })()}

      {/* Resumen: una fila por tipo de pieza */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {piecesWithAbility.map(civPiece => {
          const ability = civPiece.activeAbility!;
          const count = ALL_SQUARES.filter(sq => {
            const p = game.get(sq as Square);
            return p?.color === 'w' && p.type.toUpperCase() === civPiece.replaces;
          }).length;
          const cd = getCooldown(ability.id);
          const ready = cd === 0 && count > 0;
          return (
            <div key={civPiece.role} title={ability.description} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6,
              background: ready ? '#f0fdf4' : '#f5f5f5', opacity: count === 0 ? 0.4 : 1 }}>
              <span style={{ fontSize: 14 }}>{ability.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#1a1a1a' }}>{ability.name}</div>
                <div style={{ fontSize: 10, color: '#999' }}>
                  {civPiece.name}{count === 0 ? ' — capturada' : count > 1 ? ` ×${count}` : ''}
                </div>
                {cd > 0 && count > 0 && <CooldownBar value={cd} max={ability.cooldownTurns} thin />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, flexShrink: 0,
                color: ready ? '#16a34a' : '#999' }}>
                {count === 0 ? '—' : cd === 0 ? 'Listo' : `${cd}t`}
              </span>
            </div>
          );
        })}
      </div>

      {!pending && !selectedCivPiece?.activeAbility && canAct && (
        <p style={{ margin: 0, fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
          Selecciona una pieza para ver y activar su habilidad. Usar una habilidad gasta tu turno.
        </p>
      )}
    </div>
  );
}

function CooldownBar({ value, max, thin }: { value: number; max: number; thin?: boolean }) {
  return (
    <div style={{ height: thin ? 2 : 3, background: '#e5e7eb', borderRadius: 2,
      marginTop: thin ? 3 : 0, marginBottom: thin ? 0 : 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', background: '#3b82f6', borderRadius: 2,
        width: `${((max - value) / max) * 100}%`, transition: 'width 0.3s' }} />
    </div>
  );
}
