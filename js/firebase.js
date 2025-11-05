/* ============================================================
   🔥 Firebase Setup — Live Quiz Elda Marzocchi Scarzella
   ============================================================ */

// Importa le funzioni principali di Firebase
// (Solo se usi un bundler o un framework moderno)
// In caso di semplice HTML statico, questo script funziona con Firebase SDK 9+ caricato via CDN.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* ========================
   CONFIGURAZIONE FIREBASE
   ======================== */
const firebaseConfig = {
  apiKey: "AIzaSyCjBRJritJMO_yQu5JzO7yHTkcRyMIn51w",
  authDomain: "eldaquiz-cfc72.firebaseapp.com",
  projectId: "eldaquiz-cfc72",
  storageBucket: "eldaquiz-cfc72.firebasestorage.app",
  messagingSenderId: "805402501775",
  appId: "1:805402501775:web:19f583ac4db621c40886fa",
  measurementId: "G-X56EQKLPKG"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza servizi principali
const db = getFirestore(app);
const auth = getAuth(app);

/* ========================
   FUNZIONI GLOBALI
   ======================== */

// Esporta per uso in altri file JS
export { db, auth, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot,
         createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };

/* ============================================================
   💡 NOTE
   ------------------------------------------------------------
   - Questo file è caricato in index.html, dashboard-admin.html e dashboard-presenter.html
   - Assicura che Firestore e Auth siano disponibili globalmente.
   ============================================================ */
