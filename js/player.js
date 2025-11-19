// ===============================
// PLAYER LOGIC — Logica per Presentazioni (multi-slide)
// ===============================
import { db, doc, getDoc, onSnapshot, setDoc, collection } from "./firebase.js";

let currentPresentationId = null;
let currentSlideIndex = -1;
let currentSlideData = null;
let currentPresentationData = null; // Contiene l'intera presentazione
let answered = false;
const PLAYER_KEY = 'elda_player_id';

function getPlayerId() {
  let id = localStorage.getItem(PLAYER_KEY);
  if (!id) {
    id = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,9);
    localStorage.setItem(PLAYER_KEY, id);
  }
  return id;
}

function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

// UI helpers
function showSection(id, show) {
  const el = document.getElementById(id);
  if (el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
}
function showMessage(text) {
  const el = document.getElementById('playerMsg');
  if (el) el.textContent = text;
}
const nick = decodeURIComponent(getParam('nick') || 'Giocatore');
document.getElementById('nick').textContent = nick;
const pinInput = document.getElementById('joinPin');
if(pinInput) pinInput.value = getParam('pin') || '';


// Listen to global livePresentation status
onSnapshot(doc(db, 'status', 'livePresentation'), async (snap) => {
  const data = snap.data();
  
  if (data && data.activeId && data.currentSlide >= 0) {
    // === C'È UNA PRESENTAZIONE ATTIVA ===
    
    // Controlla se è una *nuova* presentazione (serve il PIN)
    if (currentPresentationId !== data.activeId) {
      currentPresentationId = data.activeId;
      currentSlideIndex = -1; // Resetta l'indice slide
      currentPresentationData = null; // Resetta i dati
      answered = false;
      
      showMessage('Presentazione attiva. Inserisci PIN.');
      showSection('pinSection', true);
      showSection('waitingSection', false);
      showSection('quizSection', false);
      showSection('thanksSection', false);
    }
    
    // Controlla se è una *nuova slide* (stessa presentazione)
    if (currentSlideIndex !== data.currentSlide && currentPresentationData) {
      currentSlideIndex = data.currentSlide;
      answered = false; // Permetti di rispondere alla nuova slide
      loadQuizSlide(); // Carica la nuova slide
    }

  } else {
    // === NESSUNA PRESENTAZIONE ATTIVA ===
    currentPresentationId = null;
    currentSlideIndex = -1;
    currentPresentationData = null;
    showMessage('In attesa del presentatore...');
    showSection('pinSection', false);
    showSection('quizSection', false);
    showSection('thanksSection', false);
    showSection('waitingSection', true);
  }
});

// Verify PIN and load presentation
window.joinWithPin = async function() {
  const pin = (document.getElementById('joinPin') || {}).value || '';
  if (!currentPresentationId) return showMessage('Nessuna presentazione attiva.');
  if (!pin) return showMessage('Inserisci il PIN.');

  try {
    const pSnap = await getDoc(doc(db, 'presentations', currentPresentationId));
    if (!pSnap.exists()) return showMessage('Presentazione non trovata.');
    
    currentPresentationData = pSnap.data(); // Salva i dati
    
    if (String(currentPresentationData.pin) !== String(pin)) {
      currentPresentationData = null; // PIN errato, resetta
      return showMessage('PIN non corretto.');
    }

    // PIN corretto -> carica la slide corrente
    // (Il listener 'onSnapshot' ha già l'indice slide, lo prendiamo da lì)
    const liveStatus = await getDoc(doc(db, "status", "livePresentation"));
    currentSlideIndex = liveStatus.data().currentSlide;
    
    loadQuizSlide();
    
  } catch (err) {
    console.error('Errore verifica PIN:', err);
    showMessage('Errore durante la verifica del PIN.');
  }
};

// Carica la slide corrente (Quiz o Poll)
function loadQuizSlide() {
  if (!currentPresentationData || currentSlideIndex < 0) return;

  currentSlideData = currentPresentationData.slides[currentSlideIndex];
  if (!currentSlideData) return; // Slide non trovata

  const questionEl = document.getElementById('quizQuestion');
  questionEl.textContent = currentSlideData.question || '';

  const answersBox = document.getElementById('answersContainer');
  answersBox.innerHTML = '';
  
  // Colori standard per quiz/poll
  const colors = ['#ef4444', '#3b82f6', '#fbbf24', '#10b981']; 

  currentSlideData.answers.forEach((ans, idx) => {
    const btn = document.createElement('button');
    btn.textContent = String(ans);
    btn.className = 'answer-btn';
    btn.style.backgroundColor = colors[idx % colors.length]; // Applica colori
    btn.onclick = () => submitAnswer(idx);
    answersBox.appendChild(btn);
  });

  showSection('pinSection', false);
  showSection('waitingSection', false);
  showSection('thanksSection', false);
  showSection('quizSection', true);
}

// Invia risposta
async function submitAnswer(answerIndex) {
  if (answered) return;
  answered = true;
  const playerId = getPlayerId();

  try {
    // Salva la risposta nella subcollection 'responses', taggandola con la slide
    const respRef = doc(db, 'presentations', currentPresentationId, 'responses', `${playerId}_slide${currentSlideIndex}`);
    
    await setDoc(respRef, { 
      answer: answerIndex, 
      slide: currentSlideIndex, // Salva l'indice della slide
      nick: nick, 
      ts: Date.now() 
    });
    
    showSection('quizSection', false);
    showSection('thanksSection', true);
  } catch (err) {
    console.error('Errore invio risposta:', err);
    showMessage('Errore invio risposta. Riprova.');
    answered = false;
  }
}
