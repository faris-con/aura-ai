/* ==========================================================================
   NEXA — HCIA AI Intelligence Platform
   History & Analysis Log UI Controller
   ========================================================================== */

class NexaHistoryUI {
  constructor() {
    this.tableTarget = null;
    this.searchInput = null;
    this.filterTypeSelect = null;
  }

  init() {
    this.tableTarget = document.getElementById('history-table-body');
    this.searchInput = document.getElementById('history-search-input');
    this.filterTypeSelect = document.getElementById('history-type-filter');

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.renderHistoryList());
    }

    if (this.filterTypeSelect) {
      this.filterTypeSelect.addEventListener('change', () => this.renderHistoryList());
    }

    const clearBtn = document.getElementById('btn-clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your AI analysis history log?')) {
          store.setState({ historyItems: [] });
          this.renderHistoryList();
        }
      });
    }

    this.renderHistoryList();
  }

  renderHistoryList() {
    if (!this.tableTarget) return;

    const items = store.getState().historyItems || [];
    const query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
    const selectedType = this.filterTypeSelect ? this.filterTypeSelect.value : 'ALL';

    const filtered = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(query) || item.result.toLowerCase().includes(query);
      const matchesType = selectedType === 'ALL' || item.type.toUpperCase().includes(selectedType.toUpperCase());
      return matchesSearch && matchesType;
    });

    this.tableTarget.innerHTML = '';

    if (filtered.length === 0) {
      this.tableTarget.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-subtle); padding: 3rem 1rem;">
            <i class="ri-history-line" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
            No matching AI analysis records found in history.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="model-tag">${this.escapeHtml(item.type)}</span></td>
        <td style="font-weight: 600; color: var(--text-main);">${this.escapeHtml(item.title)}</td>
        <td style="color: var(--secondary-cyan); font-family: var(--font-mono);">${this.escapeHtml(item.result)}</td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${this.escapeHtml(item.date)}</td>
        <td>
          <button class="chip-btn" style="padding: 0.2rem 0.6rem; font-size: 0.78rem;" onclick="router.transitionHeroToChat('Re-evaluate history item: ${this.escapeHtml(item.title)}')">
            <i class="ri-arrow-right-line"></i> Re-examine
          </button>
        </td>
      `;
      this.tableTarget.appendChild(tr);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.nexaHistoryUI = new NexaHistoryUI();
