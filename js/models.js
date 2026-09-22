/* ==========================================================================
   NEXA — ML Models Orchestrator & Result Card Generator
   ========================================================================== */

class NexaModelsUI {
  renderModelCardHTML(result) {
    let typeTag = result.type || 'AI INFERENCE';
    let icon = 'ri-cpu-line';

    if (typeTag.toLowerCase().includes('cnn') || typeTag.toLowerCase().includes('vision')) icon = 'ri-eye-line';
    else if (typeTag.toLowerCase().includes('class')) icon = 'ri-shape-line';
    else if (typeTag.toLowerCase().includes('reg')) icon = 'ri-line-chart-line';

    return `
      <div class="model-result-box animate-slide-up">
        <div class="model-result-header">
          <i class="${icon}"></i> ${typeTag.toUpperCase()} MODEL RESULT
        </div>
        
        <div class="model-pred-title">${this.escapeHtml(result.prediction)}</div>
        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          Confidence Score: <strong style="color: var(--text-main);">${result.confidence}%</strong>
        </div>

        <div class="gemini-block">
          <div class="gemini-label"><i class="ri-sparkles-fill"></i> AURA AI EXPLANATION LAYER</div>
          <div>${this.escapeHtml(result.explanation)}</div>
        </div>

        <button class="model-chip" style="margin-top: 0.85rem; padding: 0.4rem 0.85rem; font-size: 0.82rem;" onclick="window.nexaChat.sendCustomPrompt('Tell me more about the result for ${this.escapeHtml(result.prediction)}')">
          <i class="ri-chat-1-line"></i> Ask AURA about this result
        </button>
      </div>
    `;
  }

