// ===========================
// LIVE QUIZ - UI INTERACTIONS
// ===========================
import { play } from "./sound.js";

document.addEventListener("DOMContentLoaded", () => {
  const profilePopup = document.getElementById("profilePopup");
  const openProfileBtn = document.getElementById("openProfileSelector");
  const closePopupBtn = document.getElementById("closePopup");
  const themeToggle = document.getElementById("themeToggle");

  // Apri popup
  if (openProfileBtn) {
    openProfileBtn.addEventListener("click", () => {
      profilePopup?.classList.remove("hidden");
      play("whoosh");
    });
  }

  // Chiudi popup
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
      profilePopup?.classList.add("hidden");
      play("click");
    });
  }

  // Cambio tema
  if (themeToggle) {
    themeToggle.addEventListener("click", (event) => {
      const isDark = document.body.dataset.theme === "dark";
      document.body.dataset.theme = isDark ? "violet" : "dark";
      themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      play("click");
    });
  }
});
