/* ============================================================
   🧩 QUIZ MANAGER — Creazione, Salvataggio e Live
   ============================================================ */

import { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from "./firebase.js";

/* =========================
   ELEMENTI INTERFACCIA
   ========================= */
const saveBtn = document.getElementById("saveQuizBtn");
const addAnswerBtn = document.getElementById("addAnswerBtn");
const answersBox = document.getElementById("answersBox");
const savedList = document.getElementById("savedList");

let answers = [];

/* =========================
   AGGIUNGI RISPOSTA DINAMICA
   ========================= */
if (addAnswerBtn) {
  addAnswerBtn.addEventListener("click", () => {
    const text = prompt("Inserisci testo risposta:");
    if (text && text.trim() !== "") {
      const answer = { text, correct: false };
      answers.push(answer);
      renderAnswers();
    }
  });
}

function renderAnswers() {
  answersBox.innerHTML = "";
  answers.forEach((ans, i) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <span>${i + 1}. ${ans.text}</span>
      <button class="btn ghost" data-index="${i}">
        ${ans.correct ? "✅ Corretta" : "Segna corretta"}
      </button>`;
    div.querySelector("button").onclick = () => toggleCorrect(i);
    answersBox.appendChild(div);
  });
}

function toggleCorrect(index) {
  answers = answers.map((a, i) => ({ ...a, correct: i === index }));
  renderAnswers();
}

/* =========================
   SALVATAGGIO QUIZ/SONDAGGIO
   ========================= */
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const title = document.getElementById("quizTitle").value.trim();
    const question = document.getElementById("quizQuestion").value.trim();
    const type = document.getElementById("quizType").value;
    const time = parseInt(document.getElementById("timeLimit").value);

    if (!title || !question || answers.length < 2) {
      return alert("❌ Inserisci titolo, domanda e almeno 2 risposte.");
    }

    const data = {
      title,
      question,
      answers,
      type,
      timeLimit: time,
      createdAt: new Date().toISOString(),
      status: "bozza"
    };

    try {
      const colRef = collection(db, type === "quiz" ? "quiz" : "sondaggi");
      await addDoc(colRef, data);
      alert("✅ Contenuto salvato correttamente!");
      answers = [];
      answersBox.innerHTML = "";
      document.getElementById("quizTitle").value = "";
      document.getElementById("quizQuestion").value = "";
      loadSavedContent();
    } catch (e) {
      console.error("Errore salvataggio:", e);
      alert("⚠️ Errore durante il salvataggio su Firestore.");
    }
  });
}

/* =========================
   CARICA CONTENUTI SALVATI
   ========================= */
async function loadSavedContent() {
  if (!savedList) return;
  savedList.innerHTML = "<p class='muted'>Caricamento...</p>";

  const quizzes = await getDocs(collection(db, "quiz"));
  const surveys = await getDocs(collection(db, "sondaggi"));

  let html = "";

  quizzes.forEach((docu) => {
    const q = docu.data();
    html += `
      <div class="list-item">
        <span>🧠 ${q.title}</span>
        <div>
          <button class="btn good" onclick="launchQuiz('${docu.id}','quiz')">Lancia Live</button>
          <button class="btn danger" onclick="deleteItem('${docu.id}','quiz')">Elimina</button>
        </div>
      </div>`;
  });

  surveys.forEach((docu) => {
    const s = docu.data();
    html += `
      <div class="list-item">
        <span>🗳️ ${s.title}</span>
        <div>
          <button class="btn good" onclick="launchQuiz('${docu.id}','sondaggi')">Lancia Live</button>
          <button class="btn danger" onclick="deleteItem('${docu.id}','sondaggi')">Elimina</button>
        </div>
      </div>`;
  });

  savedList.innerHTML = html || "<p class='muted'>Nessun contenuto salvato.</p>";
}

window.addEventListener("DOMContentLoaded", loadSavedContent);

/* =========================
   ELIMINA QUIZ/SONDAGGIO
   ========================= */
window.deleteItem = async function(id, type) {
  try {
    await deleteDoc(doc(db, type, id));
    alert("🗑️ Eliminato correttamente!");
    loadSavedContent();
  } catch (e) {
    alert("Errore eliminazione: " + e.message);
  }
};

/* =========================
   LANCIO LIVE
   ========================= */
window.launchQuiz = async function(id, type) {
  try {
    const ref = doc(db, type, id);
    await updateDoc(ref, { status: "attivo" });
    localStorage.setItem("activeQuiz", JSON.stringify({ id, type }));
    alert("🚀 Quiz o sondaggio lanciato LIVE!");
  } catch (e) {
    alert("Errore durante il lancio: " + e.message);
  }
};

/* =========================
   MONITOR LIVE
   ========================= */
const liveTitle = document.getElementById("liveTitle");
const liveQuestion = document.getElementById("liveQuestion");

const activeQuizData = JSON.parse(localStorage.getItem("activeQuiz") || "{}");
if (activeQuizData.id) {
  const liveRef = doc(db, activeQuizData.type, activeQuizData.id);
  onSnapshot(liveRef, (snap) => {
    const data = snap.data();
    if (!data) return;
    if (liveTitle) liveTitle.textContent = data.title;
    if (liveQuestion) liveQuestion.textContent = data.question;
  });
}

/* ============================================================
   🔁 Questa parte aggiorna i quiz in tempo reale ogni modifica
   ============================================================ */
console.log("%cQuiz.js caricato correttamente ✅", "color:#10b981;font-weight:bold;");
