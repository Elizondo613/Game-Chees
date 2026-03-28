// src/civilizations/classic.ts
import type { Civilization } from '../types/civilization.types';
import { classicSVGs } from '../assets/svg/classic-pieces';

export const classicCivilization: Civilization = {
  id: 'classic',
  name: 'Clásico',
  description: 'El ajedrez tradicional.',
  isPremium: false,
  board: { light: '#F0D9B5', dark: '#B58863' },
  pieces: [
    { role:'K', name:'Rey',   replaces:'K', asset:{ type:'svg', white: classicSVGs.K(true),  black: classicSVGs.K(false)  }},
    { role:'Q', name:'Reina', replaces:'Q', asset:{ type:'svg', white: classicSVGs.Q(true),  black: classicSVGs.Q(false)  }},
    { role:'R', name:'Torre', replaces:'R', asset:{ type:'svg', white: classicSVGs.R(true),  black: classicSVGs.R(false)  }},
    { role:'B', name:'Alfil', replaces:'B', asset:{ type:'svg', white: classicSVGs.B(true),  black: classicSVGs.B(false)  }},
    { role:'N', name:'Caballo',replaces:'N',asset:{ type:'svg', white: classicSVGs.N(true),  black: classicSVGs.N(false)  }},
    { role:'P', name:'Peón',  replaces:'P', asset:{ type:'svg', white: classicSVGs.P(true),  black: classicSVGs.P(false)  }},
  ],
};