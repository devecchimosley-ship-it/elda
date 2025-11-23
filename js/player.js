/* ===============================
   PLAYER LOGIC — Logica per Presentazioni (multi-slide)
   =============================== */
import { db, doc, getDoc, onSnapshot, setDoc, collection } from "./firebase.js";

// --- Stato Globale ---
let currentPresentationId = null;
let currentSlideIndex = -1;
let currentSlideData = null;
let currentPresentationData = null;
let answered = false;
const PLAYER_KEY = 'elda_player_id'; // Chiave per salvare l'ID unico del giocatore

// --- Elementi UI ---
const nickEl = document.getElementById('nick');
const pinInput = document.getElementById('joinPin');
const joinBtn = document.getElementById('joinBtn');
const msgEl = document.getElementById('playerMsg');

const waitingSection = document.getElementById('waitingSection');
const pinSection = document.getElementById('pinSection');
const quizQuestionEl = document.getElementById('quizQuestion');
const thanksSection = document.getElementById('thanksSection');
const answersContainer = document.getElementById('answersContainer');

// --- Funzioni Helper ---

/**
 * Mostra una sezione dell'interfaccia e nasconde le altre.
 * @param {'waiting' | 'pin' | 'quiz' | 'thanks'} sectionId
 */
function showContent(sectionId) {
  // Nascondi tutto
  waitingSection.classList.add('hidden');
  pinSection.classList.add('hidden');
  quizQuestionEl.classList.add('hidden');
  thanksSection.classList.add('hidden');
  answersContainer.style.display = 'none'; // La griglia si nasconde

  // Mostra solo quella richiesta
  if (sectionId === 'waiting') waitingSection.classList.remove('hidden');
  if (sectionId === 'pin') pinSection.classList.remove('hidden');
  if (sectionId === 'thanks') thanksSection.classList.remove('hidden');
  if (sectionId === 'quiz') {
    quizQuestionEl.classList.remove('hidden');
    answersContainer.style.display = 'grid'; // Mostra la griglia
  }
}

/** Mostra un messaggio (es. PIN errato) */
function showMessage(text, isError = false) {
  if (msgEl) {
    msgEl.textContent = text;
    // Cambia colore se è un errore
    msgEl.style.color = isError ? '#ef4444' : 'var(--text-muted)';
  }
}

/** Ottiene un ID unico per questo browser */
function getPlayerId() {
  let id = localStorage.getItem(PLAYER_KEY);
  if (!id) {
    id = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(PLAYER_KEY, id);
  }
  return id;
}

/** Legge i parametri dall'URL (es. ?nick=Test) */
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

// --- Logica Principale ---

// 1. Inizializza Giocatore
const nick = decodeURIComponent(getParam('nick') || 'Giocatore');
if (nickEl) nickEl.textContent = nick;
const pinParam = getParam('pin');
if (pinInput && pinParam) pinInput.value = pinParam;

// 2. Listener per il pulsante e per il tasto Invio
joinBtn.addEventListener('click', joinWithPin);
pinInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinWithPin();
});

// 3. Funzione per entrare col PIN
async function joinWithPin() {
  const pin = pinInput.value.trim();
  if (!currentPresentationId) return showMessage('Nessuna presentazione attiva.', true);
  if (pin.length < 6) return showMessage('Inserisci un PIN valido.', true);

  joinBtn.disabled = true;
  showMessage('Verifica PIN...');

  try {
    const pSnap = await getDoc(doc(db, 'presentations', currentPresentationId));
    if (!pSnap.exists()) {
      showMessage('Presentazione non trovata.', true);
      joinBtn.disabled = false;
      return;
    }
    
    currentPresentationData = pSnap.data();
    
    // Controlla il PIN
    if (String(currentPresentationData.pin) !== String(pin)) {
      currentPresentationData = null;
      showMessage('PIN non corretto. Riprova.', true);
      joinBtn.disabled = false;
      return;
    }

    // PIN Corretto!
    // Recupera la slide corrente dallo stato globale
    const liveStatus = await getDoc(doc(db, "status", "livePresentation"));
    currentSlideIndex = liveStatus.data().currentSlide;
    
    // Carica la slide
    loadQuizSlide();
    
  } catch (err) {
    console.error('Errore verifica PIN:', err);
    showMessage('Errore durante la verifica del PIN.', true);
    joinBtn.disabled = false;
  }
}

// 4. Carica la slide corrente (Quiz o Poll)
function loadQuizSlide() {
  if (!currentPresentationData || currentSlideIndex < 0) return;

  currentSlideData = currentPresentationData.slides[currentSlideIndex];
  if (!currentSlideData) return; // Slide non trovata

  // Aggiorna il testo della domanda
  quizQuestionEl.textContent = currentSlideData.question || '';
  answersContainer.innerHTML = '';
  
  // Colori "bellini" presi da style.css
  const colors = ['btn-red', 'btn-blue', 'btn-yellow', 'btn-green']; 

  // Crea i pulsanti risposta
  currentSlideData.answers.forEach((ans, idx) => {
    const btn = document.createElement('button');
    btn.textContent = String(ans);
    // Applica le classi CSS
    btn.className = 'player-answer-btn ' + colors[idx % colors.length];
    btn.onclick = () => submitAnswer(idx);
    answersContainer.appendChild(btn);
  });

  // Mostra la domanda e i pulsanti
  showContent('quiz');
}

// 5. Invia la risposta al database
async function submitAnswer(answerIndex) {
  if (answered) return; // Impedisce risposte multiple
  answered = true;
  const playerId = getPlayerId();

  // Disabilita i pulsanti per dare feedback visivo
  answersContainer.querySelectorAll('button').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.7';
  });

  try {
    // Salva la risposta nella subcollection 'responses'
    const respRef = doc(db, 'presentations', currentPresentationId, 'responses', `${playerId}_slide${currentSlideIndex}`);
    
    await setDoc(respRef, { 
      answer: answerIndex, 
      slide: currentSlideIndex, // Salva l'indice della slide
      nick: nick, 
      ts: Date.now() 
    });
    
    // Mostra la schermata di ringraziamento
    showContent('thanks');
  } catch (err) {
    console.error('Errore invio risposta:', err);
    // Se c'è un errore, riabilita
    answered = false; 
    answersContainer.querySelectorAll('button').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
}

// 6. Listener Globale (il cuore dell'app)
// Ascolta i cambiamenti dallo stato "live"
onSnapshot(doc(db, 'status', 'livePresentation'), async (snap) => {
  const data = snap.data();
  
  if (data && data.activeId && data.currentSlide >= 0) {
    // === C'È UNA PRESENTAZIONE ATTIVA ===
    
    if (currentPresentationId !== data.activeId) {
      // È una *nuova* presentazione, resetta tutto
      currentPresentationId = data.activeId;
      currentSlideIndex = -1;
      currentPresentationData = null;
      answered = false;
      
      showMessage('Presentazione attiva. Inserisci PIN.');
      showContent('pin');
    }
    
    if (currentSlideIndex !== data.currentSlide && currentPresentationData) {
      // È una *nuova slide* della stessa presentazione
      currentSlideIndex = data.currentSlide;
      answered = false; // Permetti di rispondere
      loadQuizSlide();
    }

  } else {
    // === NESSUNA PRESENTAZIONE ATTIVA ===
    currentPresentationId = null;
    currentSlideIndex = -1;
    currentPresentationData = null;
    showMessage('');
    showContent('waiting'); // Torna alla schermata di attesa
  }
});

// --- Avvio ---
// All'inizio, mostra sempre la schermata di attesa
showContent('waiting');
