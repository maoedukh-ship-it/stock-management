import './apiClient.js';
import { auth } from './modules/auth.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderInventory } from './modules/inventory.js';
import { renderStockIn } from './modules/stockIn.js';
import { renderStockOut } from './modules/stockOut.js';
import { renderAdjustment } from './modules/adjustment.js';
import { renderSuppliers } from './modules/suppliers.js';
import { renderCategories } from './modules/categories.js';
import { renderLocations } from './modules/locations.js';
import { renderReports } from './modules/reports.js';
import { renderUsers } from './modules/users.js';
import { renderSettings } from './modules/settings.js';
import { renderAuditLog } from './modules/auditLog.js';

class AppRouter {
  constructor() {
    this.routes = {
      'dashboard': renderDashboard,
      'inventory': renderInventory,
      'products': renderInventory,
      'categories': renderCategories,
      'stock-in': renderStockIn,
      'stock-out': renderStockOut,
      'adjustment': renderAdjustment,
      'suppliers': renderSuppliers,
      'locations': renderLocations,
      'reports': renderReports,
      'users': renderUsers,
      'settings': renderSettings,
      'audit-log': renderAuditLog
    };
    this.currentRoute = 'dashboard';
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => {
      this.initShellEvents();
      this.handleRoute();
    });
  }

  navigate(route) {
    window.location.hash = `#${route}`;
  }

  handleRoute() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!hash) hash = 'dashboard';

    if (hash === 'logout') {
      auth.logout();
      window.showToast('You have been logged out securely.', 'info');
      this.navigate('login');
      return;
    }

    if (hash === 'login') {
      this.renderLoginView();
      return;
    }

    // Check auth
    if (!auth.isAuthenticated()) {
      this.navigate('login');
      return;
    }

    // Render app shell if hidden
    const appShell = document.getElementById('app-shell');
    const loginShell = document.getElementById('login-shell');
    if (appShell && loginShell) {
      appShell.style.display = 'flex';
      loginShell.style.display = 'none';
    }

    this.currentRoute = hash;

    // Check RBAC Permissions
    if (!auth.canAccessRoute(hash)) {
      const user = auth.getUser();
      const viewContainer = document.getElementById('view-content');
      if (viewContainer) {
        viewContainer.innerHTML = `
          <div class="page-header">
            <div class="page-title-group">
              <h1>Access Restricted</h1>
              <p>Security Privilege Policy</p>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 60px 24px; max-width: 600px; margin: 40px auto;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--danger-light); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: currentColor; fill: none; stroke-width: 2;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Unauthorized Access (403)</h2>
            <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
              Your current account role <strong style="color: var(--primary);">[${user?.role || 'VIEWER'}]</strong> does not have clearance to view or perform operations in the <strong>${hash.replace('-', ' ').toUpperCase()}</strong> module.
            </p>
            <div>
              <button class="btn btn-primary" onclick="window.router.navigate('dashboard')">
                <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Return to Executive Dashboard
              </button>
            </div>
          </div>
        `;
      }
      this.updateActiveNav('dashboard');
      return;
    }

    this.updateActiveNav(hash);

    const viewContainer = document.getElementById('view-content');
    if (viewContainer) {
      const renderFn = this.routes[hash] || renderDashboard;
      viewContainer.innerHTML = renderFn();
      window.scrollTo(0, 0);
    }

    // Close mobile drawer on route navigation
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
  }

  updateActiveNav(route) {
    const user = auth.getUser();

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      const target = el.getAttribute('data-route');
      const hasPerm = auth.canAccessRoute(target);

      // Hide or show link based on Role permissions
      if (!hasPerm) {
        el.style.display = 'none';
      } else {
        el.style.display = 'flex';
      }

      if (target === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update section titles visibility based on items
    document.querySelectorAll('.sidebar-nav .nav-section-title').forEach(titleEl => {
      let nextEl = titleEl.nextElementSibling;
      let hasVisibleChild = false;
      while (nextEl && !nextEl.classList.contains('nav-section-title')) {
        if (nextEl.style.display !== 'none') {
          hasVisibleChild = true;
          break;
        }
        nextEl = nextEl.nextElementSibling;
      }
      titleEl.style.display = hasVisibleChild ? 'block' : 'none';
    });

    // Update breadcrumb
    const bc = document.getElementById('header-breadcrumb');
    if (bc) {
      const readable = route.replace('-', ' ').toUpperCase();
      bc.textContent = readable;
    }

    // Update user profile info
    if (user) {
      const nameEl = document.getElementById('shell-user-name');
      const roleEl = document.getElementById('shell-user-role');
      const avatarEl = document.getElementById('shell-user-avatar');
      if (nameEl) nameEl.textContent = user.fullName;
      if (roleEl) roleEl.textContent = user.role.replace('_', ' ');
      if (avatarEl) avatarEl.textContent = user.fullName.split(' ').map(n => n[0]).join('');
    }
  }

  renderLoginView() {
    const appShell = document.getElementById('app-shell');
    const loginShell = document.getElementById('login-shell');
    if (appShell && loginShell) {
      appShell.style.display = 'none';
      loginShell.style.display = 'flex';
    }
  }

  initShellEvents() {
    // Mobile Drawer Toggle
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn && sidebar && overlay) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    // Header Quick Search routing to inventory
    const headerSearch = document.getElementById('global-search-input');
    if (headerSearch) {
      headerSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = headerSearch.value.trim();
          this.navigate('inventory');
          setTimeout(() => {
            window.handleInventorySearch?.(val);
          }, 50);
        }
      });
    }
  }
}

