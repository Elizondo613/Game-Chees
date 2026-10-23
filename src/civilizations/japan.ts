// src/civilizations/japan.ts
import type { Civilization } from '../types/civilization.types';
import { japanSVGs } from '../assets/svg/japan-pieces';

export const japanCivilization: Civilization = {
  id: 'japan',
  name: 'Shogunato',
  description: 'Samuráis, ninjas y monjes guerreros del Japón feudal.',
  isPremium: false,
  board: {
    light: '#E9E1C8',   // tatami
    dark: '#6E8B63',    // musgo de jardín zen
    borderColor: '#2a1d16', // madera lacada
    coordColor: '#7d6f57',
    // Fibras del tatami / rastrillado del jardín
    lightTexture: 'repeating-linear-gradient(90deg, rgba(90,70,30,0.07) 0 1px, transparent 1px 4px)',
    darkTexture: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 6px)',
  },
  boardZones: [
    {
      id: 'zen-garden',
      name: 'Jardín Zen',
      description: 'Una habilidad usada desde el jardín recarga 3 turnos antes.',
      squares: ['d4', 'e4', 'd5', 'e5'],
      color: '#e11d48',
      icon: '⛩️',
      effect: { type: 'cooldown_boost', value: 3 },
    },
  ],
  pieces: [
    {
      role: 'K',
      name: 'Shōgun',
      replaces: 'K',
      asset: { type: 'svg', white: japanSVGs.Shogun(true), black: japanSVGs.Shogun(false) },
    },
    {
      role: 'Q',
      name: 'Onmyōji',
      replaces: 'Q',
      asset: { type: 'svg', white: japanSVGs.Onmyoji(true), black: japanSVGs.Onmyoji(false) },
      activeAbility: {
        id: 'kekkai',
        name: 'Barrera Kekkai',
        description: 'Protege a la onmyōji y a todos los aliados adyacentes durante 2 turnos.',
        cooldownTurns: 7,
        icon: '⛩️',
        effect: { type: 'aura_shield', turns: 2 },
      },
    },
    {
      role: 'R',
      name: 'Yagura',
      replaces: 'R',
      asset: { type: 'svg', white: japanSVGs.Yagura(true), black: japanSVGs.Yagura(false) },
      activeAbility: {
        id: 'yumi-volley',
        name: 'Andanada Yumi',
        description: 'Los arqueros de la torre eliminan un peón enemigo en su fila o columna, hasta 5 casillas.',
        cooldownTurns: 5,
        icon: '🎯',
        effect: { type: 'ranged_capture', range: 5, pattern: 'orthogonal', pawnsOnly: true },
      },
    },
    {
      role: 'B',
      name: 'Monje Sōhei',
      replaces: 'B',
      asset: { type: 'svg', white: japanSVGs.Sohei(true), black: japanSVGs.Sohei(false) },
      activeAbility: {
        id: 'monk-step',
        name: 'Paso del Monje',
        description: 'Intercambia su lugar con un aliado a 3 casillas o menos (no el shōgun).',
        cooldownTurns: 5,
        icon: '🌀',
        effect: { type: 'swap', range: 3 },
      },
    },
    {
      role: 'N',
      name: 'Ninja',
      replaces: 'N',
      asset: { type: 'svg', white: japanSVGs.Ninja(true), black: japanSVGs.Ninja(false) },
      activeAbility: {
        id: 'shadow-step',
        name: 'Paso de Sombra',
        description: 'Desaparece y reaparece en cualquier casilla vacía a 3 casillas o menos.',
        cooldownTurns: 5,
        icon: '💨',
        effect: { type: 'teleport', range: 3 },
      },
    },
    {
      role: 'P',
      name: 'Ashigaru',
      replaces: 'P',
      asset: { type: 'svg', white: japanSVGs.Ashigaru(true), black: japanSVGs.Ashigaru(false) },
      activeAbility: {
        id: 'spear-wall',
        name: 'Muro de Lanzas',
        description: 'El ashigaru se atrinchera: no puede ser capturado en el próximo turno.',
        cooldownTurns: 3,
        icon: '🛡️',
        effect: { type: 'shield', turns: 1, range: 0 },
      },
    },
  ],
};
