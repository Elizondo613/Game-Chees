import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRS-kIfEpnry8lxh7DAKG-JDqVALjKLNc",
  authDomain: "chess-app-c86a0.firebaseapp.com",
  projectId: "chess-app-c86a0",
  storageBucket: "chess-app-c86a0.firebasestorage.app",
  messagingSenderId: "710357321208",
  appId: "1:710357321208:web:bd0e6627f29f9748be420d",
  measurementId: "G-SQ02P1759C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);