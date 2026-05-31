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
  // src/civilizations/medieval.ts — agrega activeAbility y passiveAbility a cada pieza

  pieces: [
    {
      role: 'K',
      name: 'Rey Dragón',
      replaces: 'K',
      asset: { type:'svg', white: medievalSVGs.King(true), black: medievalSVGs.King(false) },
      // El rey no tiene habilidad activa — demasiado poderoso
    },
    {
      role: 'Q',
      name: 'Maga',
      replaces: 'Q',
      asset: { type:'svg', white: medievalSVGs.Mage(true), black: medievalSVGs.Mage(false) },
      activeAbility: {
        id: 'arcane-burst',
        name: 'Explosión Arcana',
        description: 'Captura todas las piezas enemigas en radio 1 alrededor de esta pieza.',
        cooldownTurns: 6,
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
        description: 'Captura piezas enemigas en radio 2 en línea recta.',
        cooldownTurns: 5,
        icon: '💣',
        effect: { type: 'aoe_capture', radius: 1 },
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
        description: 'Protege esta pieza de capturas por 2 turnos.',
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
      activeAbility: {
        id: 'the-wall',
        name: 'El Muro',
        description: 'Inmune a capturas durante 2 turnos.',
        cooldownTurns: 6,
        icon: '🗡️',
        effect: { type: 'shield', turns: 2 },
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
        description: 'Captura la pieza enemiga más cercana en su fila.',
        cooldownTurns: 4,
        icon: '🎯',
        effect: { type: 'aoe_capture', radius: 1 },
      },
    },
  ],
};