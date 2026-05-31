import type { ReactNode } from 'react';

interface SquareProps {
  isLight: boolean;
  isSelected: boolean;
  isHint: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  hasPiece: boolean;
  lightColor: string;
  darkColor: string;
  size: number;
  isAoePreview: boolean;
  isShielded: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export function Square({
  isLight, isSelected, isHint, isLastMove, isCheck,
  hasPiece, lightColor, darkColor, size,
  isAoePreview, isShielded, onClick, children
}: SquareProps) {
  let bg = isLight ? lightColor : darkColor;
  if (isSelected) bg = '#F6F669';
  else if (isCheck) bg = 'rgba(220,50,50,0.65)';
  else if (isAoePreview) bg = 'rgba(239,68,68,0.35)';
  else if (isLastMove) bg = isLight ? 'rgba(155,199,0,0.55)' : 'rgba(155,199,0,0.45)';

  const hintSize = Math.max(12, size * 0.28);

  return (
    <div onClick={onClick} style={{
      width: size, height: size, background: bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor:'pointer', position:'relative',
      outline: isShielded ? '2px solid #f59e0b' : 'none',
      outlineOffset: '-2px',
      boxSizing: 'border-box',
    }}>
      {children}
      {isHint && (
        <div style={{
          position:'absolute', pointerEvents:'none',
          width: hasPiece ? '100%' : hintSize,
          height: hasPiece ? '100%' : hintSize,
          borderRadius: hasPiece ? 0 : '50%',
          background: hasPiece ? 'transparent' : 'rgba(0,0,0,0.18)',
          border: hasPiece ? '3px solid rgba(0,0,0,0.25)' : 'none',
          boxSizing:'border-box',
        }} />
      )}
    </div>
  );
}