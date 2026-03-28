// src/components/Board/Piece.tsx
interface PieceProps {
  code: string;
  size: number;
  civilization: Civilization;
}

import type { Civilization } from '../../types/civilization.types';

export function Piece({ code, size, civilization }: PieceProps) {
  const isWhite = code[0] === 'w';
  const roleKey = code[1] as 'K'|'Q'|'R'|'B'|'N'|'P';

  const civPiece = civilization.pieces.find(p => p.replaces === roleKey);
  if (!civPiece) return null;

  const { asset } = civPiece;

  if (asset.type === 'png') {
    return (
      <img
        src={isWhite ? asset.white : asset.black}
        alt={civPiece.name}
        style={{
          width: size * 0.82,
          height: size * 0.82,
          objectFit: 'contain',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
          pointerEvents: 'none',
        }}
      />
    );
  }

  // SVG inline
  return (
    <div
      style={{
        width: size * 0.82,
        height: size * 0.82,
        filter: isWhite
          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))',
      }}
      dangerouslySetInnerHTML={{
        __html: isWhite ? asset.white : asset.black
      }}
    />
  );
}