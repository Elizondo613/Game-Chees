// src/civilizations/medieval.ts
import type { Civilization } from '../types/civilization.types';
import { medievalSVGs } from '../assets/svg/medieval-pieces';

export const medievalCivilization: Civilization = {
  id: 'medieval',
  name: 'Reino Medieval',
  description: 'Dragones, magos y caballeros en un tablero encantado.',
  isPremium: false,   // gratis para probar
  board: { light: '#E8D5A3', dark: '#6B4E2A', borderColor: '#3D2B0F' },
  boardZones: [
    {
      id: 'castle',
      name: 'El Castillo',
      squares: ['d1','e1','d8','e8'],
      color: '#FFD700',
      opacity: 0.25,
      effect: { type: 'capture_immunity' },
    },
    {
      id: 'enchanted',
      name: 'Bosque Encantado',
      squares: ['c4','d4','e4','f4','c5','d5','e5','f5'],
      color: '#00FF88',
      opacity: 0.15,
      effect: { type: 'movement_buff', value: 1 },
    },
  ],
  pieces: [
    {
      role: 'K',
      name: 'Rey Dragón',
      replaces: 'K',
      // Cuando tengas tu PNG:
      // asset: { type:'png', white:'/pieces/medieval/king-white.png', black:'/pieces/medieval/king-black.png' }
      asset: { type:'svg', white: medievalSVGs.King(true), black: medievalSVGs.King(false) },
    },
    {
      role: 'Q',
      name: 'Maga',
      replaces: 'Q',
      asset: { type:'svg', white: medievalSVGs.Mage(true), black: medievalSVGs.Mage(false) },
      specialAbility: {
        id: 'arcane-burst',
        name: 'Explosión Arcana',
        description: 'Captura todas las piezas enemigas en radio 1',
        cooldownTurns: 6,
        icon: '✨',
        effect: { type: 'aoe_capture', radius: 1 },
      },
    },
    {
      role: 'R',
      name: 'Catapulta',
      replaces: 'R',
      asset: { type:'svg', white: medievalSVGs.Catapult(true), black: medievalSVGs.Catapult(false) },
    },
    {
      role: 'B',
      name: 'Clérigo',
      replaces: 'B',
      asset: { type:'svg', white: medievalSVGs.Cleric(true), black: medievalSVGs.Cleric(false) },
      specialAbility: {
        id: 'divine-shield',
        name: 'Escudo Divino',
        description: 'Protege una pieza aliada de capturas por 2 turnos',
        cooldownTurns: 5,
        icon: '🛡️',
        effect: { type: 'shield', turns: 2 },
      },
    },
    {
      role: 'N',
      name: 'Caballero',
      replaces: 'N',
      asset: { type:'svg', white: medievalSVGs.Knight(true), black: medievalSVGs.Knight(false) },
    },
    {
      role: 'P',
      name: 'Arquero',
      replaces: 'P',
      asset: { type:'svg', white: medievalSVGs.Archer(true), black: medievalSVGs.Archer(false) },
    },
  ],
  passiveAbility: {
    name: 'Resurrección del Dragón',
    description: 'Una vez por partida puedes revivir tu última pieza capturada',
    effect: { type: 'revive', pieceRole: 'P' },
  },
};