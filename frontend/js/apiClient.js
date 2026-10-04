/**
 * apiClient.js - Frontend Google Apps Script API Bridge
 * Communicates with the Google Apps Script Web App URL
 */

class ApiClient {
  constructor() {
    this.storageKey = 'sms_api_url';
    const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.trim() : '';
    this.apiUrl = localStorage.getItem(this.storageKey) || envUrl;
  }

  setApiUrl(url) {
    this.apiUrl = url.trim();
    localStorage.setItem(this.storageKey, this.apiUrl);
  }

  getApiUrl() {
    return this.apiUrl;
  }

  isConfigured() {
    return !!this.apiUrl && this.apiUrl.startsWith('https://script.google.com/');
  }

  async request(action, { method = 'GET', data = {}, token = null } = {}) {
    if (!this.isConfigured()) {
      // Return simulated success indicator for Phase 1/2 UI testing
      console.info(`[API Simulation] Action: ${action}`, data);
      return { simulated: true, action };
    }

    try {
      let url = `${this.apiUrl}?action=${encodeURIComponent(action)}`;
      if (token) {
        url += `&token=${encodeURIComponent(token)}`;
      }

      const options = {
        method: method,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Apps Script handles text/plain CORS reliably
        }
      };

      if (method === 'POST') {
        options.body = JSON.stringify({ ...data, token });
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Operation failed.');
      }

      return result;
    } catch (err) {
      console.error(`[API Error: ${action}]`, err);
      throw new Error(err.message || 'Unable to connect to Google Apps Script. Please verify the Web App deployment URL and permissions.');
    }
  }

  // Quick Endpoints
  async ping() {
    return this.request('ping');
  }

  async login(username, password) {
    return this.request('login', { method: 'POST', data: { username, password } });
  }

  async getDashboard() {
    return this.request('getDashboard');
  }

  async getProducts() {
    return this.request('getProducts');
  }

  async createStockIn(payload, token) {
    return this.request('createStockIn', { method: 'POST', data: payload, token });
  }

  async createStockOut(payload, token) {
    return this.request('createStockOut', { method: 'POST', data: payload, token });
  }

  async createStockAdjustment(payload, token) {
    return this.request('createStockAdjustment', { method: 'POST', data: payload, token });
  }

  async getReports(type, filters = {}) {
    let query = `getReports&type=${encodeURIComponent(type)}`;
    Object.keys(filters).forEach(k => {
      if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
        query += `&${encodeURIComponent(k)}=${encodeURIComponent(filters[k])}`;
      }
    });
    return this.request(query);
  }

  async getUsers(token) {
    return this.request('getUsers', { token });
  }

  async createUser(payload, token) {
    return this.request('createUser', { method: 'POST', data: payload, token });
  }

  async updateUser(payload, token) {
    return this.request('updateUser', { method: 'POST', data: payload, token });
  }

  async deactivateUser(userId, token) {
    return this.request('deactivateUser', { method: 'POST', data: { userId }, token });
  }

  async resetUserPassword(userId, newPassword, token) {
    return this.request('resetUserPassword', { method: 'POST', data: { userId, newPassword }, token });
  }

  async getAuditLogs(filters = {}, token) {
    let query = `getAuditLogs`;
    Object.keys(filters).forEach(k => {
      if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
        query += `&${encodeURIComponent(k)}=${encodeURIComponent(filters[k])}`;
      }
    });
    return this.request(query, { token });
  }
}

export const api = new ApiClient();
window.api = api;
