/* ==========================================================================
   NEXA — Central Reactive State Store
   ========================================================================== */

class NexaStore {
  constructor() {
    this.state = {
      currentUser: NexaStorage.getUser(),
      conversations: NexaStorage.getConversations(),
      activeChatId: NexaStorage.getActiveChatId() || 'chat_default_1',
      isChatActive: false // false = initial welcome robot screen; true = active chat message stream
    };

    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    const userChanged = newState.currentUser !== undefined && newState.currentUser.id !== this.state.currentUser.id;
    this.state = { ...this.state, ...newState };

    if (userChanged) {
      const userConvos = NexaStorage.getConversations(this.state.currentUser.id);
      this.state.conversations = userConvos.length > 0 ? userConvos : [
        {
          id: 'chat_' + Date.now(),
          title: 'New AI Conversation',
          timestamp: 'Just now',
          messages: [
            {
              id: 'm_' + Date.now(),
              sender: 'nexa',
              text: `Hi I am Aura ${this.state.currentUser.name || 'User'}! How can I help you analyze, predict, or classify today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }
      ];
      this.state.activeChatId = this.state.conversations[0].id;
      this.state.isChatActive = false;
    }

    // Persist changes
    if (newState.currentUser !== undefined) NexaStorage.setUser(this.state.currentUser);
    if (newState.conversations !== undefined || userChanged) NexaStorage.saveConversations(this.state.conversations, this.state.currentUser.id);
    if (newState.activeChatId !== undefined || userChanged) NexaStorage.setActiveChatId(this.state.activeChatId);

    this.notify();
  }


  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getActiveConversation() {
    return this.state.conversations.find(c => c.id === this.state.activeChatId) || this.state.conversations[0];
  }

  addMessageToActiveChat(msg) {
    const active = this.getActiveConversation();
    if (!active) return;

    active.messages.push(msg);

    // Update conversation title if first user prompt
    if (active.messages.length === 2 && msg.sender === 'user') {
      active.title = msg.text.substring(0, 26) + (msg.text.length > 26 ? '...' : '');
    }

    this.setState({ conversations: [...this.state.conversations] });
  }

  createNewChat(initialPrompt = null) {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: initialPrompt ? (initialPrompt.substring(0, 26) + '...') : 'New AI Conversation',
      timestamp: 'Just now',
      messages: [
        {
          id: 'm_' + Date.now(),
          sender: 'nexa',
          text: "Hi I am Aura. How can I help you analyze, predict, or classify today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    if (initialPrompt) {
      newChat.messages.push({
        id: 'm_usr_' + Date.now(),
        sender: 'user',
        text: initialPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    const updated = [newChat, ...this.state.conversations];

    this.setState({
      conversations: updated,
      activeChatId: newChat.id,
      isChatActive: initialPrompt ? true : false
    });

    return newChat;
  }

  deleteConversation(id) {
    let updated = this.state.conversations.filter(c => c.id !== id);
    if (updated.length === 0) {
      const defaultChat = {
        id: 'chat_' + Date.now(),
        title: 'New AI Conversation',
        timestamp: 'Just now',
        messages: []
      };
      updated = [defaultChat];
    }

    const newActiveId = (this.state.activeChatId === id) ? updated[0].id : this.state.activeChatId;
    this.setState({
      conversations: updated,
      activeChatId: newActiveId,
      isChatActive: updated[0].messages && updated[0].messages.length > 0
    });
  }

  renameConversation(id, newTitle) {
    if (!newTitle || !newTitle.trim()) return;
    const convos = this.state.conversations.map(c => {
      if (c.id === id) {
        return { ...c, title: newTitle.trim() };
      }
      return c;
    });
    this.setState({ conversations: convos });
  }
}

const store = new NexaStore();