export const router = new AppRouter();
window.router = router;
router.init();

/* Toast Notification Utility */
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' ? 
    `<svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>` :
    type === 'error' ?
    `<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>` :
    type === 'warning' ?
    `<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>` :
    `<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* Modal Dialog Utility */
window.openModal = function({ title, body, primaryText = 'Confirm', onPrimary = null }) {
  let backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title" id="modal-title">Dialog</div>
          <button class="modal-close-btn" onclick="window.closeModal()">✕</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer" id="modal-footer"></div>
      </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) window.closeModal();
    });
  }

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;

  const footer = document.getElementById('modal-footer');
  footer.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="window.closeModal()">Cancel</button>
    <button class="btn btn-primary btn-sm" id="modal-primary-btn">${primaryText}</button>
  `;

  document.getElementById('modal-primary-btn').onclick = () => {
    if (onPrimary) onPrimary();
    else window.closeModal();
  };

  backdrop.classList.add('open');
};

window.closeModal = function() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
};

/* Login Handler */
window.handleLoginSubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username')?.value;
  const pwd = document.getElementById('login-password')?.value;
  const remember = document.getElementById('login-remember')?.checked;

  const btn = document.getElementById('btn-login-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Authenticating...`;
  }

  try {
    const res = await auth.login(username, pwd, remember);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Sign In to Portal';
    }

    if (res.success) {
      window.showToast(`Welcome back, ${res.user.fullName}!`, 'success');
      window.router.navigate('dashboard');
    } else {
      window.showToast(res.message, 'error');
    }
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Sign In to Portal';
    }
    window.showToast(err.message || 'Authentication failed.', 'error');
  }
};

window.quickLogin = function(role) {
  const map = {
    'admin': ['admin', 'admin123'],
    'manager': ['manager', 'mgr123'],
    'viewer': ['viewer', 'view123']
  };
  const [u, p] = map[role] || ['admin', 'admin123'];
  const userField = document.getElementById('login-username');
  const pwdField = document.getElementById('login-password');
  if (userField && pwdField) {
    userField.value = u;
    pwdField.value = p;
    document.getElementById('login-form')?.dispatchEvent(new Event('submit', { cancelable: true }));
  }
};

window.togglePasswordVisibility = function() {
  const input = document.getElementById('login-password');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};
