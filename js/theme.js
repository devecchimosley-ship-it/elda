// theme.js - Versione migliorata
/* ===============================
   ELDA QUIZ - GESTORE TEMA MIGLIORATO (Light/Dark)
   =============================== */

(function() {
  const THEME_KEY = 'elda-theme';
  let currentTheme = localStorage.getItem(THEME_KEY) || 'light';

  // Funzione per applicare il tema e aggiornare il pulsante
  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    
    // Aggiorna il pulsante toggle
    const toggleButton = document.getElementById('themeToggleBtn');
    if (toggleButton) {
      toggleButton.innerHTML = (theme === 'dark') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
      toggleButton.setAttribute('aria-label', 
        theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro');
    }
    
    // Emetti evento per notificare il cambio tema
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  // Funzione per creare il pulsante toggle
  function createToggleButton() {
    // Verifica se il pulsante esiste già
    if (document.getElementById('themeToggleBtn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.className = 'theme-toggle-btn';
    btn.innerHTML = (currentTheme === 'dark') 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
    btn.setAttribute('aria-label', 
      currentTheme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro');
    
    // Stili per il pulsante
    btn.style.position = 'fixed';
    btn.style.bottom = '1.5rem';
    btn.style.right = '1.5rem';
    btn.style.zIndex = '1001';
    btn.style.width = '3.5rem';
    btn.style.height = '3.5rem';
    btn.style.borderRadius = '50%';
    btn.style.border = 'none';
    btn.style.fontSize = '1.2rem';
    btn.style.cursor = 'pointer';
    btn.style.background = 'var(--bg-card)';
    btn.style.color = 'var(--text)';
    btn.style.boxShadow = 'var(--shadow)';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.transition = 'all 0.3s ease';
    
    btn.addEventListener('click', () => {
      currentTheme = (document.body.dataset.theme === 'dark') ? 'light' : 'dark';
      applyTheme(currentTheme);
      
      // Aggiungi effetto di click
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 150);
    });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
    });
    
    btn.addEventListener('mouseleave', () => {
      if (btn.style.transform !== 'scale(0.9)') {
        btn.style.transform = 'scale(1)';
      }
    });
    
    document.body.appendChild(btn);
  }

  // Rileva la preferenza del sistema
  function detectSystemPreference() {
    if (localStorage.getItem(THEME_KEY) === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        currentTheme = 'dark';
        applyTheme('dark');
      }
    }
  }

  // Ascolta i cambiamenti della preferenza di sistema
  function watchSystemPreference() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem(THEME_KEY) === null) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
      }
    });
  }

  // Esegui tutto quando il DOM è pronto
  document.addEventListener('DOMContentLoaded', () => {
    // Applica il tema salvato al caricamento
    applyTheme(currentTheme);
    
    // Rileva la preferenza di sistema se non c'è preferenza salvata
    detectSystemPreference();
    
    // Crea il pulsante
    createToggleButton();
    
    // Ascolta i cambiamenti della preferenza di sistema
    watchSystemPreference();
  });

  // Esponi le funzioni per un uso esterno
  window.themeManager = {
    getCurrentTheme: () => currentTheme,
    setTheme: (theme) => {
      if (['light', 'dark'].includes(theme)) {
        currentTheme = theme;
        applyTheme(theme);
      }
    },
    toggleTheme: () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
    }
  };
})();
