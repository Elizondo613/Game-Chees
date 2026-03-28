// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  }

  async function register(email: string, password: string, name: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    const newProfile: UserProfile = {
      uid: user.uid,
      email,
      displayName: name,
      createdAt: new Date().toISOString(),
      unlockedCivilizations: ['classic', 'medieval'],
      stats: { wins:0, losses:0, draws:0, streak:0, bestStreak:0, gamesPlayed:0 },
      recentGames: [],
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    setProfile(newProfile);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.uid);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await fetchProfile(u.uid);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}