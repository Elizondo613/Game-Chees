// src/civilizations/egypt.ts
import type { Civilization } from '../types/civilization.types';
import { egyptSVGs } from '../assets/svg/egypt-pieces';

export const egyptCivilization: Civilization = {
  id: 'egypt',
  name: 'Reino de Kemet',
  description: 'Faraones, esfinges y la magia de Isis a orillas del Nilo.',
  isPremium: false,
  board: {
    light: '#EED9A6',   // arenisca
    dark: '#B98A4E',    // ocre del desierto
    borderColor: '#1f3f73', // lapislázuli
    coordColor: '#9a7642',
    lightTexture: 'radial-gradient(rgba(120,80,20,0.10) 1px, transparent 1.2px) 0 0 / 7px 7px',
    darkTexture: 'radial-gradient(rgba(60,30,0,0.14) 1px, transparent 1.2px) 3px 3px / 7px 7px',
  },
  boardZones: [
    {
      id: 'pyramids',
      name: 'Pirámides',
      description: 'Las piezas a la sombra de una pirámide no pueden ser capturadas.',
      squares: ['c3', 'f3', 'c6', 'f6'],
      color: '#f59e0b',
      icon: '🔺',
      effect: { type: 'capture_immunity' },
    },
  ],
  pieces: [
    {
      role: 'K',
      name: 'Faraón',
      replaces: 'K',
      asset: { type: 'svg', white: egyptSVGs.Pharaoh(true), black: egyptSVGs.Pharaoh(false) },
    },
    {
      role: 'Q',
      name: 'Hechicera de Isis',
      replaces: 'Q',
      asset: { type: 'svg', white: egyptSVGs.Isis(true), black: egyptSVGs.Isis(false) },
      activeAbility: {
        id: 'isis-charm',
        name: 'Encanto de Isis',
        description: 'Un peón enemigo a 2 casillas o menos se une a tu ejército.',
        cooldownTurns: 7,
        icon: '☥',
        effect: { type: 'convert', range: 2 },
      },
    },
    {
      role: 'R',
      name: 'Esfinge',
      replaces: 'R',
      asset: { type: 'svg', white: egyptSVGs.Sphinx(true), black: egyptSVGs.Sphinx(false) },
      activeAbility: {
        id: 'eternal-guardian',
        name: 'Guardiana Eterna',
        description: 'La esfinge se vuelve de piedra: no puede ser capturada por 3 turnos.',
        cooldownTurns: 6,
        icon: '🗿',
        effect: { type: 'shield', turns: 3, range: 0 },
      },
    },
    {
      role: 'B',
      name: 'Sacerdote de Anubis',
      replaces: 'B',
      asset: { type: 'svg', white: egyptSVGs.Anubis(true), black: egyptSVGs.Anubis(false) },
      activeAbility: {
        id: 'anubis-judgment',
        name: 'Juicio de Anubis',
        description: 'Pesa el alma de una pieza enemiga en diagonal, hasta 3 casillas, y la elimina.',
        cooldownTurns: 6,
        icon: '⚖️',
        effect: { type: 'ranged_capture', range: 3, pattern: 'diagonal' },
      },
    },
    {
      role: 'N',
      name: 'Carro de Guerra',
      replaces: 'N',
      asset: { type: 'svg', white: egyptSVGs.Chariot(true), black: egyptSVGs.Chariot(false) },
      activeAbility: {
        id: 'chariot-charge',
        name: 'Embestida',
        description: 'Arrolla a todos los peones enemigos adyacentes.',
        cooldownTurns: 5,
        icon: '🐎',
        effect: { type: 'aoe_capture', radius: 1, pawnsOnly: true },
      },
    },
    {
      role: 'P',
      name: 'Lancero del Nilo',
      replaces: 'P',
      asset: { type: 'svg', white: egyptSVGs.Spearman(true), black: egyptSVGs.Spearman(false) },
      activeAbility: {
        id: 'nile-relay',
        name: 'Relevo',
        description: 'Intercambia su lugar con una pieza aliada adyacente (no el faraón).',
        cooldownTurns: 4,
        icon: '🔄',
        effect: { type: 'swap', range: 1 },
      },
    },
  ],
};
