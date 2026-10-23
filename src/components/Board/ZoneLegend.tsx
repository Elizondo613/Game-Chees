// src/components/Board/ZoneLegend.tsx
import type { BoardZone } from '../../types/civilization.types';

/** Explica bajo el tablero qué hace cada zona especial */
export function ZoneLegend({ zones, width }: { zones: BoardZone[]; width: number }) {
  return (
    <div style={{ width, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
      {zones.map(z => (
        <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#666' }}>
          <span style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: `${z.color}40`, boxShadow: `inset 0 0 0 2px ${z.color}`,
          }} />
          <span><strong style={{ color: '#333', fontWeight: 600 }}>{z.icon} {z.name}:</strong> {z.description}</span>
        </div>
      ))}
    </div>
  );
}
