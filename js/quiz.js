import { db, addQuiz, getAllQuizzes, updateQuiz } from "./firebase.js";
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
  list.innerHTML = quizList.map(q => `
    <div class="list-item">
      <h4>${q.title}</h4>
      <button class="btn primary" onclick="startQuiz('${q.id}')">🎬 Avvia</button>
    </div>
  `).join("");
}

// Avvia quiz live
window.startQuiz = async function(id) {
  activeQuiz = quizList.find(q => q.id === id);
  updateQuiz(id, { status: "live", startedAt: Date.now() });
  document.getElementById("liveTitle").textContent = activeQuiz.title;
  document.getElementById("liveQuestion").textContent = activeQuiz.question;
  startTimer(activeQuiz.timeLimit);
  setupChart();
};

// Timer
function startTimer(seconds) {
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remaining--;
    display.textContent = `⏱️ ${remaining}s`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      stopQuiz();
    }
  }, 1000);
}

function stopQuiz() {
  updateQuiz(activeQuiz.id, { status: "finished" });
  alert("⏰ Quiz terminato!");
}

// Chart.js live results
let chart;
function setupChart() {
  const ctx = document.getElementById("resultsChart");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["A", "B", "C", "D"],
      datasets: [{
        label: "Risposte",
        data: [0, 0, 0, 0],
        backgroundColor: ["#7c3aed", "#5b21b6", "#a855f7", "#d8b4fe"]
      }]
    }
  });
}

// Aggiorna risultati
export function updateResults(optionIndex) {
  chart.data.datasets[0].data[optionIndex]++;
  chart.update();
}
