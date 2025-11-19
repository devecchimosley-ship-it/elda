// ===================================================================================
// Presenter app: Gestisce Presentazioni (multiple slides)
// VERSIONE OTTIMIZZATA
// ===================================================================================
import { auth, onAuthStateChanged, logoutUser, db, doc, setDoc, collection, onSnapshot, getDocs, updateDoc, getDoc } from "./firebase.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";

// === OTTIMIZZAZIONE: Costanti per una facile modifica ===
const CHART_COLORS = ['#7c3aed', '#5b21b6', '#a855f7', '#d8b4fe'];

// Stato globale
let currentResponsesUnsub = null;
let currentChart = null;
let allPresentations = [];
let livePresentationData = null; // Contiene i dati della presentazione live
let livePresentationId = null;
let liveSlideIndex = -1;

// Elementi UI (raggruppati per chiarezza)
const pinDisplay = document.getElementById('pinDisplay');
const liveTitle = document.getElementById('liveTitle');
const liveQuestion = document.getElementById('liveQuestion');
const slideCounter = document.getElementById('slideCounter');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');
const stopPresentationBtn = document.getElementById('stopPresentationBtn');
const presentationListEl = document.getElementById('presentationList');
const logoutBtn = document.getElementById('logoutBtn');

// Protezione pagina
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'login.html';
  else loadPresentations();
});

// Logout
logoutBtn?.addEventListener('click', async () => {
  await logoutUser();
  window.location.href = 'login.html';
});

// === OTTIMIZZAZIONE: Funzione UI centralizzata ===
/**
 * Aggiorna l'intera UI del presentatore in base allo stato globale
 */
function updatePresenterUI() {
  if (!livePresentationData) {
    // Stato "Nessuna presentazione attiva"
    pinDisplay.textContent = '—';
    liveTitle.textContent = '—';
    liveQuestion.textContent = '—';
    slideCounter.textContent = '— / —';
    prevSlideBtn.disabled = true;
    nextSlideBtn.disabled = true;
    stopPresentationBtn.disabled = true; // Disabilita anche lo stop
  } else {
    // Stato "Presentazione attiva"
    pinDisplay.textContent = livePresentationData.pin || '...';
    liveTitle.textContent = livePresentationData.title;
    stopPresentationBtn.disabled = false;

    const slideData = livePresentationData.slides[liveSlideIndex];
    if (slideData) {
      liveQuestion.textContent = slideData.question;
      slideCounter.textContent = `${liveSlideIndex + 1} / ${livePresentationData.slides.length}`;
      
      prevSlideBtn.disabled = (liveSlideIndex === 0);
      nextSlideBtn.disabled = (liveSlideIndex === livePresentationData.slides.length - 1);
    }
  }
}

// Carica la lista delle presentazioni
async function loadPresentations() {
  presentationListEl.innerHTML = '<em>Caricamento...</em>';
  try {
    const snapshot = await getDocs(collection(db, "presentations"));
    allPresentations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (allPresentations.length === 0) {
      presentationListEl.innerHTML = '<em>Nessuna presentazione creata dall\'Admin.</em>';
      return;
    }
    
    presentationListEl.innerHTML = allPresentations.map(p => `
      <div class="quiz-item">
        <div style="flex:1">
          <strong>${p.title}</strong><br/>
          <small style="opacity:0.85">${(p.slides || []).length} slides</small>
        </div>
        <div style="display:flex;gap:0.4rem">
          <button class="btn btn-secondary" data-id="${p.id}" data-action="launch" 
            ${p.status === 'live' ? 'style="background:#3b82f6;color:white;"' : ''}>
            ${p.status === 'live' ? 'Live' : 'Lancia'}
          </button>
        </div>
      </div>
    `).join('');

    presentationListEl.querySelectorAll('button[data-action="launch"]').forEach(btn => {
      btn.addEventListener('click', () => launchPresentation(btn.dataset.id));
    });
  } catch (err) {
    console.error("Errore nel caricare le presentazioni:", err);
    presentationListEl.innerHTML = '<em style="color:#ef4444;">Errore nel caricare.</em>';
  }
}

// Lancia una presentazione
async function launchPresentation(id) {
  // === OTTIMIZZAZIONE: Aggiunto try...catch ===
  try {
    livePresentationData = allPresentations.find(p => p.id === id);
    if (!livePresentationData) return alert('Presentazione non trovata.');
    if (!livePresentationData.slides || livePresentationData.slides.length === 0) {
      return alert('Impossibile lanciare: questa presentazione non ha slide.');
    }
    
    livePresentationId = id;
    
    const pin = (Math.floor(Math.random() * 900000) + 100000).toString();
    // Salva il pin anche nell'oggetto locale per l'UI
    livePresentationData.pin = pin; 
    
    await updateDoc(doc(db, "presentations", id), { status: 'live', pin: pin });
    
    // Imposta stato globale e avvia dalla prima slide (index 0)
    await goToSlide(0); 
    await loadPresentations(); // Aggiorna la lista per mostrare il bottone "Live"
  } catch (err) {
    console.error("Errore durante il lancio della presentazione:", err);
    alert("Si è verificato un errore nel lanciare la presentazione. Riprova.");
    // Resetta lo stato in caso di fallimento
    livePresentationData = null;
    livePresentationId = null;
  }
}

// Naviga a una slide specifica (index)
async function goToSlide(index) {
  // === OTTIMIZZAZIONE: Aggiunto try...catch ===
  try {
    if (!livePresentationData || !livePresentationData.slides) return;
    if (index < 0 || index >= livePresentationData.slides.length) return;
    
    liveSlideIndex = index;

    // Aggiorna stato globale per i player
    await setDoc(doc(db, "status", "livePresentation"), { 
      activeId: livePresentationId, 
      currentSlide: liveSlideIndex 
    });

    // === OTTIMIZZAZIONE: Chiama la funzione UI centralizzata ===
    updatePresenterUI();

    // Riavvia il listener del grafico per la nuova slide
    const currentSlideData = livePresentationData.slides[liveSlideIndex];
    startResponsesListener(livePresentationId, liveSlideIndex, currentSlideData.answers);
  } catch (err) {
    console.error("Errore nel cambiare slide:", err);
    alert("Si è verificato un errore nel cambiare slide. Riprova.");
  }
}

// Ferma la presentazione
stopPresentationBtn.addEventListener('click', async () => {
  // === OTTIMIZZAZIONE: Aggiunto try...catch ===
  try {
    if(livePresentationId) {
      await updateDoc(doc(db, "presentations", livePresentationId), { status: 'finished' });
    }
    // Resetta lo stato globale per i player
    await setDoc(doc(db, "status", "livePresentation"), { activeId: null, currentSlide: -1 });

    // Resetta stato locale
    livePresentationData = null;
    livePresentationId = null;
    liveSlideIndex = -1;
    
    // === OTTIMIZZAZIONE: Chiama la funzione UI centralizzata ===
    updatePresenterUI();
    
    if (currentResponsesUnsub) currentResponsesUnsub();
    if (currentChart) {
      currentChart.data.labels = [];
      currentChart.data.datasets[0].data = [];
      currentChart
