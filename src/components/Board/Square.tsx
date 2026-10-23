// src/components/Board/Square.tsx
import type { ReactNode } from 'react';
import type { BoardFx } from '../../hooks/useChessGame';

interface SquareProps {
  /** Nombre de la casilla (e4). Se expone como data-square para pruebas */
  square: string;
  isLight: boolean;
  isSelected: boolean;
  isHint: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  hasPiece: boolean;
  lightColor: string;
  darkColor: string;
  lightTexture?: string;
  darkTexture?: string;
  size: number;
  /** Casilla que caería con una habilidad de área */
  isAoePreview: boolean;
  /** Casilla elegible como objetivo de una habilidad */
  isTarget: boolean;
  /** Turnos de escudo restantes (0 = sin escudo) */
  shieldTurns: number;
  /** Bando dueño del escudo: dorado para ti, azul para la IA */
  shieldSide?: 'w' | 'b';
  /** Zona especial a la que pertenece la casilla */
  zone?: { color: string; icon: string; name: string };
  /** Animación puntual sobre esta casilla */
  fx: BoardFx | null;
  onClick: () => void;
  children?: ReactNode;
}

export function Square({
  square, isLight, isSelected, isHint, isLastMove, isCheck, hasPiece,
  lightColor, darkColor, lightTexture, darkTexture, size,
  isAoePreview, isTarget, shieldTurns, shieldSide = 'w', zone, fx, onClick, children,
}: SquareProps) {
  const glow = shieldSide === 'w' ? '250,204,21' : '56,189,248';
  // Capa de estado encima del color/textura base
  let overlay: string | null = null;
  if (isSelected) overlay = 'rgba(246,246,105,0.75)';
  else if (isCheck) overlay = 'rgba(220,50,50,0.65)';
  else if (isAoePreview) overlay = 'rgba(239,68,68,0.45)';
  else if (isLastMove) overlay = 'rgba(155,199,0,0.42)';

  const hintSize = Math.max(12, size * 0.28);
  const texture = isLight ? lightTexture : darkTexture;

  return (
    <div
      data-square={square}
      data-target={isTarget || undefined}
      data-hint={isHint || undefined}
      data-preview={isAoePreview || undefined}
      data-shield={shieldTurns || undefined}
      onClick={onClick} style={{
      width: size, height: size, position: 'relative',
      // Textura (shorthand de background, admite posición/tamaño) + color base
      background: texture ? `${texture}, ${isLight ? lightColor : darkColor}` : (isLight ? lightColor : darkColor),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxSizing: 'border-box',
    }}>
      {/* Zona especial: tinte + marco del color de la zona */}
      {zone && (
        <div title={zone.name} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `${zone.color}2e`, boxShadow: `inset 0 0 0 2px ${zone.color}aa`,
        }}>
          <span style={{ position: 'absolute', left: 2, bottom: 0, fontSize: Math.max(9, size * 0.2),
            opacity: 0.75, lineHeight: 1.2 }}>{zone.icon}</span>
        </div>
      )}

      {overlay && <div style={{ position: 'absolute', inset: 0, background: overlay, pointerEvents: 'none' }} />}

      {/* Escudo: aura dorada que late */}
      {shieldTurns > 0 && (
        <>
          <div style={{
            position: 'absolute', inset: 3, borderRadius: '50%', pointerEvents: 'none',
            boxShadow: `0 0 0 2px rgba(${glow},0.9), 0 0 14px 4px rgba(${glow},0.65), inset 0 0 12px rgba(${glow},0.55)`,
            animation: 'shieldPulse 1.6s ease-in-out infinite',
          }} />
          <span style={{
            position: 'absolute', top: 2, right: 3, fontSize: Math.max(9, size * 0.17),
            fontWeight: 700, color: shieldSide === 'w' ? '#713f12' : '#0c4a6e',
            background: shieldSide === 'w' ? '#fde047' : '#7dd3fc', borderRadius: 4,
            padding: '0 3px', lineHeight: 1.3, pointerEvents: 'none', zIndex: 2,
          }}>🛡{shieldTurns}</span>
        </>
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{children}</div>

      {/* Objetivo de habilidad */}
      {isTarget && (
        <div style={{
          position: 'absolute', inset: 2, borderRadius: 6, pointerEvents: 'none', zIndex: 2,
          border: '3px solid rgba(147,51,234,0.9)', boxShadow: 'inset 0 0 10px rgba(147,51,234,0.5)',
          animation: 'targetPulse 1s ease-in-out infinite',
        }} />
      )}

      {isHint && (
        <div style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 2,
          width: hasPiece ? '100%' : hintSize,
          height: hasPiece ? '100%' : hintSize,
          borderRadius: hasPiece ? 0 : '50%',
          background: hasPiece ? 'transparent' : 'rgba(0,0,0,0.18)',
          border: hasPiece ? '3px solid rgba(0,0,0,0.25)' : 'none',
          boxSizing: 'border-box',
        }} />
      )}

      {/* Destello al usar una habilidad */}
      {fx && (
        <div key={fx.key} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          background: fx.kind === 'capture' ? 'radial-gradient(circle, rgba(255,120,40,0.95), rgba(255,60,0,0) 70%)'
            : fx.kind === 'shield' ? 'radial-gradient(circle, rgba(253,224,71,0.95), rgba(253,224,71,0) 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.95), rgba(168,85,247,0) 70%)',
          animation: 'fxBurst 0.7s ease-out forwards',
        }} />
      )}
    </div>
  );
}
