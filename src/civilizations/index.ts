// src/civilizations/index.ts
import type { Civilization } from '../types/civilization.types';
import { classicCivilization } from './classic';
import { medievalCivilization } from './medieval';
import { egyptCivilization } from './egypt';
import { japanCivilization } from './japan';

export const CIVILIZATIONS: Record<string, Civilization> = {
  classic: classicCivilization,
  medieval: medievalCivilization,
  egypt: egyptCivilization,
  japan: japanCivilization,
};
