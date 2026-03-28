export type PieceRole = 
  | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'  // piezas estándar
  | 'dragon' | 'mage' | 'champion' | 'catapult' | 'spy';  // piezas custom

export interface MovePattern {
  type: 'standard' | 'custom' | 'combined';
  baseRole?: string;        // para type:'standard', usa reglas de chess.js
  customSquares?: number[][]; // para type:'custom', offsets [dr, dc]
  combined?: string[];      // para type:'combined', combina patrones
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldownTurns: number;
  icon: string;             // emoji o ruta a imagen
  effect: AbilityEffect;
}

export type AbilityEffect =
  | { type: 'shield'; turns: number }
  | { type: 'aoe_capture'; radius: number }
  | { type: 'teleport'; pattern: number[][] }
  | { type: 'revive'; pieceRole: PieceRole }
  | { type: 'zone_buff'; squares: string[] };

export interface CivilizationPiece {
  role: PieceRole;
  name: string;
  replaces: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
  // Sistema dual: SVG para default, PNG para assets custom
  asset: { type: 'svg'; white: string; black: string }
        | { type: 'png'; white: string; black: string };
  specialAbility?: SpecialAbility;
}

export interface BoardZone {
  id: string;
  squares: string[];
  name: string;
  color: string;            // color de tinte visual
  opacity: number;
  effect: {
    type: 'movement_buff' | 'capture_immunity' | 'respawn';
    value?: number;
  };
}

export interface Civilization {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  board: { light: string; dark: string; borderColor?: string };
  pieces: CivilizationPiece[];
  boardZones?: BoardZone[];
  passiveAbility?: {
    name: string;
    description: string;
    effect: AbilityEffect;
  };
}