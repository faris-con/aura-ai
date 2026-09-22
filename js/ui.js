/* ==========================================================================
   NEXA — HCIA AI Intelligence Platform
   UI Polish, Magnetic Buttons, & Micro-interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Magnet Button Hover Effect
  const magnetBtns = document.querySelectorAll('.chip-btn, .btn-send, .nav-link');

  magnetBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });

  // Global Keydown (e.g. Esc closes modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.nexaAuth) {
        window.nexaAuth.closeModal();
      }
    }
  });
});
