// src/types/user.types.ts

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  streak: number;       // racha actual
  bestStreak: number;   // mejor racha histórica
  gamesPlayed: number;
}

export interface GameRecord {
  id: string;
  date: string;           // ISO string
  result: 'win' | 'loss' | 'draw';
  opponent: 'ai' | string; // 'ai' o uid del oponente
  difficulty?: 'easy' | 'medium' | 'hard';
  civilization: string;
  moves: number;
  duration: number;       // segundos
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  unlockedCivilizations: string[];  // ['classic', 'medieval', ...]
  stats: UserStats;
  recentGames: GameRecord[];        // últimas 20 partidas
}