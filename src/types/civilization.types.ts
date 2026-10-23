export type PieceRole =
  | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'  // piezas estándar
  | 'dragon' | 'mage' | 'champion' | 'catapult' | 'spy';  // piezas custom

export type StandardPiece = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

/**
 * Efectos de habilidad. Todos consumen el turno del jugador.
 *
 * - aoe_capture:    captura enemigos alrededor de la pieza (nunca al rey).
 * - ranged_capture: el jugador elige UNA pieza enemiga a distancia (ignora bloqueos).
 * - shield:         range 0 = protege a esta pieza; range > 0 = el jugador elige un aliado.
 * - aura_shield:    protege a esta pieza y a todos los aliados adyacentes.
 * - teleport:       mueve esta pieza a una casilla vacía dentro del rango.
 * - convert:        un peón enemigo dentro del rango pasa a tu bando.
 * - swap:           intercambia posición con un aliado (no el rey) dentro del rango.
 */
export type AbilityEffect =
  | { type: 'aoe_capture'; radius: number; pawnsOnly?: boolean }
  | { type: 'ranged_capture'; range: number; pattern: 'any' | 'orthogonal' | 'diagonal'; pawnsOnly?: boolean }
  | { type: 'shield'; turns: number; range: number }
  | { type: 'aura_shield'; turns: number }
  | { type: 'teleport'; range: number }
  | { type: 'convert'; range: number }
  | { type: 'swap'; range: number };

export interface ActiveAbility {
  id: string;
  name: string;
  description: string;
  cooldownTurns: number;
  icon: string;
  effect: AbilityEffect;
}

export interface CivilizationPiece {
  role: PieceRole;
  name: string;
  replaces: StandardPiece;
  // Sistema dual: SVG para default, PNG para assets custom
  asset: { type: 'svg'; white: string; black: string }
        | { type: 'png'; white: string; black: string };
  activeAbility?: ActiveAbility;
}

/**
 * Zona especial del tablero. Afecta igual a ambos bandos.
 * - capture_immunity: las piezas sobre estas casillas no pueden ser capturadas.
 * - cooldown_boost:   una habilidad usada desde aquí recarga `value` turnos antes.
 */
export interface BoardZone {
  id: string;
  name: string;
  description: string;
  squares: string[];
  color: string;            // tinte visual
  icon: string;
  effect:
    | { type: 'capture_immunity' }
    | { type: 'cooldown_boost'; value: number };
}

export interface BoardStyle {
  light: string;
  dark: string;
  /** Color del marco del tablero */
  borderColor?: string;
  /** Capa CSS sobre las casillas para darles textura (sintaxis de `background`, sin color) */
  lightTexture?: string;
  darkTexture?: string;
  /** Color de las coordenadas a-h / 1-8 */
  coordColor?: string;
}

export interface Civilization {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  board: BoardStyle;
  pieces: CivilizationPiece[];
  boardZones?: BoardZone[];
}
