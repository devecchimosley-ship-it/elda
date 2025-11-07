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
});
