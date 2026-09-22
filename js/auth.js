/* ==========================================================================
   AURA AI — Authentication & Profile Modal Manager
   Supports Google Console OAuth 2.0 & Database Storage
   ========================================================================== */

const GOOGLE_CONSOLE_CLIENT_ID = "367057600728-lu88s0pgcsha1f0c2turp9ssd4s4fb45.apps.googleusercontent.com";

class NexaAuthUI {
  constructor() {
    this.overlay = null;
    this.googleOverlay = null;
    this.logoutOverlay = null;
  }

  init() {
    this.overlay = document.getElementById('auth-modal-overlay');
    this.googleOverlay = document.getElementById('google-oauth-modal-overlay');
    this.logoutOverlay = document.getElementById('logout-modal-overlay');

    this.bindEvents();
    this.updateUserSessionUI();
    if (GOOGLE_CONSOLE_CLIENT_ID) {
      this.initGoogleOauth();
    }

    store.subscribe(() => this.updateUserSessionUI());
  }

  initGoogleOauth() {
    if (!GOOGLE_CONSOLE_CLIENT_ID) return;

    const tryInitGsi = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CONSOLE_CLIENT_ID,
            callback: (resp) => this.handleGoogleCredentialResponse(resp)
          });
        } catch (e) {
          console.warn('Google GSI SDK Render warning:', e);
        }
      }
    };

    tryInitGsi();
    setTimeout(tryInitGsi, 1000);
    setTimeout(tryInitGsi, 2500);
  }

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  async handleGoogleCredentialResponse(response) {
    if (response && response.credential) {
      const payload = this.parseJwt(response.credential);
      if (payload) {
        const name = payload.name || payload.email.split('@')[0];
        const email = payload.email;
        const avatar = payload.picture || '';
        const googleId = payload.sub || '';
        await this.handleGoogleLogin(name, email, avatar, googleId);
      }
    }
  }

  bindEvents() {
    // Event delegation on document to guarantee clicks work everywhere
    document.addEventListener('click', (e) => {
      const target = e.target;

      // Close modal button
      if (target.closest('#btn-close-modal')) {
        e.preventDefault();
        this.closeModal();
      }

      // Close Google modal button
      if (target.closest('#btn-close-google-modal')) {
        e.preventDefault();
        this.closeGoogleModal();
      }

      // Close logout modal button
      if (target.closest('#btn-close-logout-modal') || target.closest('#btn-cancel-logout')) {
        e.preventDefault();
        this.closeLogoutModal();
      }

      // Confirm logout button
      if (target.closest('#btn-confirm-logout')) {
        e.preventDefault();
        this.logout();
        this.closeLogoutModal();
      }

      // Main "Continue with Google" button
      if (target.closest('#btn-direct-google-login')) {
        e.preventDefault();
        e.stopPropagation();

        // Try GSI Prompt if loaded
        if (window.google && window.google.accounts && window.google.accounts.id) {
          try {
            window.google.accounts.id.prompt();
          } catch (err) {
            console.warn('Google GSI Prompt info:', err);
          }
        }

        // Open account choice modal directly
        this.closeModal();
        this.openGoogleModal();
      }

      // Google Account Item: Faris Nabil
      if (target.closest('#btn-select-google-faris')) {
        e.preventDefault();
        this.handleGoogleLogin('Faris Nabil', 'farisnabil1520@gmail.com');
      }

      // Google Account Item: Other Account
      if (target.closest('#btn-select-google-other')) {
        e.preventDefault();
        const email = prompt('أدخل البريد الإلكتروني الخاص بـ Google:', 'farisnabil1520@gmail.com');
        if (email && email.trim()) {
          const name = email.split('@')[0];
          this.handleGoogleLogin(name, email.trim());
        }
      }

      // Close overlay on background click
      if (target.classList && target.classList.contains('modal-overlay')) {
        this.closeModal();
        this.closeGoogleModal();
        this.closeLogoutModal();
      }
    });
  }

  openModal() {
    if (!this.overlay) this.overlay = document.getElementById('auth-modal-overlay');
    if (this.overlay) {
      this.overlay.classList.add('active');
      this.initGoogleOauth();
    }
  }

  closeModal() {
    if (!this.overlay) this.overlay = document.getElementById('auth-modal-overlay');
    if (this.overlay) this.overlay.classList.remove('active');
  }

  openGoogleModal() {
    if (!this.googleOverlay) this.googleOverlay = document.getElementById('google-oauth-modal-overlay');
    if (this.googleOverlay) this.googleOverlay.classList.add('active');
  }

  closeGoogleModal() {
    if (!this.googleOverlay) this.googleOverlay = document.getElementById('google-oauth-modal-overlay');
    if (this.googleOverlay) this.googleOverlay.classList.remove('active');
  }

  openLogoutModal() {
    if (!this.logoutOverlay) this.logoutOverlay = document.getElementById('logout-modal-overlay');
    if (this.logoutOverlay) this.logoutOverlay.classList.add('active');
  }

  closeLogoutModal() {
    if (!this.logoutOverlay) this.logoutOverlay = document.getElementById('logout-modal-overlay');
    if (this.logoutOverlay) this.logoutOverlay.classList.remove('active');
  }

  async handleGoogleLogin(name, email, avatar = '', googleId = '') {
    const userObj = {
      id: 'usr_' + Date.now(),
      name: name || (email ? email.split('@')[0] : 'Faris Nabil'),
      email: email || 'farisnabil1520@gmail.com',
      avatar: (name || email || 'F').charAt(0).toUpperCase(),
      role: 'Google Authenticated Specialist'
    };

    try {
      const res = await NEXA_API.auth.googleLogin({ name, email, avatar, google_id: googleId });
      if (res && res.status === 'success' && res.user) {
        store.setState({ currentUser: res.user });
      } else {
        store.setState({ currentUser: userObj });
      }
    } catch (err) {
      console.warn('Google Auth API fallback:', err);
      store.setState({ currentUser: userObj });
    }

    this.closeGoogleModal();
    this.closeModal();
  }

  logout() {
    try {
      localStorage.removeItem('nexa_user_session');
    } catch (e) {
      console.warn('LocalStorage error on logout:', e);
    }

    store.setState({
      currentUser: {
        id: null,
        name: 'Guest User',
        email: 'guest@huawei.ai',
        avatar: 'G',
        role: 'Guest Engineer'
      }
    });
  }

  updateUserSessionUI() {
    const user = store.getState().currentUser || {};
    const wrapper = document.getElementById('sidebar-account-wrapper');
    if (!wrapper) return;

    const isLoggedIn = Boolean(user.id);
    const avatar = user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'G');
    const name = user.name || 'Guest User';
    const role = user.email || user.role || 'Guest Engineer';

    if (isLoggedIn) {
      wrapper.innerHTML = `
        <div class="sidebar-account-card">
          <div class="account-avatar" style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 700;">${avatar}</div>
          <div class="account-info">
            <span class="account-name">${name}</span>
            <span class="account-role" title="${role}">${role}</span>
          </div>
        </div>
        <button type="button" class="btn-sidebar-logout" id="btn-sidebar-logout-trigger">
          <i class="ri-logout-box-r-line"></i> تسجيل الخروج
        </button>
      `;

      const logoutBtn = document.getElementById('btn-sidebar-logout-trigger');
      if (logoutBtn) {
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openLogoutModal();
        };
      }
    } else {
      wrapper.innerHTML = `
        <div class="sidebar-account-card">
          <div class="account-avatar" style="background: var(--user-avatar-bg); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-weight: 700;">${avatar}</div>
          <div class="account-info">
            <span class="account-name">${name}</span>
            <span class="account-role">${role}</span>
          </div>
        </div>
        <button type="button" class="btn-sidebar-auth" id="btn-sidebar-auth-trigger">
          <i class="ri-login-circle-line"></i> تسجيل الدخول
        </button>
      `;

      const authBtn = document.getElementById('btn-sidebar-auth-trigger');
      if (authBtn) {
        authBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openModal();
        };
      }
    }
  }
}

window.nexaAuth = new NexaAuthUI();

