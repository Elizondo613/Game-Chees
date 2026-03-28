import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRS-kIfEpnry8lxh7DAKG-JDqVALjKLNc",
  authDomain: "chess-app-c86a0.firebaseapp.com",
  projectId: "chess-app-c86a0",
  storageBucket: "chess-app-c86a0.firebasestorage.app",
  messagingSenderId: "710357321208",
  appId: "1:710357321208:web:d6f2c66b2a29c6b7be420d",
  measurementId: "G-33VWPR045Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);