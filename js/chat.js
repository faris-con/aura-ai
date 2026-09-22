/* ==========================================================================
   NEXA — Chat Workspace Controller & Transition Engine
   ========================================================================== */

class NexaChatUI {
  constructor() {
    this.welcomeView = null;
    this.chatContainer = null;
    this.messagesStream = null;
    this.initialInput = null;
    this.chatInput = null;
    this.activeWorkflow = null; // null | 'classify' | 'cnn' | 'outcome'
    this.pendingAttachedFile = null;
  }

  init() {
    this.welcomeView = document.getElementById('initial-welcome-view');
    this.chatContainer = document.getElementById('active-chat-container');
    this.messagesStream = document.getElementById('messages-stream-list');
    this.initialInput = document.getElementById('initial-composer-input');
    this.chatInput = document.getElementById('bottom-composer-input');

    this.bindEvents();
    this.syncViewState();

    store.subscribe(() => this.syncViewState());
  }

  bindEvents() {
    // Initial Hero Send Button
    const initialSendBtn = document.getElementById('btn-initial-send');
    if (initialSendBtn) {
      initialSendBtn.addEventListener('click', () => this.handleInitialPromptSubmit());
    }

    if (this.initialInput) {
      this.initialInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleInitialPromptSubmit();
        }
      });
    }

    // Bottom Chat Send Button
    const bottomSendBtn = document.getElementById('btn-bottom-send');
    if (bottomSendBtn) {
      bottomSendBtn.addEventListener('click', () => this.handleBottomMessageSubmit());
    }

    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleBottomMessageSubmit();
        }
      });
    }

    // Quick Action Chips & Action Buttons
    document.querySelectorAll('.model-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const text = (chip.textContent || '').toLowerCase();
        const chipId = chip.id || '';

        if (text.includes('classify features') || chipId.includes('classify')) {
          e.preventDefault();
          this.startClassifyFeaturesWorkflow();
        } else if (text.includes('analyze image') || chipId.includes('cnn')) {
          e.preventDefault();
          this.startAnalyzeImageWorkflow();
        } else if (text.includes('predict outcome') || chipId.includes('predict')) {
          e.preventDefault();
          this.startPredictOutcomeWorkflow();
        } else {
          const promptText = chip.getAttribute('data-prompt');
          if (promptText) this.triggerChatStart(promptText);
        }
      });
    });

    // File Upload Buttons triggers
    const setupFileUpload = (btnId, inputId) => {
      const btn = document.getElementById(btnId);
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('click', () => {
          input.value = '';
        });
        if (btn) {
          btn.addEventListener('click', () => {
            input.value = '';
          });
        }
        input.addEventListener('change', (e) => {
          const rawFiles = e.target.files;
          if (rawFiles && rawFiles.length > 0) {
            const files = Array.from(rawFiles);
            this.setPendingAttachedFile(files[0]);
          }
        });
      }
    };

    setupFileUpload('btn-upload-file', 'hidden-file-input');
    setupFileUpload('btn-bottom-upload-file', 'bottom-hidden-file-input');
  }

  setPendingAttachedFile(file) {
    if (!file) return;
    this.pendingAttachedFile = file;

    const initialBar = document.getElementById('initial-attached-file-bar');
    const bottomBar = document.getElementById('bottom-attached-file-bar');
    const html = this.renderAttachedPillHTML(file);

    if (initialBar) {
      initialBar.innerHTML = html;
      initialBar.style.display = 'flex';
    }
    if (bottomBar) {
      bottomBar.innerHTML = html;
      bottomBar.style.display = 'flex';
    }
  }

  clearPendingAttachedFile() {
    this.pendingAttachedFile = null;

    const initialBar = document.getElementById('initial-attached-file-bar');
    const bottomBar = document.getElementById('bottom-attached-file-bar');

    if (initialBar) {
      initialBar.innerHTML = '';
      initialBar.style.display = 'none';
    }
    if (bottomBar) {
      bottomBar.innerHTML = '';
      bottomBar.style.display = 'none';
    }
  }

  renderAttachedPillHTML(file) {
    const fileName = file.name || 'dataset.csv';
    const isCsv = fileName.toLowerCase().endsWith('.csv');
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    let subtitle = 'جداول البيانات';
    let iconClass = 'ri-table-line';

    if (isExcel) {
      subtitle = 'جدول بيانات إكسيل';
      iconClass = 'ri-file-excel-line';
    } else if (!isCsv) {
      subtitle = 'ملف صورة للرؤية';
      iconClass = 'ri-image-line';
    }

    return `
      <div class="composer-attached-pill animate-fade-in">
        <button type="button" class="pill-remove-btn" onclick="window.nexaChat.clearPendingAttachedFile()" title="إزالة الملف">
          <i class="ri-close-line"></i>
        </button>
        <div class="pill-info-group">
          <span class="pill-filename">${this.escapeHtml(fileName)}</span>
          <span class="pill-subtitle">${subtitle}</span>
        </div>
        <div class="pill-icon-badge">
          <i class="${iconClass}"></i>
        </div>
      </div>
    `;
  }

  syncViewState() {
    const state = store.getState();
    const isChat = state.isChatActive;

    if (isChat) {
      if (this.welcomeView) this.welcomeView.style.display = 'none';
      if (this.chatContainer) this.chatContainer.style.display = 'flex';
      this.renderMessagesStream();
    } else {
      if (this.welcomeView) {
        this.welcomeView.style.display = 'flex';
        this.welcomeView.classList.remove('animate-fade-out-hero');
      }
      if (this.chatContainer) this.chatContainer.style.display = 'none';
      if (this.initialInput) this.initialInput.value = '';
      this.updateActiveChipVisuals(null);
    }
    this.updateBottomChipsVisibility();
  }

  updateBottomChipsVisibility() {
    const bottomChipsContainer = document.querySelector('.bottom-chat-composer .quick-action-chips');
    if (!bottomChipsContainer) return;

    const activeConvo = store.getActiveConversation();
    const hasMessages = activeConvo && activeConvo.messages && activeConvo.messages.length > 0;

    if (hasMessages) {
      bottomChipsContainer.style.display = 'none';
    } else {
      bottomChipsContainer.style.display = 'flex';
    }
  }

  updateActiveChipVisuals(workflowName) {
    document.querySelectorAll('.model-chip').forEach(chip => {
      const text = (chip.textContent || '').toLowerCase();
      const chipId = chip.id || '';

      const isClassify = (text.includes('classify features') || chipId.includes('classify')) && workflowName === 'classify';
      const isCnn = (text.includes('analyze image') || chipId.includes('cnn')) && workflowName === 'cnn';
      const isPredict = (text.includes('predict outcome') || chipId.includes('predict')) && workflowName === 'outcome';

      if (isClassify || isCnn || isPredict) {
        chip.classList.add('active', 'selected');
      } else {
        chip.classList.remove('active', 'selected');
      }
    });
  }

  ensureInitialized() {
    if (!this.welcomeView) this.welcomeView = document.getElementById('initial-welcome-view');
    if (!this.chatContainer) this.chatContainer = document.getElementById('active-chat-container');
    if (!this.messagesStream) this.messagesStream = document.getElementById('messages-stream-list');
    if (!this.initialInput) this.initialInput = document.getElementById('initial-composer-input');
    if (!this.chatInput) this.chatInput = document.getElementById('bottom-composer-input');
  }

  selectWorkflowMode(mode) {
    this.ensureInitialized();
    this.activeWorkflow = mode;
    this.updateActiveChipVisuals(mode);

    if (mode === 'classify') {
      this.startClassifyFeaturesWorkflow();
    } else if (mode === 'cnn') {
      this.startAnalyzeImageWorkflow();
    } else if (mode === 'outcome') {
      this.startPredictOutcomeWorkflow();
    }
  }

  startClassifyFeaturesWorkflow() {
    this.ensureInitialized();
    this.activeWorkflow = 'classify';
    this.updateActiveChipVisuals('classify');

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.style.display = 'none';
      if (this.chatContainer) this.chatContainer.style.display = 'flex';
      store.createNewChat("Credit Card Fraud Classification");
      store.setState({ isChatActive: true });
      this.addFraudUploadPrompt();
    } else {
      this.addFraudUploadPrompt();
    }
  }

  addFraudUploadPrompt() {
    this.ensureInitialized();
    this.activeWorkflow = 'classify';
    this.updateActiveChipVisuals('classify');

    const uploadPromptMsg = {
      id: 'msg_fraud_prompt_' + Date.now(),
      sender: 'nexa',
      text: "Upload a CSV or Excel file containing the transaction features.\nRequired columns: V1-V28 and Amount.",
      customHtml: window.nexaModels.renderFraudUploadCard(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    store.addMessageToActiveChat(uploadPromptMsg);
    this.renderMessagesStream();
  }

  startAnalyzeImageWorkflow() {
    this.ensureInitialized();
    this.activeWorkflow = 'cnn';
    this.updateActiveChipVisuals('cnn');

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.style.display = 'none';
      if (this.chatContainer) this.chatContainer.style.display = 'flex';
      store.createNewChat("Tomato Leaf Vision CNN Analysis");
      store.setState({ isChatActive: true });
      this.addCnnPrompt();
    } else {
      this.addCnnPrompt();
    }
  }

  startCnnWorkflow() {
    this.startAnalyzeImageWorkflow();
  }

  addCnnPrompt() {
    this.ensureInitialized();
    this.activeWorkflow = 'cnn';
    this.updateActiveChipVisuals('cnn');

    const cnnMsg = {
      id: 'msg_cnn_prompt_' + Date.now(),
      sender: 'nexa',
      text: "📷 Tomato Leaf Disease Vision CNN Workflow\nUpload a leaf image (.jpg, .jpeg, .png, .webp) to analyze spatial tensor patterns and detect plant diseases using DenseNet121 CNN.",
      customHtml: window.nexaModels.renderCnnUploadCard(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    store.addMessageToActiveChat(cnnMsg);
    this.renderMessagesStream();
  }

  startPredictOutcomeWorkflow() {
    this.ensureInitialized();
    this.activeWorkflow = 'outcome';
    this.updateActiveChipVisuals('outcome');

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.style.display = 'none';
      if (this.chatContainer) this.chatContainer.style.display = 'flex';
      store.createNewChat("House Price Regression Prediction");
      store.setState({ isChatActive: true });
      this.addPredictOutcomePrompt();
    } else {
      this.addPredictOutcomePrompt();
    }
  }

  addPredictOutcomePrompt() {
    this.ensureInitialized();
    this.activeWorkflow = 'outcome';
    this.updateActiveChipVisuals('outcome');

    const outcomeMsg = {
      id: 'msg_outcome_prompt_' + Date.now(),
      sender: 'nexa',
      text: "📈 House Price Regression Prediction Workflow\nUpload a CSV housing dataset to execute StackingRegressor price estimations across property features.",
      customHtml: window.nexaModels.renderRegressionUploadCard(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    store.addMessageToActiveChat(outcomeMsg);
    this.renderMessagesStream();
  }

  async handleFraudFileSelected(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name;
    const isCsv = fileName.toLowerCase().endsWith('.csv');
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.classList.add('animate-fade-out-hero');
      store.createNewChat(`Dataset Analysis: ${fileName}`);
      store.setState({ isChatActive: true });
    }

    if (!isCsv && !isExcel) {
      const errMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'nexa',
        text: "Invalid file format.",
        customHtml: window.nexaModels.renderFraudErrorCard({
          error: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)."
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errMessage);
      this.renderMessagesStream();
      return;
    }

    const userMsg = {
      id: 'msg_usr_file_' + Date.now(),
      sender: 'user',
      text: `Uploaded dataset: ${fileName}`,
      customHtml: window.nexaModels.renderUserFileAttachmentCard(file),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    store.addMessageToActiveChat(userMsg);
    this.renderMessagesStream();

    this.showTypingIndicator();

    try {
      const res = await NEXA_API.fraud.uploadDataset(file);
      this.removeTypingIndicator();

      if (!res.ok || !res.data || !res.data.success) {
        const errData = (res.data && typeof res.data === 'object') ? res.data : { error: `Server returned HTTP status code ${res.status}` };
        const nexaErrMsg = {
          id: 'msg_nexa_err_' + Date.now(),
          sender: 'nexa',
          text: "Classification failed.",
          customHtml: window.nexaModels.renderFraudErrorCard(errData),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(nexaErrMsg);
        this.renderMessagesStream();
        return;
      }

      const data = res.data;
      const cardId = 'fraud-card-' + Date.now();

      const nexaResultMsg = {
        id: 'msg_nexa_result_' + Date.now(),
        sender: 'nexa',
        text: `Classification completed.\nProcessed: ${data.total_transactions.toLocaleString()} transactions | Genuine: ${data.genuine_count.toLocaleString()} | Potentially fraudulent: ${data.fraud_count.toLocaleString()}`,
        customHtml: window.nexaModels.renderFraudBatchResultCard(data, cardId),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(nexaResultMsg);
      this.renderMessagesStream();

      this.fetchFraudGeminiExplanation(data);

    } catch (err) {
      this.removeTypingIndicator();
      console.error("Error during dataset classification:", err);
      const errNetMsg = {
        id: 'msg_nexa_net_err_' + Date.now(),
        sender: 'nexa',
        text: "Connection error.",
        customHtml: window.nexaModels.renderFraudErrorCard({ error: "Could not communicate with the Fraud Classification API backend." }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errNetMsg);
      this.renderMessagesStream();
    } finally {
      this.activeWorkflow = null;
    }
  }

  async handleRegressionFileSelected(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name;
    const isCsv = fileName.toLowerCase().endsWith('.csv');

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.classList.add('animate-fade-out-hero');
      store.createNewChat(`House Price Regression: ${fileName}`);
      store.setState({ isChatActive: true });
    }

    if (!isCsv) {
      const errMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'nexa',
        text: "Invalid file format.",
        customHtml: window.nexaModels.renderFraudErrorCard({
          error: "Please upload a CSV file (.csv) containing property features."
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errMessage);
      this.renderMessagesStream();
      return;
    }

    const userMsg = {
      id: 'msg_usr_file_' + Date.now(),
      sender: 'user',
      text: `Uploaded regression dataset: ${fileName}`,
      customHtml: window.nexaModels.renderUserFileAttachmentCard(file),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    store.addMessageToActiveChat(userMsg);
    this.renderMessagesStream();

    this.showTypingIndicator();

    try {
      const res = await NEXA_API.regression.uploadDataset(file);
      this.removeTypingIndicator();

      if (!res.ok || !res.data || !res.data.success) {
        const errData = (res.data && typeof res.data === 'object') ? res.data : { error: `Server returned HTTP status code ${res.status}` };
        const nexaErrMsg = {
          id: 'msg_nexa_err_' + Date.now(),
          sender: 'nexa',
          text: "Regression prediction failed.",
          customHtml: window.nexaModels.renderFraudErrorCard(errData),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(nexaErrMsg);
        this.renderMessagesStream();
        return;
      }

      const data = res.data;
      const cardId = 'regression-card-' + Date.now();

      const nexaResultMsg = {
        id: 'msg_nexa_result_' + Date.now(),
        sender: 'nexa',
        text: `House price regression prediction completed.\nProcessed: ${data.processed_count} property records | Mean Price: $${(data.summary ? data.summary.mean_price : 0).toLocaleString()}`,
        customHtml: window.nexaModels.renderRegressionBatchResultCard(data, cardId),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(nexaResultMsg);
      this.renderMessagesStream();

      this.fetchRegressionGeminiExplanation(data);

    } catch (err) {
      this.removeTypingIndicator();
      console.error("Error during regression prediction:", err);
      const errNetMsg = {
        id: 'msg_nexa_net_err_' + Date.now(),
        sender: 'nexa',
        text: "Connection error.",
        customHtml: window.nexaModels.renderFraudErrorCard({ error: "Could not communicate with the House Price Regression API backend." }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errNetMsg);
      this.renderMessagesStream();
    } finally {
      this.activeWorkflow = null;
    }
  }

  async handleCnnFileSelected(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name.toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!store.getState().isChatActive) {
      if (this.welcomeView) this.welcomeView.classList.add('animate-fade-out-hero');
      store.createNewChat(`CNN Vision Analysis: ${file.name}`);
      store.setState({ isChatActive: true });
    }

    if (!validExts.some(ext => fileName.endsWith(ext))) {
      const errMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'nexa',
        text: "Invalid image format.",
        customHtml: window.nexaModels.renderFraudErrorCard({
          error: "Supported image formats: .jpg, .jpeg, .png, .webp"
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errMessage);
      this.renderMessagesStream();
      return;
    }

    const userMsg = {
      id: 'msg_usr_img_' + Date.now(),
      sender: 'user',
      text: `Uploaded tomato leaf image: ${file.name}`,
      customHtml: window.nexaModels.renderUserFileAttachmentCard(file),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    store.addMessageToActiveChat(userMsg);
    this.renderMessagesStream();

    this.showTypingIndicator();

    try {
      const res = await NEXA_API.cnn.analyzeImage(file);
      this.removeTypingIndicator();

      if (!res.ok || !res.data || !res.data.success) {
        const errData = (res.data && typeof res.data === 'object') ? res.data : { error: `Server returned HTTP status code ${res.status}` };
        const nexaErrMsg = {
          id: 'msg_nexa_err_' + Date.now(),
          sender: 'nexa',
          text: "CNN Analysis failed.",
          customHtml: window.nexaModels.renderFraudErrorCard(errData),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(nexaErrMsg);
        this.renderMessagesStream();
        return;
      }

      const data = res.data;
      const cnnResultMsg = {
        id: 'msg_nexa_cnn_' + Date.now(),
        sender: 'nexa',
        text: `DenseNet121 CNN prediction: ${data.prediction} (Confidence: ${data.confidence}%)`,
        customHtml: window.nexaModels.renderCnnResultCard(data),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(cnnResultMsg);
      this.renderMessagesStream();

      this.fetchDiseaseGeminiExplanation(data);

    } catch (err) {
      this.removeTypingIndicator();
      console.error("Error during CNN leaf disease analysis:", err);
      const errNetMsg = {
        id: 'msg_nexa_net_err_' + Date.now(),
        sender: 'nexa',
        text: "Connection error.",
        customHtml: window.nexaModels.renderFraudErrorCard({ error: "Could not communicate with the Tomato Leaf Disease CNN API backend." }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(errNetMsg);
      this.renderMessagesStream();
    } finally {
      this.activeWorkflow = null;
    }
  }

  async fetchFraudGeminiExplanation(xgboostData) {
    this.showTypingIndicator();

    const samplePredictions = (xgboostData.results || []).slice(0, 5).map(r => ({
      prediction: r.prediction,
      fraud_probability: r.fraud_probability,
      confidence: r.confidence,
      Amount: r.Amount
    }));

    const aiPayload = {
      prediction: (xgboostData.fraud_count || 0) > 0 ? "Fraud" : "Genuine",
      class: (xgboostData.fraud_count || 0) > 0 ? 1 : 0,
      fraud_probability: xgboostData.fraud_percentage || 0.0,
      confidence: 95.0,
      total_transactions: xgboostData.total_transactions,
      fraud_count: xgboostData.fraud_count,
      genuine_count: xgboostData.genuine_count,
      fraud_percentage: xgboostData.fraud_percentage,
      sample_predictions: samplePredictions
    };

    try {
      const aiRes = await NEXA_API.ai.analyzeFraud(aiPayload);
      this.removeTypingIndicator();

      if (aiRes.ok && aiRes.data && aiRes.data.success) {
        let auraExplanation = (aiRes.data.explanation || '').trim();
        if (auraExplanation && !auraExplanation.startsWith("Hi I am Aura")) {
          auraExplanation = `Hi I am Aura.\n\n${auraExplanation}`;
        }
        const rawModelName = aiRes.data.model || 'AURA 3.6 Engine';
        const modelName = /gemini|flash|gpt|claude/gi.test(rawModelName) ? 'AURA 3.6 Engine' : rawModelName;

        const aiMsg = {
          id: 'msg_ai_exp_' + Date.now(),
          sender: 'nexa',
          text: "AI Analysis & Recommendation",
          customHtml: window.nexaModels.renderGeminiExplanationCard(auraExplanation, modelName),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(aiMsg);
        this.renderMessagesStream();
      } else {
        const noticeMsg = {
          id: 'msg_ai_notice_' + Date.now(),
          sender: 'nexa',
          text: "Notice",
          customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(noticeMsg);
        this.renderMessagesStream();
      }
    } catch (err) {
      this.removeTypingIndicator();
      console.warn("Aura fraud explanation layer offline:", err);
      const noticeMsg = {
        id: 'msg_ai_notice_' + Date.now(),
        sender: 'nexa',
        text: "Notice",
        customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(noticeMsg);
      this.renderMessagesStream();
    }
  }

  async fetchRegressionGeminiExplanation(regressionData) {
    this.showTypingIndicator();

    const aiPayload = {
      prediction_type: "house_price",
      predicted_price: (regressionData.predictions && regressionData.predictions.length > 0) ? regressionData.predictions[0].predicted_price : null,
      processed_count: regressionData.processed_count,
      summary: regressionData.summary,
      predictions: (regressionData.predictions || []).slice(0, 5)
    };

    try {
      const aiRes = await NEXA_API.ai.analyzeRegression(aiPayload);
      this.removeTypingIndicator();

      if (aiRes.ok && aiRes.data && aiRes.data.success) {
        let auraExplanation = (aiRes.data.explanation || '').trim();
        if (auraExplanation && !auraExplanation.startsWith("Hi I am Aura")) {
          auraExplanation = `Hi I am Aura.\n\n${auraExplanation}`;
        }

        const aiMsg = {
          id: 'msg_ai_exp_' + Date.now(),
          sender: 'nexa',
          text: "AI Price Explanation & Insights",
          customHtml: window.nexaModels.renderGeminiExplanationCard(auraExplanation, 'AURA 3.6 Engine'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(aiMsg);
        this.renderMessagesStream();
      } else {
        const noticeMsg = {
          id: 'msg_ai_notice_' + Date.now(),
          sender: 'nexa',
          text: "Notice",
          customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(noticeMsg);
        this.renderMessagesStream();
      }
    } catch (err) {
      this.removeTypingIndicator();
      console.warn("Aura regression explanation layer offline:", err);
      const noticeMsg = {
        id: 'msg_ai_notice_' + Date.now(),
        sender: 'nexa',
        text: "Notice",
        customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(noticeMsg);
      this.renderMessagesStream();
    }
  }

  async fetchDiseaseGeminiExplanation(cnnData) {
    this.showTypingIndicator();

    const aiPayload = {
      prediction: cnnData.prediction,
      confidence: cnnData.confidence,
      class_probabilities: cnnData.class_probabilities
    };

    try {
      const aiRes = await NEXA_API.ai.analyzeDisease(aiPayload);
      this.removeTypingIndicator();

      if (aiRes.ok && aiRes.data && aiRes.data.success) {
        let auraExplanation = (aiRes.data.explanation || '').trim();
        if (auraExplanation && !auraExplanation.startsWith("Hi I am Aura")) {
          auraExplanation = `Hi I am Aura.\n\n${auraExplanation}`;
        }

        const aiMsg = {
          id: 'msg_ai_exp_' + Date.now(),
          sender: 'nexa',
          text: "AI Disease Guidance & Recommendations",
          customHtml: window.nexaModels.renderGeminiExplanationCard(auraExplanation, 'AURA 3.6 Engine'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(aiMsg);
        this.renderMessagesStream();
      } else {
        const noticeMsg = {
          id: 'msg_ai_notice_' + Date.now(),
          sender: 'nexa',
          text: "Notice",
          customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        store.addMessageToActiveChat(noticeMsg);
        this.renderMessagesStream();
      }
    } catch (err) {
      this.removeTypingIndicator();
      console.warn("Aura disease explanation layer offline:", err);
      const noticeMsg = {
        id: 'msg_ai_notice_' + Date.now(),
        sender: 'nexa',
        text: "Notice",
        customHtml: window.nexaModels.renderAiUnavailableNoticeCard(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      store.addMessageToActiveChat(noticeMsg);
      this.renderMessagesStream();
    }
  }

  handleInitialPromptSubmit() {
    const val = this.initialInput ? this.initialInput.value.trim() : '';
    const pendingFile = this.pendingAttachedFile;

    if (!val && !pendingFile) return;

    if (this.initialInput) this.initialInput.value = '';

    if (pendingFile) {
      const file = pendingFile;
      this.clearPendingAttachedFile();

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        this.startClassifyFeaturesWorkflow();
        setTimeout(() => {
          this.handleFraudFileSelected([file]);
          if (val) setTimeout(() => this.processAIResponse(val), 600);
        }, 150);
      } else {
        this.startAnalyzeImageWorkflow();
        setTimeout(() => {
          this.handleCnnFileSelected([file]);
          if (val) setTimeout(() => this.processAIResponse(val), 600);
        }, 150);
      }
    } else {
      this.triggerChatStart(val);
    }
  }

  triggerChatStart(promptText) {
    if (!this.welcomeView) return;

    this.welcomeView.classList.add('animate-fade-out-hero');

    setTimeout(() => {
      store.createNewChat(promptText);
      store.setState({ isChatActive: true });

      this.processAIResponse(promptText);
    }, 320);
  }

  handleBottomMessageSubmit() {
    const text = this.chatInput ? this.chatInput.value.trim() : '';
    const pendingFile = this.pendingAttachedFile;

    if (!text && !pendingFile) return;

    if (this.chatInput) this.chatInput.value = '';

    if (pendingFile) {
      const file = pendingFile;
      this.clearPendingAttachedFile();

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        this.handleFraudFileSelected([file]);
        if (text) setTimeout(() => this.processAIResponse(text), 600);
      } else {
        this.handleCnnFileSelected([file]);
        if (text) setTimeout(() => this.processAIResponse(text), 600);
      }
    } else {
      const userMsg = {
        id: 'msg_usr_' + Date.now(),
        sender: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      store.addMessageToActiveChat(userMsg);
      this.renderMessagesStream();

      this.processAIResponse(text);
    }
  }

  sendCustomPrompt(promptText) {
    if (!store.getState().isChatActive) {
      this.triggerChatStart(promptText);
    } else {
      if (this.chatInput) this.chatInput.value = promptText;
      this.handleBottomMessageSubmit();
    }
  }

  async processAIResponse(promptText) {
    this.showTypingIndicator();

    try {
      const activeConvo = store.getActiveConversation();
      const response = await NEXA_API.chat.send(promptText, activeConvo ? activeConvo.id : null);

      this.removeTypingIndicator();

      const nexaMsg = {
        id: response.id || ('msg_nexa_' + Date.now()),
        sender: 'nexa',
        text: response.reply,
        modelResult: response.modelResult || null,
        timestamp: response.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      store.addMessageToActiveChat(nexaMsg);
      this.renderMessagesStream();
    } catch (err) {
      this.removeTypingIndicator();
      console.error('Error in NEXA response:', err);

      const fallbackMsg = {
        id: 'msg_nexa_fallback_' + Date.now(),
        sender: 'nexa',
        text: "I am AURA, your Huawei HCIA AI assistant. How can I help you analyze, predict, or classify data today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      store.addMessageToActiveChat(fallbackMsg);
      this.renderMessagesStream();
    }
  }

  renderMessagesStream() {
    if (!this.messagesStream) return;

    const activeConvo = store.getActiveConversation();
    if (!activeConvo) return;

    this.messagesStream.innerHTML = '';

    activeConvo.messages.forEach(msg => {
      const isNexa = msg.sender === 'nexa';
      const row = document.createElement('div');
      row.className = `message-row ${isNexa ? 'nexa-message-row' : 'user-message-row'}`;

      const avatar = document.createElement('div');
      avatar.className = `msg-avatar ${isNexa ? 'avatar-nexa-icon' : 'avatar-user-icon'}`;
      avatar.innerHTML = isNexa ? '<i class="ri-cpu-line"></i>' : (store.getState().currentUser.avatar || 'U');

      const bubble = document.createElement('div');
      bubble.className = `msg-bubble ${isNexa ? 'nexa-bubble' : 'user-bubble'}`;

      let content = `<div>${this.escapeHtml(msg.text)}</div>`;

      if (msg.customHtml) {
        content += msg.customHtml;
      } else if (msg.modelResult && window.nexaModels) {
        content += window.nexaModels.renderModelCardHTML(msg.modelResult);
      }

      bubble.innerHTML = content;

      if (isNexa) {
        row.appendChild(avatar);
        row.appendChild(bubble);
      } else {
        row.appendChild(bubble);
        row.appendChild(avatar);
      }

      this.messagesStream.appendChild(row);
    });

    this.scrollToBottom();
    this.updateBottomChipsVisibility();
  }

  showTypingIndicator() {
    if (document.getElementById('typing-indicator-node')) return;

    const row = document.createElement('div');
    row.id = 'typing-indicator-node';
    row.className = 'message-row nexa-message-row';
    row.innerHTML = `
      <div class="msg-avatar avatar-nexa-icon"><i class="ri-cpu-line"></i></div>
      <div class="msg-bubble nexa-bubble">
        <div class="typing-dots-container">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;

    this.messagesStream.appendChild(row);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const node = document.getElementById('typing-indicator-node');
    if (node) node.remove();
  }

  scrollToBottom() {
    if (this.messagesStream) {
      this.messagesStream.scrollTop = this.messagesStream.scrollHeight;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.nexaChat = new NexaChatUI();
window.selectWorkflowMode = function(mode) {
  if (window.nexaChat) {
    window.nexaChat.selectWorkflowMode(mode);
  }
};
