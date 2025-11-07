// ===============================
// PLAYER LOGIC — LIVE QUIZ CLIENT
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let activeQuizId = null;
let answered = false;

// Rileva quiz live
onSnapshot(doc(db, "status", "liveQuiz"), async (snap) => {
  const data = snap.data();
  if (data && data.activeId) {
    activeQuizId = data.activeId;
    loadQuiz(activeQuizId);
  } else {
    showWaiting();
  }
});

// Carica quiz live
async function loadQuiz(id) {
  const quizRef = doc(db, "quiz", id);
  const snap = await getDoc(quizRef);
  if (!snap.exists()) return;

  const quiz = snap.data();
  document.getElementById("quizTitle").textContent = quiz.title;
  document.getElementById("quizQuestion").textContent = quiz.question;

  const answersBox = document.getElementById("answersContainer");
  answersBox.innerHTML = "";
  quiz.answers.forEach((ans, idx) => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.className = "btn ghost";
    btn.onclick = () => submitAnswer(id, idx);
    answersBox.appendChild(btn);
  });

  document.getElementById("waitingSection").classList.add("hidden");
  document.getElementById("quizSection").classList.remove("hidden");
}

// Invia risposta
async function submitAnswer(quizId, answerIndex) {
  if (answered) return;
  answered = true;

  await updateDoc(doc(db, "quiz", quizId), {
    responses: arrayUnion(answerIndex)
  });

  document.getElementById("quizSection").classList.add("hidden");
  document.getElementById("thanksSection").classList.remove("hidden");
}

// UI helper
function showWaiting() {
  document.getElementById("waitingSection").classList.remove("hidden");
  document.getElementById("quizSection").classList.add("hidden");
  document.getElementById("thanksSection").classList.add("hidden");
}
