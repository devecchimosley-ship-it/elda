// ===========================
// LIVE QUIZ - UI INTERACTIONS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  const profilePopup = document.getElementById("profilePopup");
  const openProfileBtn = document.getElementById("openProfileSelector");
  const closePopupBtn = document.getElementById("closePopup");
  const themeToggle = document.getElementById("themeToggle");

  // Apri popup
  if (openProfileBtn) {
    openProfileBtn.addEventListener("click", () => {
      profilePopup?.classList.remove("hidden");
      playSound("whoosh");
    });
  }

  // Chiudi popup
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
      profilePopup?.classList.add("hidden");
      playSound("click");
    });
  }

  // Cambio tema
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.dataset.theme === "dark";
      document.body.dataset.theme = isDark ? "violet" : "dark";
      themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
  }

  // Suoni interfaccia
  function playSound(type) {
    const soundMap = {
      click: "assets/sounds/click.mp3",
      success: "assets/sounds/success.mp3",
      error: "assets/sounds/error.mp3",
      whoosh: "assets/sounds/whoosh.mp3"
    };
    const audio = new Audio(soundMap[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }
});
