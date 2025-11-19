/* ============================================================
   📊 LIVE CHARTS — Visualizzazione risultati in tempo reale
   ============================================================ */

import { db, doc, onSnapshot } from "./firebase.js";

let chartCanvas = document.getElementById("resultsChart");
let ctx = chartCanvas ? chartCanvas.getContext("2d") : null;
let chartData = [];
let chartLabels = [];

/* ===============================
   FUNZIONE DI DISEGNO GENERALE
   =============================== */
function drawChart(labels, values, color = "var(--violet)") {
  if (!ctx) return;
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  const maxVal = Math.max(...values, 1);
  const barWidth = (chartCanvas.width - 40) / Math.max(values.length, 1);

  labels.forEach((label, i) => {
    const barHeight = (values[i] / maxVal) * (chartCanvas.height - 40);
    const x = 20 + i * barWidth;
    const y = chartCanvas.height - barHeight - 20;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth * 0.6, barHeight);
    ctx.fillStyle = "white";
    ctx.font = "12px system-ui";
    ctx.fillText(label, x, chartCanvas.height - 8);
  });
}

/* ===============================
   ASCOLTO QUIZ ATTIVO
   =============================== */
const activeQuiz = JSON.parse(localStorage.getItem("activeQuiz") || "{}");

if (activeQuiz.id) {
  const ref = doc(db, activeQuiz.type, activeQuiz.id);

  onSnapshot(ref, (snap) => {
    const data = snap.data();
    if (!data || !data.answers) return;

    chartLabels = data.answers.map((a) => (typeof a === "object" && a.text) ? a.text : String(a));
    // se non ci sono responses ancora, inizializza a zero
    chartData = (data.responses && data.responses.length)
      ? (data.answers.map((_, i) => 0), []) // placeholder
      : data.answers.map(() => 0);

    // se ci sono responses (array di indici), conta i valori
    if (data.responses && Array.isArray(data.responses)) {
      const counts = new Array(data.answers.length).fill(0);
      data.responses.forEach(i => { if (typeof i === "number" && counts[i] !== undefined) counts[i]++; });
      chartData = counts;
    } else {
      // simulazione se necessario
      chartData = data.answers.map(() => Math.floor(Math.random() * 10) + 1);
    }

    drawChart(chartLabels, chartData);
  });
}

/* ===============================
   TIMER GESTIONE (usato dal presentatore)
   =============================== */
let timerInterval;
let timerDisplay = document.getElementById("timerDisplay");
let seconds = 0;

const startBtn = document.getElementById("startTimer");
const stopBtn = document.getElementById("stopTimer");

if (startBtn && stopBtn && timerDisplay) {
  startBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    seconds = 0;
    timerInterval = setInterval(() => {
      seconds++;
      timerDisplay.textContent = `⏱️ ${seconds}s`;
    }, 1000);
  });

  stopBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
  });
}

/* ===============================
   AGGIORNAMENTO VISUALE AUTOMATICO
   =============================== */
setInterval(() => {
  if (chartLabels.length > 0 && ctx) {
    drawChart(chartLabels, chartData);
  }
}, 3000);

console.log("%cChart.js pronto e attivo 🎨", "color:#3b82f6;font-weight:bold;");
