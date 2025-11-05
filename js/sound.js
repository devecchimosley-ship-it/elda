/* ============================================================
   🔊 SOUND MANAGER — Effetti sonori globali
   ============================================================ */

/**
 * Questo modulo gestisce tutti i suoni del sito.
 * Include click, errori, successi e transizioni.
 */

const soundBasePath = "assets/sounds/";

const sounds = {
  click: new Audio(soundBasePath + "click.mp3"),
  success: new Audio(soundBasePath + "success.mp3"),
  error: new Audio(soundBasePath + "error.mp3"),
  whoosh: new Audio(soundBasePath + "whoosh.mp3")
};

// Imposta volume base per tutti
Object.values(sounds).forEach(s => (s.volume = 0.25));

/**
 * Riproduce un suono per nome
 * @param {string} name - Nome del suono ("click", "success", "error", "whoosh")
 */
export function play(name) {
  const sound = sounds[name];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

/**
 * Associa automaticamente il suono "click" ai pulsanti principali
 */
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => play("click"));
  });
});

/**
 * Feedback audio in base all'azione
 */
window.addEventListener("quiz-saved", () => play("success"));
window.addEventListener("quiz-error", () => play("error"));
window.addEventListener("page-transition", () => play("whoosh"));

console.log("%cSound.js — effetti sonori caricati 🎵", "color:#10b981;font-weight:bold;");
