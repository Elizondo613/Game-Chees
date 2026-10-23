// src/components/Board/PromotionPicker.tsx
import type { Civilization } from '../../types/civilization.types';
import type { PromotionPiece } from '../../hooks/useChessGame';
import { Piece } from './Piece';

interface PromotionPickerProps {
  civilization: Civilization;
  size: number;
  onChoose: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const OPTIONS: PromotionPiece[] = ['q', 'r', 'b', 'n'];

/** Ventana sobre el tablero para elegir en qué se convierte el peón */
export function PromotionPicker({ civilization, size, onChoose, onCancel }: PromotionPickerProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'absolute', inset: 0, zIndex: 10, borderRadius: 6,
        background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        role="dialog"
        aria-label="Elige la pieza de coronación"
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'center' }}>
          Tu peón corona. ¿En qué se convierte?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {OPTIONS.map(t => {
            const civPiece = civilization.pieces.find(p => p.replaces === t.toUpperCase());
            return (
              <button
                key={t}
                aria-label={civPiece?.name ?? t}
                title={civPiece?.name}
                onClick={() => onChoose(t)}
                style={{
                  width: size * 1.1, height: size * 1.25, borderRadius: 8, cursor: 'pointer',
                  border: '0.5px solid #ddd', background: '#f7f5ef', padding: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                }}
              >
                <Piece code={'w' + t.toUpperCase()} size={size} civilization={civilization} />
                <span style={{ fontSize: 9, color: '#555', lineHeight: 1.1 }}>{civPiece?.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
