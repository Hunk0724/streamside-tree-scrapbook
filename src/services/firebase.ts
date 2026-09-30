import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA58jhPhUAc4zoaVrAAzvJIEOS6T8B1Jek",
  authDomain: "streamside-tree-backend.firebaseapp.com",
  projectId: "streamside-tree-backend",
  storageBucket: "streamside-tree-backend.firebasestorage.app",
  messagingSenderId: "768444307185",
  appId: "1:768444307185:web:1dfa39c5508e13f4297b50",
  measurementId: "G-ES86JTRZ83"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = "hunk123321123@gmail.com";
