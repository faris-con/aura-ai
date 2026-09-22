/* ==========================================================================
   NEXA — LocalStorage Data Storage Helper
   ========================================================================== */

const STORAGE_KEYS = {
  USER: 'nexa_user_session',
  ACTIVE_CHAT: 'nexa_active_chat_id',
  CONVERSATIONS: 'nexa_conversations_list',
  THEME: 'nexa_theme'
};

const DEFAULT_CONVERSATIONS = [
  {
    id: 'chat_default_1',
    title: 'Image analysis (CNN Vision)',
    timestamp: '10:45 AM',
    messages: [
      {
        id: 'm1',
        sender: 'nexa',
        text: "Hi I am Aura, your Huawei HCIA AI assistant. Send me an image or ask me anything to begin processing.",
        timestamp: '10:45 AM'
      }
    ]
  },
  {
    id: 'chat_default_2',
    title: 'Regression prediction forecast',
    timestamp: 'Yesterday',
    messages: [
      {
        id: 'm2',
        sender: 'user',
        text: "What is the expected forecast value for our XGBoost regressor model?",
        timestamp: 'Yesterday'
      },
      {
        id: 'm3',
        sender: 'nexa',
        text: "The XGBoost non-linear regressor projects an estimated output of $452,800.00 with an R² score of 0.934.",
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: 'chat_default_3',
    title: 'Classification result review',
    timestamp: 'Sep 17',
    messages: [
      {
        id: 'm4',
        sender: 'nexa',
        text: "Random Forest ensemble multi-class classification completed with 91.5% confidence.",
        timestamp: 'Sep 17'
      }
    ]
  }
];

const DEFAULT_USER = {
  id: null,
  name: 'Guest User',
  email: 'guest@huawei.ai',
  avatar: 'G',
  role: 'Guest Engineer'
};

const NexaStorage = {
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  setUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getConversations: (userId = 'guest') => {
    try {
      const key = `${STORAGE_KEYS.CONVERSATIONS}_${userId || 'guest'}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : (userId && userId !== 'guest' ? [] : DEFAULT_CONVERSATIONS);
    } catch (e) {
      return DEFAULT_CONVERSATIONS;
    }
  },

  saveConversations: (convos, userId = 'guest') => {
    try {
      const key = `${STORAGE_KEYS.CONVERSATIONS}_${userId || 'guest'}`;
      localStorage.setItem(key, JSON.stringify(convos));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },


  getActiveChatId: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT) || null;
    } catch (e) {
      return null;
    }
  },

  setActiveChatId: (id) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, id);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getTheme: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    } catch (e) {
      return 'light';
    }
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }
};
