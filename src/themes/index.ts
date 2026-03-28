// src/themes/index.ts
import type { BoardTheme } from './types';

export const THEMES: Record<string, BoardTheme> = {
  classic: {
    id: 'classic', name: 'Clásico', isPremium: false,
    board: { light: '#F0D9B5', dark: '#B58863' },
  },
  blue: {
    id: 'blue', name: 'Azul marino', isPremium: false,
    board: { light: '#DEE3E6', dark: '#8CA2AD' },
  },
  // Cuando tengas assets de GoT:
  // got: {
  //   id: 'got', name: 'Game of Thrones', isPremium: true,
  //   board: { light: '#D4C5A9', dark: '#3D3024' },
  //   pieces: { wK: '/themes/got/white-king.png', ... }
  // }
};