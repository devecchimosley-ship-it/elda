/* ============================================================
   💫 UI MANAGER — Temi, popup e transizioni visive
   ============================================================ */

/* ===============================
   TEMA COLORATO
   =============================== */
const themes = [
  { name: "violet", color: "#7c3aed" },
  { name: "pink", color: "#ec4899" },
  { name: "blue", color: "#3b82f6" },
  { name: "green", color: "#10b981" },
  { name: "orange", color: "#f97316" },
  { name: "red", color: "#ef4444" },
  { name: "yellow", color: "#facc15" },
  { name: "light", color: "#f9fafb" }
];

const themeContainer = document.getElementById("themeButtons");
const root = document.body;

if (themeContainer) {
  themes.forEach(t => {
    const btn = document.createElement("div");
    btn.className = "theme-btn";
    btn.style.background = t.color;
    btn.setAttribute("data-theme", t.name);
    btn.title = t.name.charAt(0).toUpperCase() + t.name.slice(1);
    btn.addEventListener("click", () => applyTheme(t.name));
    themeContainer.appendChild(btn);
  });
}

/* ===============================
   FUNZIONE CAMBIO TEMA
   =============================== */
function applyTheme(name) {
  root.setAttribute("data-theme", name);
  localStorage.setItem("quiz-theme", name);

  const audio = new Audio("assets/sounds/click.mp3");
  audio.volume = 0.2;
  audio.play().catch(() => {});
}

(function initTheme() {
  const saved = localStorage.getItem("quiz-theme") || "violet";
  root.setAttribute("data-theme", saved);
})();

/* ===============================
   EFFETTI POPUP E FADE-IN
   =============================== */
window.addEventListener("load", () => {
  document.querySelectorAll(".fade").forEach(el => {
    setTimeout(() => el.classList.add("show"), 150);
  });
});

/* ===============================
   NOTIFICHE FLASH
   =============================== */
window.flashMessage = function (text, type = "info") {
  const msg = document.createElement("div");
  msg.className = "flash-msg";
  msg.textContent = text;
  msg.style.position = "fixed";
  msg.style.bottom = "20px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.padding = "10px 18px";
  msg.style.borderRadius = "10px";
  msg.style.color = "#fff";
  msg.style.fontWeight = "600";
  msg.style.zIndex = "2000";
  msg.style.transition = "all .5s ease";
  msg.style.opacity = "0";

  switch (type) {
    case "success":
      msg.style.background = "#10b981";
      break;
    case "error":
      msg.style.background = "#ef4444";
      break;
    case "info":
    default:
      msg.style.background = "var(--violet)";
      break;
  }

  document.body.appendChild(msg);
  setTimeout(() => (msg.style.opacity = "1"), 50);
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  }, 2500);
};

/* ===============================
   SUONO TRANSIZIONI
   =============================== */
export function playSound(file) {
  const s = new Audio(`assets/sounds/${file}`);
  s.volume = 0.3;
  s.play().catch(() => {});
}

/* ===============================
   PULSANTE VIBRAZIONE MOBILE
   =============================== */
document.addEventListener("click", (e) => {
  if (navigator.vibrate) {
    navigator.vibrate(8);
  }
});

/* ===============================
   TRANSIZIONE CAMBIO PAGINA
   =============================== */
window.addEventListener("beforeunload", () => {
  const whoosh = new Audio("assets/sounds/whoosh.mp3");
  whoosh.volume = 0.25;
  whoosh.play().catch(() => {});
});

console.log("%cUI.js — Sistema grafico attivo 🌈", "color:#7c3aed;font-weight:bold;");