  renderFraudUploadCard() {
    const inputId = 'fraud-chat-file-input-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    return `
      <div class="fraud-upload-widget animate-fade-in" style="background: var(--surface-card, #FFFFFF); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 12px; padding: 1.25rem; margin-top: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: #8B5CF6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.6rem; border-radius: 6px; width: fit-content; margin-bottom: 0.75rem; font-weight: 600;">
          <i class="ri-shape-line"></i> FEATURE CLASSIFICATION — CREDIT CARD FRAUD
        </div>

        <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
          Upload Transaction Dataset (CSV / Excel)
        </div>
        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
          Select a <strong>CSV</strong> (<code>.csv</code>) or <strong>Excel</strong> (<code>.xlsx</code> / <code>.xls</code>) dataset containing <code>V1</code>–<code>V28</code> anonymized features and <code>Amount</code>.
        </div>

        <div class="fraud-dropzone" style="border: 2px dashed rgba(139, 92, 246, 0.35); border-radius: 10px; padding: 1.5rem 1rem; text-align: center; background: rgba(139, 92, 246, 0.02); cursor: pointer; transition: all 0.2s ease;" onclick="const inp = document.getElementById('${inputId}'); if (inp) { inp.value = ''; inp.click(); }">
          <i class="ri-file-upload-line" style="font-size: 2.2rem; color: #8B5CF6; display: block; margin-bottom: 0.5rem;"></i>
          <span style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">Click to upload CSV or Excel file</span>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">Supported formats: .csv, .xlsx, .xls</div>
        </div>

        <input type="file" id="${inputId}" accept=".csv, .xlsx, .xls" style="display: none;" onchange="window.nexaChat.handleFraudFileSelected(this.files)">
      </div>
    `;
  }

  renderCnnUploadCard() {
    const inputId = 'cnn-chat-file-input-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    return `
      <div class="cnn-upload-widget animate-fade-in" style="background: var(--surface-card, #FFFFFF); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 1.25rem; margin-top: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: #06B6D4; background: rgba(6, 182, 212, 0.1); padding: 0.25rem 0.6rem; border-radius: 6px; width: fit-content; margin-bottom: 0.75rem; font-weight: 600;">
          <i class="ri-eye-line"></i> CNN VISION — TOMATO LEAF DISEASE ANALYSIS
        </div>

        <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
          Upload Leaf Image for Vision CNN
        </div>
        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
          Select a high-resolution leaf image (<code>.jpg</code>, <code>.png</code>, <code>.webp</code>) to extract spatial tensor feature maps and detect plant diseases.
        </div>

        <div class="cnn-dropzone" style="border: 2px dashed rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 1.5rem 1rem; text-align: center; background: rgba(6, 182, 212, 0.03); cursor: pointer; transition: all 0.2s ease;" onclick="const inp = document.getElementById('${inputId}'); if (inp) { inp.value = ''; inp.click(); }">
          <i class="ri-image-add-line" style="font-size: 2.2rem; color: #06B6D4; display: block; margin-bottom: 0.5rem;"></i>
          <span style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">Click to upload tomato leaf image</span>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">Supported formats: JPG, PNG, WEBP</div>
        </div>

        <input type="file" id="${inputId}" accept=".jpg, .jpeg, .png, .webp" style="display: none;" onchange="window.nexaChat.handleCnnFileSelected(this.files)">
      </div>
    `;
  }

  renderRegressionUploadCard() {
    const inputId = 'regression-chat-file-input-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    return `
      <div class="regression-upload-widget animate-fade-in" style="background: var(--surface-card, #FFFFFF); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 1.25rem; margin-top: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: #F59E0B; background: rgba(245, 158, 11, 0.1); padding: 0.25rem 0.6rem; border-radius: 6px; width: fit-content; margin-bottom: 0.75rem; font-weight: 600;">
          <i class="ri-line-chart-line"></i> REGRESSION — HOUSE PRICE PREDICTION
        </div>

        <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
          Upload Housing Dataset (CSV)
        </div>
        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
          Select a <strong>CSV</strong> file containing property features (square footage, quality ratings, rooms, etc.) for StackingRegressor price estimation.
        </div>

        <div class="regression-dropzone" style="border: 2px dashed rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 1.5rem 1rem; text-align: center; background: rgba(245, 158, 11, 0.03); cursor: pointer; transition: all 0.2s ease;" onclick="const inp = document.getElementById('${inputId}'); if (inp) { inp.value = ''; inp.click(); }">
          <i class="ri-file-upload-line" style="font-size: 2.2rem; color: #F59E0B; display: block; margin-bottom: 0.5rem;"></i>
          <span style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">Click to upload CSV dataset</span>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">Supported format: .csv</div>
        </div>

        <input type="file" id="${inputId}" accept=".csv" style="display: none;" onchange="window.nexaChat.handleRegressionFileSelected(this.files)">
      </div>
    `;
  }

  renderFraudBatchResultCard(data, cardId = 'fraud-results-' + Date.now()) {
    const total = data.total_transactions || 0;
    const fraud = data.fraud_count || 0;
    const genuine = data.genuine_count || 0;
    const fraudPct = data.fraud_percentage || 0;
    const results = data.results || [];

    window._fraudResultsCache = window._fraudResultsCache || {};
    window._fraudResultsCache[cardId] = { results, filter: 'all', page: 1, pageSize: 5 };

    return `
      <div id="${cardId}" class="model-result-box animate-slide-up" style="border-color: rgba(139, 92, 246, 0.3);">
        <div class="model-result-header" style="background: rgba(139, 92, 246, 0.12); color: #8B5CF6;">
          <i class="ri-shield-keyhole-line"></i> AUTHORITATIVE XGBOOST MODEL PREDICTIONS
        </div>

        <!-- Summary Stat Chips -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin: 0.85rem 0 1.25rem 0;">
          <div style="background: var(--bg-light-alt, rgba(0,0,0,0.03)); border: 1px solid var(--border-light); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PROCESSED</div>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${total.toLocaleString()}</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #10B981; font-weight: 700;">GENUINE</div>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #10B981; margin-top: 0.2rem;">${genuine.toLocaleString()}</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #EF4444; font-weight: 700;">POTENTIALLY FRAUD</div>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #EF4444; margin-top: 0.2rem;">${fraud.toLocaleString()}</div>
          </div>
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #F59E0B; font-weight: 700;">FRAUD RATE</div>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #F59E0B; margin-top: 0.2rem;">${fraudPct}%</div>
          </div>
        </div>

        <!-- Filter & Structured Table Container -->
        <div style="margin-top: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">Prediction Results View</span>
            
            <div style="display: flex; gap: 0.35rem;">
              <button class="fraud-filter-btn active" data-filter="all" onclick="window.nexaModels.filterFraudTable('${cardId}', 'all', this)" style="padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-light); background: #8B5CF6; color: #FFF; cursor: pointer;">All (${total})</button>
              <button class="fraud-filter-btn" data-filter="fraud" onclick="window.nexaModels.filterFraudTable('${cardId}', 'fraud', this)" style="padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-light); background: transparent; color: var(--text-muted); cursor: pointer;">Fraud (${fraud})</button>
              <button class="fraud-filter-btn" data-filter="genuine" onclick="window.nexaModels.filterFraudTable('${cardId}', 'genuine', this)" style="padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-light); background: transparent; color: var(--text-muted); cursor: pointer;">Genuine (${genuine})</button>
            </div>
          </div>

          <div id="${cardId}-table-host">
            ${this.renderFraudTablePage(cardId)}
          </div>
        </div>
      </div>
    `;
  }

  renderFraudTablePage(cardId) {
    const cache = window._fraudResultsCache ? window._fraudResultsCache[cardId] : null;
    if (!cache) return '<div style="font-size: 0.85rem; color: var(--text-muted);">No predictions available</div>';

    const { results, filter, page, pageSize } = cache;
    let filtered = results;
    if (filter === 'fraud') filtered = results.filter(r => r.prediction === 'Fraud' || r.class === 1);
    else if (filter === 'genuine') filtered = results.filter(r => r.prediction === 'Genuine' || r.class === 0);

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const currPage = Math.min(page, totalPages);
    const startIdx = (currPage - 1) * pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + pageSize);

    if (totalFiltered === 0) {
      return `<div style="padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-light); border-radius: 8px;">No transactions match the selected filter.</div>`;
    }

    let rowsHtml = pageRows.map(r => {
      const isFraud = r.prediction === 'Fraud' || r.class === 1;
      const statusBadge = isFraud
        ? `<span style="background: rgba(239, 68, 68, 0.12); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.25); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem;">🚨 Fraud</span>`
        : `<span style="background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem;">🛡️ Genuine</span>`;

      return `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 0.5rem 0.75rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">Row ${r.row}</td>
          <td style="padding: 0.5rem 0.75rem;">${statusBadge}</td>
          <td style="padding: 0.5rem 0.75rem; font-size: 0.82rem; font-weight: 600; color: var(--text-main);">${r.fraud_probability}%</td>
          <td style="padding: 0.5rem 0.75rem; font-size: 0.82rem; color: var(--text-muted);">${r.confidence}%</td>
          <td style="padding: 0.5rem 0.75rem; font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600; color: var(--text-main);">$${(r.Amount || 0).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="overflow-x: auto; border: 1px solid var(--border-light); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="background: var(--bg-light-alt, rgba(0,0,0,0.03)); border-bottom: 1px solid var(--border-light);">
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">ROW</th>
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">PREDICTION</th>
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">FRAUD PROB.</th>
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">CONFIDENCE</th>
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; font-size: 0.78rem; color: var(--text-muted);">
        <span>Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, totalFiltered)} of ${totalFiltered} rows</span>
        <div style="display: flex; gap: 0.4rem;">
          <button onclick="window.nexaModels.changeFraudPage('${cardId}', -1)" ${currPage <= 1 ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); background: transparent; cursor: pointer;">Prev</button>
          <span style="align-self: center; font-weight: 600;">${currPage} / ${totalPages}</span>
          <button onclick="window.nexaModels.changeFraudPage('${cardId}', 1)" ${currPage >= totalPages ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); background: transparent; cursor: pointer;">Next</button>
        </div>
      </div>
    `;
  }

  filterFraudTable(cardId, filterType, btnEl) {
    if (!window._fraudResultsCache || !window._fraudResultsCache[cardId]) return;
    window._fraudResultsCache[cardId].filter = filterType;
    window._fraudResultsCache[cardId].page = 1;

    const host = document.getElementById(`${cardId}-table-host`);
    if (host) {
      host.innerHTML = this.renderFraudTablePage(cardId);
    }

    const card = document.getElementById(cardId);
    if (card) {
      card.querySelectorAll('.fraud-filter-btn').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
      });
      btnEl.style.background = '#8B5CF6';
      btnEl.style.color = '#FFF';
    }
  }

  changeFraudPage(cardId, delta) {
    if (!window._fraudResultsCache || !window._fraudResultsCache[cardId]) return;
    window._fraudResultsCache[cardId].page += delta;

    const host = document.getElementById(`${cardId}-table-host`);
    if (host) {
      host.innerHTML = this.renderFraudTablePage(cardId);
    }
  }

  renderRegressionBatchResultCard(data, cardId = 'regression-results-' + Date.now()) {
    const total = data.processed_count || 0;
    const summary = data.summary || {};
    const predictions = data.predictions || [];

    const minPrice = summary.min_price ? `$${summary.min_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A';
    const maxPrice = summary.max_price ? `$${summary.max_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A';
    const meanPrice = summary.mean_price ? `$${summary.mean_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A';
    const medianPrice = summary.median_price ? `$${summary.median_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A';

    window._regressionResultsCache = window._regressionResultsCache || {};
    window._regressionResultsCache[cardId] = { predictions, page: 1, pageSize: 5 };

    return `
      <div id="${cardId}" class="model-result-box animate-slide-up" style="border-color: rgba(245, 158, 11, 0.3);">
        <div class="model-result-header" style="background: rgba(245, 158, 11, 0.12); color: #F59E0B;">
          <i class="ri-line-chart-line"></i> AUTHORITATIVE STACKING REGRESSOR PREDICTIONS
        </div>

        <!-- Summary Statistics Chips -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin: 0.85rem 0 1.25rem 0;">
          <div style="background: var(--bg-light-alt, rgba(0,0,0,0.03)); border: 1px solid var(--border-light); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PROCESSED ROWS</div>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${total.toLocaleString()}</div>
          </div>
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #F59E0B; font-weight: 700;">MEAN PRICE</div>
            <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #F59E0B; margin-top: 0.2rem;">${meanPrice}</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #10B981; font-weight: 700;">MEDIAN PRICE</div>
            <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #10B981; margin-top: 0.2rem;">${medianPrice}</div>
          </div>
          <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); padding: 0.75rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.72rem; color: #06B6D4; font-weight: 700;">MIN / MAX RANGE</div>
            <div style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: #06B6D4; margin-top: 0.35rem;">${minPrice}<br>to ${maxPrice}</div>
          </div>
        </div>

        <!-- Prediction Table -->
        <div style="margin-top: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.6rem;">House Price Predictions Table</div>
          <div id="${cardId}-table-host">
            ${this.renderRegressionTablePage(cardId)}
          </div>
        </div>
      </div>
    `;
  }

  renderRegressionTablePage(cardId) {
    const cache = window._regressionResultsCache ? window._regressionResultsCache[cardId] : null;
    if (!cache) return '<div style="font-size: 0.85rem; color: var(--text-muted);">No predictions available</div>';

    const { predictions, page, pageSize } = cache;
    const totalFiltered = predictions.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const currPage = Math.min(page, totalPages);
    const startIdx = (currPage - 1) * pageSize;
    const pageRows = predictions.slice(startIdx, startIdx + pageSize);

    if (totalFiltered === 0) {
      return `<div style="padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-light); border-radius: 8px;">No house predictions found.</div>`;
    }

    let rowsHtml = pageRows.map(r => {
      const formattedPrice = `$${(r.predicted_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      return `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 0.55rem 0.75rem; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">Property #${r.row}</td>
          <td style="padding: 0.55rem 0.75rem; font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: #F59E0B;">${formattedPrice}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="overflow-x: auto; border: 1px solid var(--border-light); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="background: var(--bg-light-alt, rgba(0,0,0,0.03)); border-bottom: 1px solid var(--border-light);">
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">PROPERTY ROW</th>
              <th style="padding: 0.6rem 0.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700;">PREDICTED PRICE (ESTIMATED)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; font-size: 0.78rem; color: var(--text-muted);">
        <span>Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, totalFiltered)} of ${totalFiltered} properties</span>
        <div style="display: flex; gap: 0.4rem;">
          <button onclick="window.nexaModels.changeRegressionPage('${cardId}', -1)" ${currPage <= 1 ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); background: transparent; cursor: pointer;">Prev</button>
          <span style="align-self: center; font-weight: 600;">${currPage} / ${totalPages}</span>
          <button onclick="window.nexaModels.changeRegressionPage('${cardId}', 1)" ${currPage >= totalPages ? 'disabled' : ''} style="padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); background: transparent; cursor: pointer;">Next</button>
        </div>
      </div>
    `;
  }

  changeRegressionPage(cardId, delta) {
    if (!window._regressionResultsCache || !window._regressionResultsCache[cardId]) return;
    window._regressionResultsCache[cardId].page += delta;

    const host = document.getElementById(`${cardId}-table-host`);
    if (host) {
      host.innerHTML = this.renderRegressionTablePage(cardId);
    }
  }

  renderCnnResultCard(data) {
    const rawClass = data.prediction || 'Unknown';
    const isHealthy = rawClass.toLowerCase().includes('healthy');
    const formattedClass = rawClass.replace(/___/g, ' — ').replace(/_/g, ' ');
    const confidence = data.confidence || 0.0;
    const classProbs = data.class_probabilities || {};

    const statusBadge = isHealthy
      ? `<span style="background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem;">🌿 Healthy Plant</span>`
      : `<span style="background: rgba(239, 68, 68, 0.12); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.25); padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem;">🦠 Disease Detected</span>`;

    // Sort top 3 probabilities
    const sortedProbs = Object.entries(classProbs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    let probsHtml = sortedProbs.map(([clsName, pct]) => {
      const cleanName = clsName.replace(/___/g, ' — ').replace(/_/g, ' ');
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; padding: 0.25rem 0;">
          <span style="color: var(--text-main); font-weight: 600;">${this.escapeHtml(cleanName)}</span>
          <span style="font-family: var(--font-mono); color: var(--text-muted);">${pct}%</span>
        </div>
      `;
    }).join('');

    return `
      <div class="model-result-box animate-slide-up" style="border-color: rgba(6, 182, 212, 0.3);">
        <div class="model-result-header" style="background: rgba(6, 182, 212, 0.12); color: #06B6D4;">
          <i class="ri-eye-line"></i> AUTHORITATIVE DENSENET121 CNN PREDICTION
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin: 0.85rem 0 0.5rem 0; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--text-main);">${this.escapeHtml(formattedClass)}</div>
          <div>${statusBadge}</div>
        </div>

        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.85rem;">
          CNN Model Confidence: <strong style="color: var(--text-main);">${confidence}%</strong>
        </div>

        <!-- Top Probability Breakdown -->
        <div style="background: var(--bg-light-alt, rgba(0,0,0,0.03)); border: 1px solid var(--border-light); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">Class Probabilities Breakdown</div>
          ${probsHtml}
        </div>
      </div>
    `;
  }

  renderGeminiExplanationCard(explanationText, modelName = 'AURA 3.6 Engine') {
    let displayModel = (modelName || 'AURA 3.6 Engine');
    if (/gemini|flash|gpt|claude/gi.test(displayModel)) {
      displayModel = 'AURA 3.6 Engine';
    }

    let cleanExplanation = (explanationText || '')
      .replace(/gemini[\s-]*\d*\.?\d*[\s-]*flash/gi, 'AURA AI Engine')
      .replace(/gemini/gi, 'Aura')
      .replace(/google/gi, 'Aura');

    return `
      <div class="gemini-block animate-slide-up" style="margin-top: 0.85rem; padding: 1rem 1.15rem; border-left: 4px solid var(--secondary-cyan, #06B6D4); background: rgba(6, 182, 212, 0.06); border-radius: 0 8px 8px 0;">
        <div class="gemini-label" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; color: #06B6D4; font-size: 0.78rem; text-transform: uppercase;">
            <i class="ri-sparkles-fill"></i> AURA AI EXPLANATION & RECOMMENDATIONS
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); background: rgba(0,0,0,0.05); padding: 0.15rem 0.45rem; border-radius: 4px;">${this.escapeHtml(displayModel)}</span>
        </div>
        <div style="font-size: 0.92rem; line-height: 1.6; color: var(--text-main); white-space: pre-line;">${this.escapeHtml(cleanExplanation)}</div>
      </div>
    `;
  }

  renderAiUnavailableNoticeCard() {
    return `
      <div class="animate-fade-in" style="margin-top: 0.65rem; padding: 0.65rem 0.85rem; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.08); border-radius: 8px; font-size: 0.82rem; color: #D97706; display: flex; align-items: center; gap: 0.5rem;">
        <i class="ri-information-line" style="font-size: 1.1rem; flex-shrink: 0;"></i>
        <span>AI explanation is currently unavailable, but the model prediction was completed successfully.</span>
      </div>
    `;
  }

  renderFraudErrorCard(errData) {
    const errorMsg = errData.error || 'An error occurred during dataset processing.';
    let detailHtml = '';

    if (errData.missing_columns && errData.missing_columns.length > 0) {
      detailHtml = `<div style="margin-top: 0.5rem; font-size: 0.82rem; color: #EF4444;"><strong>Missing Required Columns:</strong> <code>${errData.missing_columns.join(', ')}</code></div>`;
    } else if (errData.invalid_columns && errData.invalid_columns.length > 0) {
      detailHtml = `<div style="margin-top: 0.5rem; font-size: 0.82rem; color: #EF4444;"><strong>Non-Numeric Columns Found:</strong> <code>${errData.invalid_columns.join(', ')}</code></div>`;
    }

    return `
      <div class="model-result-box animate-slide-up" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04);">
        <div class="model-result-header" style="background: rgba(239, 68, 68, 0.15); color: #EF4444;">
          <i class="ri-error-warning-line"></i> MODEL PROCESSING ERROR
        </div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 1.05rem; margin-top: 0.25rem;">${this.escapeHtml(errorMsg)}</div>
        ${detailHtml}
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.65rem;">
          Please check your input dataset format and try uploading again.
        </div>
      </div>
    `;
  }

  renderUserFileAttachmentCard(file) {
    const name = file && file.name ? file.name : 'dataset.csv';
    const isCsv = name.toLowerCase().endsWith('.csv');
    const isExcel = name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls');

    let badgeText = 'CSV DATASET';
    let iconClass = 'ri-file-text-line';
    let badgeColor = '#8B5CF6';
    let badgeBg = 'rgba(139, 92, 246, 0.12)';

    if (isExcel) {
      badgeText = 'EXCEL DATASET';
      iconClass = 'ri-file-excel-line';
      badgeColor = '#10B981';
      badgeBg = 'rgba(16, 185, 129, 0.12)';
    } else if (!isCsv) {
      badgeText = 'IMAGE FILE';
      iconClass = 'ri-image-line';
      badgeColor = '#06B6D4';
      badgeBg = 'rgba(6, 182, 212, 0.12)';
    }

    const sizeStr = file && file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Ready';

    return `
      <div class="user-file-attachment-card animate-slide-up" style="display: flex; align-items: center; gap: 0.75rem; background: var(--surface-card, #FFFFFF); border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 10px; padding: 0.75rem 1rem; margin-top: 0.4rem; box-shadow: 0 4px 14px rgba(0,0,0,0.06); width: fit-content; max-width: 100%;">
        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${badgeBg}; color: ${badgeColor}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;">
          <i class="${iconClass}"></i>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.15rem; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-family: var(--font-heading); font-size: 0.92rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;">${this.escapeHtml(name)}</span>
            <span style="font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; padding: 0.1rem 0.45rem; border-radius: 4px;">${badgeText}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.6rem;">
            <span><i class="ri-hard-drive-line"></i> ${sizeStr}</span>
            <span><i class="ri-checkbox-circle-fill" style="color: #10B981;"></i> Uploaded to AURA</span>
          </div>
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.nexaModels = new NexaModelsUI();
