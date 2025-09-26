const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // User methods
  async getMe() {
    return this.request('/users/me');
  }

  async getUsers() {
    return this.request('/users');
  }

  async updateStatus(isOnline: boolean) {
    return this.request('/users/status', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  }

  // Chat methods
  async getChats() {
    return this.request('/chats');
  }

  async getChat(chatId: string) {
    return this.request(`/chats/${chatId}`);
  }

  async getAvailableAgents() {
    return this.request('/available-agents');
  }

  async getAvailableCustomers() {
    return this.request('/available-customers');
  }

  async createChat(customerId: string, agentId?: string) {
    const payload: { customerId: string; agentId?: string } = { customerId };
    if (agentId) {
      payload.agentId = agentId;
    }
    
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async sendMessage(chatId: string, content: string, type: string = 'text') {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0) {
    return this.request(`/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async updateChatStatus(chatId: string, status: string) {
    return this.request(`/chats/${chatId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteChat(chatId: string) {
    return this.request(`/chats/${chatId}`, { method: 'DELETE' });
  }

  async getArchivedChats() {
    return this.request('/archived-chats');
  }

  async archiveChat(chatId: string) {
    return this.request(`/chats/${chatId}/archive`, { method: 'PUT' });
  }

  async unarchiveChat(chatId: string) {
    return this.request(`/chats/${chatId}/unarchive`, { method: 'PUT' });
  }

  // WebSocket URL
  getWebSocketUrl() {
    const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
    const baseWsUrl = this.baseURL.replace(/^https?/, wsProtocol);
    return `${baseWsUrl}/ws${this.token ? `?token=${this.token}` : ''}`;
  }
}

export const apiClient = new ApiClient();
export default ApiClient;