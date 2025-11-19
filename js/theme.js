/* ===============================
   ELDA QUIZ - GESTORE TEMA (Light/Dark)
   =============================== */

(function() {
  const THEME_KEY = 'elda-theme';
  let currentTheme = localStorage.getItem(THEME_KEY) || 'light';

  // Funzione per applicare il tema e aggiornare il pulsante
  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    
    const toggleButton = document.getElementById('themeToggleBtn');
    if (toggleButton) {
      toggleButton.textContent = (theme === 'dark') ? '☀️' : '🌙';
    }
  }

  // Funzione per creare il pulsante
  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.textContent = (currentTheme === 'dark') ? '☀️' : '🌙';
    
    // Stili per il pulsante (così non dipende da style.css)
    btn.style.position = 'fixed';
    btn.style.bottom = '1rem';
    btn.style.right = '1rem';
    btn.style.zIndex = '1001';
    btn.style.width = '3rem';
    btn.style.height = '3rem';
    btn.style.borderRadius = '50%';
    btn.style.border = 'none';
    btn.style.fontSize = '1.5rem';
    btn.style.cursor = 'pointer';
    btn.style.background = 'var(--bg-card, #fff)';
    btn.style.color = 'var(--text, #222)';
    btn.style.boxShadow = 'var(--shadow, 0 5px 15px rgba(0,0,0,0.1))';
    
    btn.addEventListener('click', () => {
      currentTheme = (document.body.dataset.theme === 'dark') ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
    
    document.body.appendChild(btn);
  }

  // Esegui tutto quando il DOM è pronto
  document.addEventListener('DOMContentLoaded', () => {
    // Applica il tema salvato al caricamento
    applyTheme(currentTheme);
    
    // Crea il pulsante
    createToggleButton();
  });

})();