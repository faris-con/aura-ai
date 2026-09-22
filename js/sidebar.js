/* ==========================================================================
   AURA AI — Sidebar & Conversation History Manager
   ========================================================================== */

class NexaSidebarUI {
  constructor() {
    this.listContainer = null;
    this.sidebar = null;
    this.searchQuery = '';
  }

  init() {
    this.listContainer = document.getElementById('sidebar-convos-list');
    this.sidebar = document.getElementById('nexa-sidebar');

    this.bindEvents();
    this.renderConversations();

    store.subscribe(() => this.renderConversations());
  }

  bindEvents() {
    const newChatBtn = document.getElementById('btn-new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        store.createNewChat();
        this.closeMobileSidebar();
      });
    }

    const toggleBtn = document.getElementById('btn-mobile-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (this.sidebar) {
          this.sidebar.classList.toggle('mobile-open');
        }
      });
    }

    const searchInput = document.getElementById('history-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderConversations();
      });
    }
  }

  renderConversations() {
    if (!this.listContainer) return;

    const state = store.getState();
    const allConvos = state.conversations || [];
    const activeId = state.activeChatId;

    // Filter by search query
    const filteredConvos = allConvos.filter(c => {
      if (!this.searchQuery) return true;
      return c.title.toLowerCase().includes(this.searchQuery);
    });

    // Update count badge
    const badge = document.getElementById('history-count-badge');
    if (badge) {
      badge.textContent = allConvos.length;
    }

    this.listContainer.innerHTML = '';

    if (filteredConvos.length === 0) {
      this.listContainer.innerHTML = `
        <div class="empty-history-card">
          <i class="ri-chat-search-line"></i>
          <span>${this.searchQuery ? 'No matching chats found' : 'No conversation history'}</span>
        </div>
      `;
      return;
    }

    filteredConvos.forEach(c => {
      const item = document.createElement('div');
      item.className = `convo-nav-item ${c.id === activeId && state.isChatActive ? 'active' : ''}`;

      let icon = 'ri-chat-3-line';
      const titleLower = c.title.toLowerCase();
      if (titleLower.includes('image') || titleLower.includes('cnn') || titleLower.includes('vision')) {
        icon = 'ri-eye-line';
      } else if (titleLower.includes('regression') || titleLower.includes('predict') || titleLower.includes('fraud')) {
        icon = 'ri-line-chart-line';
      } else if (titleLower.includes('classify') || titleLower.includes('churn')) {
        icon = 'ri-shape-line';
      }

      item.innerHTML = `
        <div class="convo-icon-badge">
          <i class="${icon}"></i>
        </div>
        <span class="convo-text" title="${this.escapeHtml(c.title)}">${this.escapeHtml(c.title)}</span>
        
        <div class="convo-actions-group">
          <button type="button" class="convo-action-btn btn-rename" title="Rename Title">
            <i class="ri-edit-line"></i>
          </button>
          <button type="button" class="convo-action-btn btn-delete" title="Delete Chat">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;

      // Select chat
      item.addEventListener('click', (e) => {
        if (e.target.closest('.convo-action-btn')) return;
        store.setState({ activeChatId: c.id, isChatActive: true });
        this.closeMobileSidebar();
      });

      // Rename button
      const renameBtn = item.querySelector('.btn-rename');
      if (renameBtn) {
        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newName = prompt('Enter new conversation title:', c.title);
          if (newName && newName.trim()) {
            store.renameConversation(c.id, newName);
          }
        });
      }

      // Delete button
      const deleteBtn = item.querySelector('.btn-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete conversation "${c.title}"?`)) {
            store.deleteConversation(c.id);
          }
        });
      }

      this.listContainer.appendChild(item);
    });
  }

  closeMobileSidebar() {
    if (this.sidebar && window.innerWidth <= 768) {
      this.sidebar.classList.remove('mobile-open');
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.nexaSidebar = new NexaSidebarUI();
