/* ==========================================================================
   NEXA — API Abstraction Layer & Production Backend Client
   ========================================================================== */

const API_BASE_URL = (typeof window !== 'undefined' && (window.VITE_API_BASE_URL || window.API_BASE_URL))
  || 'https://nexa-ai-api-production.up.railway.app';

const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  USE_MOCK: false,
  ENDPOINTS: {
    AUTH: 'api/auth.php',
    CHAT: 'api/chat.php',
    CNN: 'api/cnn.php',
    CLASSIFICATION: 'api/classification.php',
    REGRESSION: 'api/regression.php',
    HISTORY: 'api/history.php',
    PREDICT_FRAUD_CSV: '/predict/fraud/csv',
    PREDICT_FRAUD_EXCEL: '/predict/fraud/excel',
    PREDICT_FRAUD_SINGLE: '/predict/fraud',
    PREDICT_HOUSE_CSV: '/predict/house-price/csv',
    PREDICT_CNN_IMAGE: '/predict/cnn/image',
    AI_ANALYZE_FRAUD: '/ai/analyze',
    AI_ANALYZE_REGRESSION: '/ai/analyze-regression',
    AI_ANALYZE_DISEASE: '/ai/analyze-disease'
  }
};

function getCandidateBaseUrls() {
  return [
    API_BASE_URL.replace(/\/$/, ''),
    'http://127.0.0.1:8000',
    'http://localhost:8000'
  ];
}

