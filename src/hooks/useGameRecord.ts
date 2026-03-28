// src/hooks/useGameRecord.ts
import { useCallback } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { GameRecord, UserStats } from '../types/user.types';

export function useGameRecord() {
  const { user, profile, refreshProfile } = useAuth();

  const saveGame = useCallback(async (
    result: 'win' | 'loss' | 'draw',
    civilization: string,
    moves: number,
    duration: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ) => {
    if (!user || !profile) return;

    const record: GameRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      result,
      opponent: 'ai',
      difficulty,
      civilization,
      moves,
      duration,
    };

    // Actualiza estadísticas
    const stats = { ...profile.stats };
    stats.gamesPlayed++;
    if (result === 'win') {
      stats.wins++;
      stats.streak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
    } else if (result === 'loss') {
      stats.losses++;
      stats.streak = 0;
    } else {
      stats.draws++;
    }

    await updateDoc(doc(db, 'users', user.uid), {
      stats,
      recentGames: arrayUnion(record),
    });

    await refreshProfile();
  }, [user, profile, refreshProfile]);

  return { saveGame };
}