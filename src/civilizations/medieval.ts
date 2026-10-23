// src/civilizations/medieval.ts
import type { Civilization } from '../types/civilization.types';
import { medievalSVGs } from '../assets/svg/medieval-pieces';

export const medievalCivilization: Civilization = {
  id: 'medieval',
  name: 'Reino Medieval',
  description: 'Dragones, magos y caballeros en un tablero encantado.',
  isPremium: false,   // gratis para probar
  board: {
    light: '#E8D5A3',
    dark: '#6B4E2A',
    borderColor: '#3D2B0F',
    coordColor: '#8a6a3b',
    // Vetas de madera muy sutiles
    darkTexture: 'repeating-linear-gradient(100deg, rgba(0,0,0,0.07) 0 2px, transparent 2px 9px)',
    lightTexture: 'repeating-linear-gradient(100deg, rgba(120,80,30,0.06) 0 1px, transparent 1px 8px)',
  },
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
      asset: { type:'svg', white: medievalSVGs.King(true), black: medievalSVGs.King(false) },
      // El rey no tiene habilidad: sería demasiado fuerte
    },
    {
      role: 'Q',
      name: 'Maga',
      replaces: 'Q',
      asset: { type:'svg', white: medievalSVGs.Mage(true), black: medievalSVGs.Mage(false) },
      activeAbility: {
        id: 'arcane-burst',
        name: 'Explosión Arcana',
        description: 'Elimina a todas las piezas enemigas adyacentes (excepto el rey).',
        cooldownTurns: 7,
        icon: '💥',
        effect: { type: 'aoe_capture', radius: 1 },
      },
    },
    {
      role: 'R',
      name: 'Catapulta',
      replaces: 'R',
      asset: { type:'svg', white: medievalSVGs.Catapult(true), black: medievalSVGs.Catapult(false) },
      activeAbility: {
        id: 'barrage',
        name: 'Bombardeo',
        description: 'Destruye una pieza enemiga en su fila o columna, hasta 4 casillas, por encima de lo que haya en medio.',
        cooldownTurns: 6,
        icon: '🪨',
        effect: { type: 'ranged_capture', range: 4, pattern: 'orthogonal' },
      },
    },
    {
      role: 'B',
      name: 'Clérigo',
      replaces: 'B',
      asset: { type:'svg', white: medievalSVGs.Cleric(true), black: medievalSVGs.Cleric(false) },
      activeAbility: {
        id: 'divine-shield',
        name: 'Escudo Divino',
        description: 'Elige una pieza aliada a 2 casillas o menos (puede ser él mismo): no puede ser capturada por 2 turnos.',
        cooldownTurns: 5,
        icon: '🛡️',
        effect: { type: 'shield', turns: 2, range: 2 },
      },
    },
    {
      role: 'N',
      name: 'Caballero',
      replaces: 'N',
      asset: { type:'svg', white: medievalSVGs.Knight(true), black: medievalSVGs.Knight(false) },
      activeAbility: {
        id: 'the-wall',
        name: 'El Muro',
        description: 'El caballero levanta su escudo: no puede ser capturado por 2 turnos.',
        cooldownTurns: 5,
        icon: '🗡️',
        effect: { type: 'shield', turns: 2, range: 0 },
      },
    },
    {
      role: 'P',
      name: 'Arquero',
      replaces: 'P',
      asset: { type:'svg', white: medievalSVGs.Archer(true), black: medievalSVGs.Archer(false) },
      activeAbility: {
        id: 'volley',
        name: 'Lluvia de Flechas',
        description: 'Elimina un peón enemigo a 2 casillas o menos. El enfriamiento es compartido por todos los arqueros.',
        cooldownTurns: 6,
        icon: '🏹',
        effect: { type: 'ranged_capture', range: 2, pattern: 'any', pawnsOnly: true },
      },
    },
  ],
};