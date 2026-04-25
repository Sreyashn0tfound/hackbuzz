// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TURBOPACK BYPASS: Hardcoding is perfectly safe for Firebase Web SDK keys!
const firebaseConfig = {
    apiKey: "AIzaSyBnazohzDZ72Wtcm8ZeqFtWtGsy_7L9p0w",
    authDomain: "the-system-7c3c8.firebaseapp.com",
    projectId: "the-system-7c3c8",
    storageBucket: "the-system-7c3c8.firebasestorage.app",
    messagingSenderId: "960934417887",
    appId: "1:960934417887:web:f92e744644853809b8a06a"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// 👇 THIS LINE FIXES YOUR ERROR 👇
export { app, auth, googleProvider, db, storage };