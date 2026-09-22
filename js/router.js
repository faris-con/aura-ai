/* ==========================================================================
   NEXA — HCIA AI Intelligence Platform
   SPA Router & View Transition Engine
   ========================================================================== */

class NexaRouter {
  constructor() {
    this.routes = {
      'home': 'view-home',
      'chat': 'view-chat',
      'explore': 'view-explore',
      'ailab': 'view-ailab',
      'history': 'view-history',
      'account': 'view-account'
    };
    this.currentRoute = 'home';
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('popstate', () => this.handleHashChange());

    // Initial route check
    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const targetRoute = this.routes[hash] ? hash : 'home';
    this.navigateTo(targetRoute, false);
  }

  navigateTo(routeKey, updateHistory = true) {
    if (!this.routes[routeKey]) routeKey = 'home';
    this.currentRoute = routeKey;

    if (updateHistory) {
      window.location.hash = routeKey;
    }

    // Update SPA state store
    store.setState({ currentView: routeKey });

    // Execute view visibility swap
    const targetViewId = this.routes[routeKey];
    const allViews = document.querySelectorAll('.view-pane');

    allViews.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const dataRoute = link.getAttribute('data-route');
      if (dataRoute === routeKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Handle view specific lifecycle hooks
    this.onViewChanged(routeKey);
  }

  onViewChanged(routeKey) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (routeKey === 'home') {
      nexaRobot.init('spline-robot-target');
    } else if (routeKey === 'chat') {
      if (window.nexaChat) {
        window.nexaChat.scrollToBottom();
      }
    } else if (routeKey === 'history') {
      if (window.nexaHistoryUI) {
        window.nexaHistoryUI.renderHistoryList();
      }
    }
  }

  /**
    * Cinematic Transition: Hero Robot -> Full Screen Chat
    */
  transitionHeroToChat(initialPrompt) {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
      store.createNextChat(initialPrompt);
      this.navigateTo('chat');
      return;
    }

    // Add fade out animation class to hero elements
    heroSection.classList.add('animate-fade-out');

    setTimeout(() => {
      heroSection.classList.remove('animate-fade-out');
      // Create new chat with prompt & navigate
      store.createNextChat(initialPrompt);
      this.navigateTo('chat');

      // Dispatch AI response generator
      if (window.nexaChat) {
        window.nexaChat.processAIResponse(initialPrompt);
      }
    }, 350);
  }
}

const router = new NexaRouter();
