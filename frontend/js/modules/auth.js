import { SAMPLE_USERS } from '../sampleData.js';
import { api } from '../apiClient.js';

class AuthManager {
  constructor() {
    this.userStorageKey = 'sms_current_user';
    this.tokenStorageKey = 'sms_session_token';
    this.inactivityTimeoutMs = 30 * 60 * 1000; // 30 minutes
    this.inactivityTimer = null;

    this.currentUser = this.loadUser();
    this.sessionToken = this.loadToken();

    this.routePermissions = {
      'dashboard': ['ADMIN', 'STOCK_MANAGER', 'VIEWER'],
      'inventory': ['ADMIN', 'STOCK_MANAGER', 'VIEWER'],
      'products': ['ADMIN', 'STOCK_MANAGER', 'VIEWER'],
      'categories': ['ADMIN', 'STOCK_MANAGER', 'VIEWER'],
      'reports': ['ADMIN', 'STOCK_MANAGER', 'VIEWER'],
      'stock-in': ['ADMIN', 'STOCK_MANAGER'],
      'stock-out': ['ADMIN', 'STOCK_MANAGER'],
      'adjustment': ['ADMIN', 'STOCK_MANAGER'],
      'suppliers': ['ADMIN', 'STOCK_MANAGER'],
      'locations': ['ADMIN', 'STOCK_MANAGER'],
      'users': ['ADMIN'],
      'settings': ['ADMIN'],
      'audit-log': ['ADMIN']
    };

    if (this.isAuthenticated()) {
      this.startInactivityWatchdog();
    }
  }

  loadUser() {
    try {
      const stored = localStorage.getItem(this.userStorageKey) || sessionStorage.getItem(this.userStorageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading stored user session:', e);
    }
    return SAMPLE_USERS[0]; // Default for smooth visual development
  }

  loadToken() {
    try {
      return localStorage.getItem(this.tokenStorageKey) || sessionStorage.getItem(this.tokenStorageKey) || 'demo_session_token';
    } catch (e) {
      return null;
    }
  }

  async login(username, password, remember = false) {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please provide both username and password.' };
    }

    // 1. Live Google Apps Script API authentication if configured
    if (api.isConfigured()) {
      try {
        const res = await api.login(cleanUser, cleanPass);
        if (res && res.success && res.data) {
          return this.setAuthenticatedSession(res.data.user, res.data.token, remember);
        }
      } catch (err) {
        console.warn('API authentication error, falling back to local verification:', err);
        return { success: false, message: err.message || 'Unable to connect to Google Sheets authentication service.' };
      }
    }

    // 2. Local / Development validation
    const user = SAMPLE_USERS.find(u => u.username.toLowerCase() === cleanUser);
    if (!user) {
      return { success: false, message: 'Invalid username or password. Check credentials and try again.' };
    }

    // Demo password rules
    const validPasswords = {
      'admin': 'admin123',
      'manager': 'mgr123',
      'viewer': 'view123'
    };

    if (validPasswords[user.username] && cleanPass !== validPasswords[user.username]) {
      return { success: false, message: 'Invalid password. Check credentials or use quick-demo buttons.' };
    }

    if (user.status !== 'ACTIVE') {
      return { success: false, message: 'Account has been deactivated. Please contact your system administrator.' };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const dummyToken = btoa(JSON.stringify({
      userId: user.userId,
      username: user.username,
      role: user.role,
      issuedAt: Date.now()
    }));

    return this.setAuthenticatedSession(updatedUser, dummyToken, remember);
  }

  setAuthenticatedSession(user, token, remember) {
    this.currentUser = user;
    this.sessionToken = token;

    const userJson = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(this.userStorageKey, userJson);
      localStorage.setItem(this.tokenStorageKey, token);
      sessionStorage.removeItem(this.userStorageKey);
      sessionStorage.removeItem(this.tokenStorageKey);
    } else {
      sessionStorage.setItem(this.userStorageKey, userJson);
      sessionStorage.setItem(this.tokenStorageKey, token);
      localStorage.removeItem(this.userStorageKey);
      localStorage.removeItem(this.tokenStorageKey);
    }

    this.startInactivityWatchdog();
    return { success: true, user: this.currentUser, token: this.sessionToken };
  }

  logout(reason = null) {
    this.stopInactivityWatchdog();
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
    sessionStorage.removeItem(this.userStorageKey);
    sessionStorage.removeItem(this.tokenStorageKey);
    this.currentUser = null;
    this.sessionToken = null;

    if (reason && window.showToast) {
      window.showToast(reason, 'warning');
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getUser() {
    return this.currentUser;
  }

  getToken() {
    return this.sessionToken;
  }

  hasRole(...roles) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'ADMIN') return true;
    return roles.includes(this.currentUser.role);
  }

  canAccessRoute(route) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'ADMIN') return true;
    const allowed = this.routePermissions[route];
    if (!allowed) return true;
    return allowed.includes(this.currentUser.role);
  }

  /**
   * Inactivity Auto-Logout Watchdog
   */
  startInactivityWatchdog() {
    this.stopInactivityWatchdog();
    this.resetInactivityTimer();

    this.activityHandler = () => this.resetInactivityTimer();
    window.addEventListener('mousemove', this.activityHandler, { passive: true });
    window.addEventListener('keydown', this.activityHandler, { passive: true });
    window.addEventListener('click', this.activityHandler, { passive: true });
    window.addEventListener('scroll', this.activityHandler, { passive: true });
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.inactivityTimeoutMs);
  }

  stopInactivityWatchdog() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = null;
    if (this.activityHandler) {
      window.removeEventListener('mousemove', this.activityHandler);
      window.removeEventListener('keydown', this.activityHandler);
      window.removeEventListener('click', this.activityHandler);
      window.removeEventListener('scroll', this.activityHandler);
      this.activityHandler = null;
    }
  }

  handleInactivityTimeout() {
    this.logout('Session expired due to 30 minutes of inactivity. Please log in again.');
    if (window.router) {
      window.router.navigate('login');
    }
  }
}

export const auth = new AuthManager();
window.auth = auth;
