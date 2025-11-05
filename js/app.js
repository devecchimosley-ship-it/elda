/* ============================================================
   🧠 APP CORE — Gestione Accessi e Ruoli
   ============================================================ */

import { auth, signInWithEmailAndPassword, signOut } from "./firebase.js";

/* =========================
   PROFILO SELECTION MODALE
   ========================= */
const openBtn = document.getElementById("openProfileSelector");
const popup = document.getElementById("profilePopup");
const closeBtn = document.getElementById("closePopup");

if (openBtn && popup && closeBtn) {
  openBtn.onclick = () => popup.classList.remove("hidden");
  closeBtn.onclick = () => popup.classList.add("hidden");
}

/* =========================
   NAVIGAZIONE PROFILI
   ========================= */
const goTo = (page) => {
  window.location.href = page;
};

const profileAdmin = document.getElementById("profileAdmin");
const profilePresenter = document.getElementById("profilePresenter");
const profilePlayer = document.getElementById("profilePlayer");

if (profileAdmin) profileAdmin.onclick = () => goTo("dashboard-admin.html");
if (profilePresenter) profilePresenter.onclick = () => goTo("dashboard-presenter.html");
if (profilePlayer) profilePlayer.onclick = () => goTo("player.html");

/* =========================
   LOGIN ADMIN / PRESENTER
   ========================= */
const loginAdmin = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userRole", "admin");
    window.location.href = "dashboard-admin.html";
  } catch (error) {
    alert("❌ Errore login Admin: " + error.message);
  }
};

const loginPresenter = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userRole", "presenter");
    window.location.href = "dashboard-presenter.html";
  } catch (error) {
    alert("❌ Errore login Presentatore: " + error.message);
  }
};

/* =========================
   LOGOUT
   ========================= */
const logoutAdminBtn = document.getElementById("logoutAdmin");
const logoutPresenterBtn = document.getElementById("logoutPresenter");

async function performLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  } catch (e) {
    alert("Errore durante il logout: " + e.message);
  }
}

if (logoutAdminBtn) logoutAdminBtn.onclick = performLogout;
if (logoutPresenterBtn) logoutPresenterBtn.onclick = performLogout;

/* =========================
   CONTROLLO ACCESSO DASHBOARD
   ========================= */
window.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("userRole");
  const path = window.location.pathname;

  // Controlla accesso pagine admin/presenter
  if (path.includes("dashboard-admin") && role !== "admin") {
    alert("⚠️ Accesso non autorizzato.");
    window.location.href = "index.html";
  }
  if (path.includes("dashboard-presenter") && role !== "presenter") {
    alert("⚠️ Accesso non autorizzato.");
    window.location.href = "index.html";
  }
});

/* =========================
   SEGNALAZIONE CONSOLE
   ========================= */
console.log("%cLive Quiz EMS — by Associazione Elda Marzocchi Scarzella",
  "color:#7c3aed;font-weight:bold;font-size:14px;");
