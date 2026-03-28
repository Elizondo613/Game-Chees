// src/civilizations/index.ts
import type { Civilization } from '../types/civilization.types';
import { classicCivilization } from './classic';
import { medievalCivilization } from './medieval';

export const CIVILIZATIONS: Record<string, Civilization> = {
  classic: classicCivilization,
  medieval: medievalCivilization,
};