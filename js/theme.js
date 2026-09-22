/* ==========================================================================
   NEXA — Theme Controller (Dark & Light Mode Switcher)
   ========================================================================== */

class NexaThemeController {
  constructor() {
    this.currentTheme = NexaStorage.getTheme();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    console.log(`NEXA Theme Initialized: ${this.currentTheme.toUpperCase()} MODE`);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    NexaStorage.setTheme(theme);

    const themeIcon = document.getElementById('theme-icon');
    const mobileThemeIcon = document.getElementById('mobile-theme-icon');
    const themeText = document.getElementById('theme-text');

    if (theme === 'dark') {
      if (themeIcon) themeIcon.className = 'ri-sun-line';
      if (mobileThemeIcon) mobileThemeIcon.className = 'ri-sun-line';
      if (themeText) themeText.textContent = 'Light Mode';
    } else {
      if (themeIcon) themeIcon.className = 'ri-moon-line';
      if (mobileThemeIcon) mobileThemeIcon.className = 'ri-moon-line';
      if (themeText) themeText.textContent = 'Dark Mode';
    }
  }

  toggle() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  bindEvents() {
    const btn = document.getElementById('btn-theme-toggle');
    const mobileBtn = document.getElementById('btn-theme-toggle-mobile');

    if (btn) btn.addEventListener('click', () => this.toggle());
    if (mobileBtn) mobileBtn.addEventListener('click', () => this.toggle());
  }
}

window.nexaTheme = new NexaThemeController();
