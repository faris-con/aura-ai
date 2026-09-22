/* ==========================================================================
   NEXA — Spline 3D Robot Integration (Canvas Runtime, Transparent Background)
   Uses @splinetool/runtime for direct canvas control
   ========================================================================== */

class NexaRobotController {
  constructor() {
    this.canvasId = 'spline-robot-iframe';
    this.isInitialized = false;
    this.app = null;
  }

  async init() {
    const iframe = document.getElementById(this.canvasId);
    if (!iframe) return;

    // This controller handles the ambient glow aura motion effect
    this.bindAuraMotion();

    this.isInitialized = true;
    console.log('NEXA Robot 3D Model Loaded Successfully via iframe.');
  }

  bindAuraMotion() {
    const welcomeView = document.querySelector('.initial-welcome-view');
    const auraCore = document.querySelector('.glow-cyan-core');

    if (!welcomeView || !auraCore) return;

    welcomeView.addEventListener('mousemove', (e) => {
      const rect = welcomeView.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      auraCore.style.transform = `translate(calc(-50% + ${x * 0.05}px), calc(-50% + ${y * 0.05}px)) scale(1.04)`;
    });

    welcomeView.addEventListener('mouseleave', () => {
      auraCore.style.transform = `translate(-50%, -50%) scale(1)`;
    });
  }
}

window.nexaRobot = new NexaRobotController();
