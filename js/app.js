// ===============================
// APP LOGIC: PROFILI E NAVIGAZIONE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const profileButtons = {
    admin: document.getElementById("profileAdmin"),
    presenter: document.getElementById("profilePresenter"),
    player: document.getElementById("profilePlayer")
  };

  if (profileButtons.admin) {
    profileButtons.admin.onclick = () => window.location.href = "dashboard-admin.html";
    profileButtons.presenter.onclick = () => window.location.href = "dashboard-presenter.html";
    profileButtons.player.onclick = () => alert("Area partecipanti in sviluppo!");
  }
  // ===============================
// LOGOUT (Admin e Presenter)
// ===============================
import { logoutUser } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutAdmin = document.getElementById("logoutAdmin");
  const logoutPresenter = document.getElementById("logoutPresenter");

  async function handleLogout() {
    try {
      await logoutUser();
      alert("🔒 Logout effettuato!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Errore nel logout:", err);
      alert("❌ Errore durante il logout.");
    }
  }

  if (logoutAdmin) logoutAdmin.addEventListener("click", handleLogout);
  if (logoutPresenter) logoutPresenter.addEventListener("click", handleLogout);
});

});

