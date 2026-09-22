/* ==========================================================================
   NEXA — Main Application Entry Point
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c NEXA — Chat-First AI Platform Initializing...', 'background: #8B5CF6; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

  // Initialize Modules
  if (window.nexaTheme) window.nexaTheme.init();
  if (window.nexaRobot) window.nexaRobot.init();
  if (window.nexaSidebar) window.nexaSidebar.init();
  if (window.nexaChat) window.nexaChat.init();
  if (window.nexaAuth) window.nexaAuth.init();
});
