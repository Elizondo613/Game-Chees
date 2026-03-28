// src/themes/types.ts
export type PieceCode = 
  'wK'|'wQ'|'wR'|'wB'|'wN'|'wP'|
  'bK'|'bQ'|'bR'|'bB'|'bN'|'bP';

export interface BoardTheme {
  id: string;
  name: string;
  isPremium: boolean;
  board: { light: string; dark: string };
  // Aquí en el futuro irán rutas a tus imágenes custom:
  // pieces?: Record<PieceCode, string>; // URL o SVG
}