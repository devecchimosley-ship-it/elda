// ==========================
// FIREBASE CONFIG E SERVIZI (centralizzato)
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  getDoc,
  setDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjBRJritJMO_yQu5JzO7yHTkcRyMIn51w",
  authDomain: "eldaquiz-cfc72.firebaseapp.com",
  projectId: "eldaquiz-cfc72",
  storageBucket: "eldaquiz-cfc72.firebasestorage.app",
  messagingSenderId: "805402501775",
  appId: "1805402501775web19f583ac4db621c40886fa"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ==========================
// FUNZIONI UTILI
// ==========================
export async function addQuiz(data) {
  const ref = await addDoc(collection(db, "quiz"), data);
  return ref.id;
}

export async function getAllQuizzes() {
  const snapshot = await getDocs(collection(db, "quiz"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateQuiz(id, newData) {
  await updateDoc(doc(db, "quiz", id), newData);
}

export async function deleteQuiz(id) {
  await deleteDoc(doc(db, "quiz", id));
}

export async function createPresenter(email, password) {
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function adminLogin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  await signOut(auth);
}

// Ri-esportazioni per comodità (usate dagli altri moduli)
// Dentro js/firebase.js
// ... (tutto il codice di importazione e le funzioni)

// Ri-esportazioni per comodità (usate dagli altri moduli)
export {
  doc,         // <-- Assicurati che sia qui
  onSnapshot,
  getDoc,      // <-- Assicurati che sia qui
  setDoc,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onAuthStateChanged
};
