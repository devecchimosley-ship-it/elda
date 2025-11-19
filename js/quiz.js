// ===============================
// LIVE QUIZ - PRESENTER SYNC LOGIC
// ===============================
import { db, getAllQuizzes, updateQuiz, doc, setDoc, onSnapshot } from "./firebase.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";

let quizList = [];
let activeQuiz = null;
let timerInterval;

// Carica quiz esistenti
export async function loadQuizzes() {
  quizList = await getAllQuizzes();
  renderQuizList();
}

function renderQuizList() {
  const list = document.getElementById("savedList");
  if (!list) return;
  list.innerHTML = quizList.map(q => `
    <div class="list-item card">
      <h4>${q.title}</h4>
      <button class="btn primary" onclick="startQuiz('${q.id}')">🎬 Avvia</button>
    </div>
  `).join("");
}

// Avvia quiz live
window.startQuiz = async function(id) {
  activeQuiz = quizList.find(q => q.id === id);
  if (!activeQuiz) return;

  // Aggiorna quiz nel DB
  await updateQuiz(id, { status: "live", startedAt: Date.now(), responses: [] });

  // Imposta quiz live globale
  await setDoc(doc(db, "status", "liveQuiz"), { activeId: id });

  // Aggiorna UI
  document.getElementById("liveTitle").textContent = activeQuiz.title;
  document.getElementById("liveQuestion").textContent = activeQuiz.question;
  startTimer(activeQuiz.timeLimit);
  setupChart();

  alert("📡 Quiz avviato! I partecipanti sono ora sincronizzati.");
};

// Timer
function startTimer(seconds) {
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (display) display.textContent = `⏱️ ${remaining}s`;
    remaining--;
    if (remaining < 0) {
      clearInterval(timerInterval);
      stopQuiz();
    }
  }, 1000);
}

// Ferma quiz
window.stopQuiz = async function() {
  if (!activeQuiz) return;

  await updateQuiz(activeQuiz.id, { status: "finished" });
  await setDoc(doc(db, "status", "liveQuiz"), { activeId: null });
  alert("⏰ Quiz terminato!");
};

// Chart.js setup
let chart;
function setupChart() {
  const ctx = document.getElementById("resultsChart");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [{
        label: "Risposte ricevute",
        data: [0, 0, 0, 0],
        backgroundColor: ["#7c3aed", "#5b21b6", "#a855f7", "#d8b4fe"]
      }]
    },
    options: { animation: { duration: 300 } }
  });

  // Ascolta risposte live in Firestore
  listenToResponses();
}

// Aggiornamento in tempo reale delle risposte
function listenToResponses() {
  if (!activeQuiz) return;
  onSnapshot(doc(db, "quiz", activeQuiz.id), (snapshot) => {
    const data = snapshot.data();
    if (!data || !data.responses) return;

    const counts = new Array(data.answers.length).fill(0);
    data.responses.forEach(i => { if (typeof i === "number" && counts[i] !== undefined) counts[i]++; });
    chart.data.datasets[0].data = counts;
    chart.update();
  });
}// ===============================
// LIVE QUIZ - PRESENTER SYNC LOGIC
// ===============================
import { db, getAllQuizzes, updateQuiz, doc, setDoc, onSnapshot } from "./firebase.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";

let quizList = [];
let activeQuiz = null;
let timerInterval;

// Carica quiz esistenti
export async function loadQuizzes() {
  quizList = await getAllQuizzes();
  renderQuizList();
}

function renderQuizList() {
  const list = document.getElementById("savedList");
  if (!list) return;
  list.innerHTML = quizList.map(q => `
    <div class="list-item card">
      <h4>${q.title}</h4>
      <button class="btn primary" onclick="startQuiz('${q.id}')">🎬 Avvia</button>
    </div>
  `).join("");
}

// Avvia quiz live
window.startQuiz = async function(id) {
  activeQuiz = quizList.find(q => q.id === id);
  if (!activeQuiz) return;

  // Aggiorna quiz nel DB
  await updateQuiz(id, { status: "live", startedAt: Date.now(), responses: [] });

  // Imposta quiz live globale
  await setDoc(doc(db, "status", "liveQuiz"), { activeId: id });

  // Aggiorna UI
  document.getElementById("liveTitle").textContent = activeQuiz.title;
  document.getElementById("liveQuestion").textContent = activeQuiz.question;
  startTimer(activeQuiz.timeLimit);
  setupChart();

  alert("📡 Quiz avviato! I partecipanti sono ora sincronizzati.");
};

// Timer
function startTimer(seconds) {
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (display) display.textContent = `⏱️ ${remaining}s`;
    remaining--;
    if (remaining < 0) {
      clearInterval(timerInterval);
      stopQuiz();
    }
  }, 1000);
}

// Ferma quiz
window.stopQuiz = async function() {
  if (!activeQuiz) return;

  await updateQuiz(activeQuiz.id, { status: "finished" });
  await setDoc(doc(db, "status", "liveQuiz"), { activeId: null });
  alert("⏰ Quiz terminato!");
};

// Chart.js setup
let chart;
function setupChart() {
  const ctx = document.getElementById("resultsChart");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [{
        label: "Risposte ricevute",
        data: [0, 0, 0, 0],
        backgroundColor: ["#7c3aed", "#5b21b6", "#a855f7", "#d8b4fe"]
      }]
    },
    options: { animation: { duration: 300 } }
  });

  // Ascolta risposte live in Firestore
  listenToResponses();
}

// Aggiornamento in tempo reale delle risposte
function listenToResponses() {
  if (!activeQuiz) return;
  onSnapshot(doc(db, "quiz", activeQuiz.id), (snapshot) => {
    const data = snapshot.data();
    if (!data || !data.responses) return;

    const counts = new Array(data.answers.length).fill(0);
    data.responses.forEach(i => { if (typeof i === "number" && counts[i] !== undefined) counts[i]++; });
    chart.data.datasets[0].data = counts;
    chart.update();
  });
}