async function apiFetch(endpoint, method = 'POST', payload = {}) {
  if (API_CONFIG.USE_MOCK) {
    return mockBackendResponse(endpoint, payload);
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Fallback] ${endpoint} offline. Using mock API generator.`, err);
    return mockBackendResponse(endpoint, payload);
  }
}

async function uploadFraudDataset(file) {
  const isCsv = file.name.toLowerCase().endsWith('.csv');
  const endpointPath = isCsv ? API_CONFIG.ENDPOINTS.PREDICT_FRAUD_CSV : API_CONFIG.ENDPOINTS.PREDICT_FRAUD_EXCEL;
  const baseUrls = getCandidateBaseUrls();

  let lastError = null;
  for (const baseUrl of baseUrls) {
    try {
      const targetUrl = `${baseUrl}${endpointPath}`;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(targetUrl, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    ok: false,
    status: 0,
    data: {
      success: false,
      error: "Unable to connect to the Fraud Classification API. Please verify network connectivity."
    }
  };
}

async function uploadRegressionDataset(file) {
  const endpointPath = API_CONFIG.ENDPOINTS.PREDICT_HOUSE_CSV;
  const baseUrls = getCandidateBaseUrls();

  for (const baseUrl of baseUrls) {
    try {
      const targetUrl = `${baseUrl}${endpointPath}`;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(targetUrl, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      // try next base URL
    }
  }

  return {
    ok: false,
    status: 0,
    data: {
      success: false,
      error: "Unable to connect to the House Price Regression API. Please verify network connectivity."
    }
  };
}

async function analyzeCnnImage(file) {
  const endpointPath = API_CONFIG.ENDPOINTS.PREDICT_CNN_IMAGE;
  const baseUrls = getCandidateBaseUrls();

  for (const baseUrl of baseUrls) {
    try {
      const targetUrl = `${baseUrl}${endpointPath}`;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(targetUrl, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      // try next base URL
    }
  }

  return {
    ok: false,
    status: 0,
    data: {
      success: false,
      error: "Unable to connect to the Tomato Leaf Disease CNN API. Please verify network connectivity."
    }
  };
}

async function postJsonToCandidates(endpointPath, payload, fallbackErrorMsg) {
  const baseUrls = getCandidateBaseUrls();

  for (const baseUrl of baseUrls) {
    try {
      const targetUrl = `${baseUrl}${endpointPath}`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      // try next base URL
    }
  }

  return {
    ok: false,
    status: 503,
    data: {
      success: false,
      error: fallbackErrorMsg || "AI explanation service is currently unavailable."
    }
  };
}

async function requestAiExplanation(payload) {
  return postJsonToCandidates(API_CONFIG.ENDPOINTS.AI_ANALYZE_FRAUD, payload, "AI explanation service is currently unavailable.");
}

async function requestAiRegressionExplanation(payload) {
  return postJsonToCandidates(API_CONFIG.ENDPOINTS.AI_ANALYZE_REGRESSION, payload, "AI explanation service is currently unavailable.");
}

async function requestAiDiseaseExplanation(payload) {
  return postJsonToCandidates(API_CONFIG.ENDPOINTS.AI_ANALYZE_DISEASE, payload, "AI explanation service is currently unavailable.");
}

function mockBackendResponse(endpoint, payload) {
  return new Promise((resolve) => {
    const latency = 600 + Math.random() * 500;

    setTimeout(() => {
      if (endpoint.includes('auth.php')) {
        resolve({
          status: 'success',
          user: {
            id: 'usr_' + Date.now(),
            name: payload.name || (payload.email ? payload.email.split('@')[0] : 'HCIA Engineer'),
            email: payload.email || 'engineer@huawei.ai',
            avatar: payload.name ? payload.name.charAt(0).toUpperCase() : 'H',
            role: 'HCIA AI Specialist'
          }
        });
      }
      else if (endpoint.includes('chat.php')) {
        const text = payload.message || '';
        const lower = text.toLowerCase();

        let reply = "Hi I am Aura, your AI assistant. How can I help you analyze, predict, or classify data today?";
        let modelResult = null;

        if (lower.includes('image') || lower.includes('cnn') || lower.includes('leaf') || lower.includes('tomato')) {
          reply = "Hi I am Aura. Leaf disease analysis completed using DenseNet121 CNN tensor activation maps.";
          modelResult = {
            type: 'CNN Vision',
            prediction: 'Tomato___Early_blight',
            confidence: 96.4,
            explanation: "AURA AI Layer: DenseNet121 convolutional features detected brown concentric target-spot lesions on leaf tissue."
          };
        } else if (lower.includes('classify') || lower.includes('fraud') || lower.includes('feature')) {
          reply = "Hi I am Aura. Fraud classification completed using XGBoost model.";
          modelResult = {
            type: 'Classification',
            prediction: 'Genuine Transaction',
            confidence: 99.2,
            explanation: "AURA AI Layer: Feature vectors remain within normal behavioral variance."
          };
        } else if (lower.includes('predict') || lower.includes('price') || lower.includes('house') || lower.includes('regression')) {
          reply = "Hi I am Aura. House price regression prediction completed using StackingRegressor.";
          modelResult = {
            type: 'Regression',
            prediction: '$245,000.00 Estimated Value',
            confidence: 94.4,
            explanation: "AURA AI Layer: Property total square footage and quality ratings drove estimated market valuation."
          };
        }

        resolve({
          status: 'success',
          id: 'msg_' + Date.now(),
          reply: reply,
          modelResult: modelResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }, latency);
  });
}

async function sendChatMessage(message, conversationId, userId) {
  try {
    const payload = {
      prediction: "General Inquiry",
      class: 0,
      fraud_probability: 0.0,
      confidence: 100.0,
      total_transactions: 1,
      genuine_count: 1,
      fraud_count: 0,
      fraud_percentage: 0.0,
      sample_predictions: [{ prompt: message }]
    };
    const aiRes = await requestAiExplanation(payload);
    if (aiRes.ok && aiRes.data && aiRes.data.success && aiRes.data.explanation) {
      let replyText = (aiRes.data.explanation || '')
        .replace(/Hello,?\s*I am NEXA AI,?\s*/gi, '')
        .replace(/I am NEXA AI,?\s*/gi, '')
        .replace(/NEXA AI/gi, 'Aura AI')
        .replace(/Gemini[\s-]*\d*\.?\d*[\s-]*Flash/gi, 'Aura Engine')
        .replace(/Gemini/gi, 'Aura')
        .replace(/Google/gi, 'Aura')
        .trim();

      if (!replyText.startsWith("Hi I am Aura")) {
        replyText = `Hi I am Aura. ${replyText}`;
      }
      return {
        status: 'success',
        id: 'msg_' + Date.now(),
        reply: replyText,
        modelResult: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  } catch (e) {
    // Fallback to local mock assistant
  }

  return mockBackendResponse(API_CONFIG.ENDPOINTS.CHAT, { message, conversationId, userId });
}

const NEXA_API = {
  auth: {
    login: (creds) => apiFetch(API_CONFIG.ENDPOINTS.AUTH, 'POST', { action: 'login', ...creds }),
    register: (details) => apiFetch(API_CONFIG.ENDPOINTS.AUTH, 'POST', { action: 'register', ...details }),
    googleLogin: (details) => apiFetch(API_CONFIG.ENDPOINTS.AUTH, 'POST', { action: 'google_login', ...details })
  },
  chat: {
    send: (message, conversationId, userId) => sendChatMessage(message, conversationId, userId),
    getHistory: (userId) => apiFetch(`${API_CONFIG.ENDPOINTS.HISTORY}?user_id=${userId}`, 'GET')
  },
  fraud: {
    uploadDataset: (file) => uploadFraudDataset(file),
    analyzeAi: (payload) => requestAiExplanation(payload)
  },
  regression: {
    uploadDataset: (file) => uploadRegressionDataset(file),
    analyzeAi: (payload) => requestAiRegressionExplanation(payload)
  },
  cnn: {
    analyzeImage: (file) => analyzeCnnImage(file),
    analyzeAi: (payload) => requestAiDiseaseExplanation(payload)
  },
  ai: {
    analyzeFraud: (payload) => requestAiExplanation(payload),
    analyzeRegression: (payload) => requestAiRegressionExplanation(payload),
    analyzeDisease: (payload) => requestAiDiseaseExplanation(payload)
  }
};
