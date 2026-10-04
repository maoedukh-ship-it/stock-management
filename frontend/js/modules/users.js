import { SAMPLE_USERS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let userFilter = {
  search: '',
  role: 'ALL',
  status: 'ALL'
};

/**
 * Main View Renderer
 */
export function renderUsers() {
  const currentUser = auth.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // KPI Calculations
  const totalUsers = SAMPLE_USERS.length;
  const activeCount = SAMPLE_USERS.filter(u => u.status === 'ACTIVE').length;
  const adminCount = SAMPLE_USERS.filter(u => u.role === 'ADMIN').length;
  const managerCount = SAMPLE_USERS.filter(u => u.role === 'STOCK_MANAGER').length;
  const viewerCount = SAMPLE_USERS.filter(u => u.role === 'VIEWER').length;

  // Filtered Users List
  const filteredUsers = SAMPLE_USERS.filter(u => {
    const term = userFilter.search.toLowerCase();
    const matchSearch = !term ||
      u.username.toLowerCase().includes(term) ||
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.userId.toLowerCase().includes(term);

    const matchRole = userFilter.role === 'ALL' || u.role === userFilter.role;
    const matchStatus = userFilter.status === 'ALL' || u.status === userFilter.status;

    return matchSearch && matchRole && matchStatus;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>User Administration & RBAC Management</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 15 Active</span>
        </div>
        <p>Provision operator accounts, assign corporate security tiers, reset access credentials, and enforce role-based privileges.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportUsersCSV()" title="Export operator roster">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Users
        </button>
        ${isAdmin ? `
          <button class="btn btn-primary btn-sm" onclick="window.openAddUserModal()" title="Create new system user">
            <svg viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Add New User
          </button>
        ` : `
          <span class="badge badge-neutral" style="padding: 6px 12px; font-size: 12px;">
            Role: <strong>${currentUser?.role || 'VIEWER'}</strong> (Read-Only)
          </span>
        `}
      </div>
    </div>

    ${!isAdmin ? `
      <div class="card" style="border-left: 4px solid var(--warning); margin-bottom: 20px;">
        <div class="card-body" style="padding: 14px 20px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px;">
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke: var(--warning); fill: none; stroke-width: 2; flex-shrink: 0;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div>
            <strong>Privilege Notice:</strong> Your current session is authenticated as <strong>${currentUser?.role || 'VIEWER'}</strong>. Only system <strong>Administrators</strong> possess clearance to provision operators, reassign security roles, reset credentials, or deactivate accounts.
          </div>
        </div>
      </div>
    ` : ''}

    <!-- 5 KPI Statistics Cards -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Operators</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalUsers}</div>
        <div class="kpi-footer"><span class="kpi-trend positive">${activeCount} active</span> • ${totalUsers - activeCount} inactive</div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Administrators</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${adminCount}</div>
        <div class="kpi-footer">Full system authority</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Managers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${managerCount}</div>
        <div class="kpi-footer">Catalog & warehouse ops</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Viewers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${viewerCount}</div>
        <div class="kpi-footer">Read-only oversight</div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search User / Name / Email</label>
            <input type="text" class="form-input" placeholder="Search by username, full name, email..." value="${userFilter.search}" oninput="window.handleUserSearch(this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Security Tier</label>
            <select class="form-select" onchange="window.handleUserFilter('role', this.value)">
              <option value="ALL" ${userFilter.role === 'ALL' ? 'selected' : ''}>All Roles</option>
              <option value="ADMIN" ${userFilter.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              <option value="STOCK_MANAGER" ${userFilter.role === 'STOCK_MANAGER' ? 'selected' : ''}>STOCK_MANAGER</option>
              <option value="VIEWER" ${userFilter.role === 'VIEWER' ? 'selected' : ''}>VIEWER</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Account Status</label>
            <select class="form-select" onchange="window.handleUserFilter('status', this.value)">
              <option value="ALL" ${userFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
              <option value="ACTIVE" ${userFilter.status === 'ACTIVE' ? 'selected' : ''}>Active Accounts</option>
              <option value="INACTIVE" ${userFilter.status === 'INACTIVE' ? 'selected' : ''}>Inactive Accounts</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetUserFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2"/></svg>
          System Operators Roster
        </div>
        <span class="badge badge-neutral" style="font-size: 11.5px;">${filteredUsers.length} Operators</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Work Email</th>
              <th>Security Tier</th>
              <th>Status</th>
              <th>Last Authenticated</th>
              <th>Created Date</th>
              <th style="text-align: right;">Administrative Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No operators match current filters.</td></tr>
            ` : filteredUsers.map(u => {
              const initials = u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isMasterAdmin = u.username === 'admin';
              const isSelf = currentUser?.userId === u.userId || currentUser?.username === u.username;

              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 34px; height: 34px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0;">
                        ${initials}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${u.fullName} ${isSelf ? '<span class="badge badge-neutral" style="font-size: 10px; margin-left: 4px;">You</span>' : ''}</div>
                        <div style="font-size: 11.5px; color: var(--text-muted); font-family: monospace;">@${u.username} • ${u.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; color: var(--text-secondary);">${u.email}</div>
                  </td>
                  <td>
                    <span class="badge ${
                      u.role === 'ADMIN' ? 'badge-primary' :
                      u.role === 'STOCK_MANAGER' ? 'badge-in-stock' : 'badge-neutral'
                    }" style="font-size: 11px;">
                      ${u.role}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${u.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-out-of-stock'}" style="font-size: 11px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 4px;"></span>
                      ${u.status}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted);">${u.lastLogin || 'Never'}</td>
                  <td style="font-size: 12px; color: var(--text-muted);">${u.createdDate}</td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="window.viewUserDossier('${u.userId}')" title="View Operator Profile Dossier">
                        Dossier
                      </button>
                      ${isAdmin ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.openEditUserModal('${u.userId}')" title="Edit Profile & Assign Security Role">
                          Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.openResetUserPasswordModal('${u.userId}')" title="Issue New Temporary Password">
                          Reset Pwd
                        </button>
                        ${!isMasterAdmin && !isSelf ? `
                          <button class="btn btn-secondary btn-sm" onclick="window.toggleUserStatusPrompt('${u.userId}')" style="color: ${u.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)'};" title="${u.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}">
                            ${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        ` : ''}
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Modal Workflows
// --------------------------------------------------------------------------

/**
 * 1. Add New User Modal
 */
window.openAddUserModal = function() {
  window.openModal({
    title: 'Provision New System Operator',
    body: `
      <form id="add-user-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewUser();">
        <div class="form-group">
          <label class="form-label">Username <span class="required-star">*</span></label>
          <input type="text" id="usr-new-username" class="form-input" placeholder="e.g. jmiller" required />
          <div class="form-hint">Lowercase, letters and numbers</div>
        </div>
        <div class="form-group">
          <label class="form-label">Temporary Password <span class="required-star">*</span></label>
          <div style="position: relative;">
            <input type="password" id="usr-new-pwd" class="form-input" placeholder="Min 6 characters" minlength="6" required />
            <button type="button" onclick="window.toggleModalPwdVisibility('usr-new-pwd')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--text-muted);">Show</button>
          </div>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Full Name <span class="required-star">*</span></label>
          <input type="text" id="usr-new-fullname" class="form-input" placeholder="e.g. Jessica Miller" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Work Email Address <span class="required-star">*</span></label>
          <input type="email" id="usr-new-email" class="form-input" placeholder="jmiller@company.com" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Security Role Tier <span class="required-star">*</span></label>
          <select id="usr-new-role" class="form-select" required>
            <option value="VIEWER">VIEWER (Read-Only: Dashboard, Product Catalog, Valuation & Analytics)</option>
            <option value="STOCK_MANAGER" selected>STOCK_MANAGER (Standard Ops: Products, Stock In, Stock Out, Physical Count Adjustments)</option>
            <option value="ADMIN">ADMIN (Full Authority: User Admin, Security RBAC, System Settings, Audit Logs, Ledger Sync)</option>
          </select>
        </div>
      </form>
    `,
    primaryText: 'Provision Operator',
    onPrimary: () => window.submitNewUser()
  });
};

/**
 * Handle Add User Submission
 */
window.submitNewUser = async function() {
  const username = document.getElementById('usr-new-username')?.value.trim().toLowerCase();
  const password = document.getElementById('usr-new-pwd')?.value.trim();
  const fullName = document.getElementById('usr-new-fullname')?.value.trim();
  const email = document.getElementById('usr-new-email')?.value.trim();
  const role = document.getElementById('usr-new-role')?.value || 'VIEWER';

  if (!username || !password || !fullName || !email) {
    window.showToast('All fields marked with an asterisk are required.', 'error');
    return;
  }

  if (password.length < 6) {
    window.showToast('Initial password must be at least 6 characters long.', 'error');
    return;
  }

  if (SAMPLE_USERS.some(u => u.username.toLowerCase() === username)) {
    window.showToast(`Username "@${username}" is already assigned to an existing operator.`, 'error');
    return;
  }

  const userId = `USR-${(SAMPLE_USERS.length + 1).toString().padStart(3, '0')}`;
  const nowStr = new Date().toISOString().slice(0, 10);

  const newUser = {
    userId,
    username,
    fullName,
    email,
    role,
    status: 'ACTIVE',
    lastLogin: 'Never',
    createdDate: nowStr
  };

  SAMPLE_USERS.push(newUser);

  // Live Backend Call
  let apiSaved = false;
  if (api.isConfigured()) {
    try {
      window.showToast('Saving new operator to Google Sheets...', 'info');
      await api.createUser({
        username,
        password,
        fullName,
        email,
        role
      }, auth.getToken());
      apiSaved = true;
      window.showToast(`✅ Operator @${username} recorded in Google Sheets!`, 'success');
    } catch (e) {
      console.error('API createUser failed:', e);
      window.showToast(`❌ Google Sheets Error: ${e.message}`, 'error', 8000);
    }
  } else {
    window.showToast(`⚠️ Demo Mode: Operator @${username} saved locally. To save to Google Sheets, connect your Web App URL in the top header.`, 'warning', 6000);
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'CREATE_USER',
    module: 'Users',
    recordId: userId,
    description: `Provisioned operator @${username} (${fullName}) with role tier [${role}]`
  });

  window.closeModal();
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderUsers();
};

/**
 * 2. Edit User & Role Assignment Modal
 */
window.openEditUserModal = function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  const isMasterAdmin = u.username === 'admin';

  window.openModal({
    title: `Edit Operator: @${u.username}`,
    body: `
      <form id="edit-user-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditUser('${u.userId}');">
        <div class="form-group">
          <label class="form-label">User ID</label>
          <input type="text" class="form-input" value="${u.userId}" disabled style="background: var(--surface-alt);" />
        </div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" value="@${u.username}" disabled style="background: var(--surface-alt);" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Full Name <span class="required-star">*</span></label>
          <input type="text" id="usr-edit-fullname" class="form-input" value="${u.fullName}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Work Email Address <span class="required-star">*</span></label>
          <input type="email" id="usr-edit-email" class="form-input" value="${u.email}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Security Role Tier <span class="required-star">*</span></label>
          <select id="usr-edit-role" class="form-select" ${isMasterAdmin ? 'disabled' : ''}>
            <option value="VIEWER" ${u.role === 'VIEWER' ? 'selected' : ''}>VIEWER (Read-Only: Dashboard, Product Catalog, Valuation & Analytics)</option>
            <option value="STOCK_MANAGER" ${u.role === 'STOCK_MANAGER' ? 'selected' : ''}>STOCK_MANAGER (Standard Ops: Products, Stock In, Stock Out, Physical Count Adjustments)</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN (Full Authority: User Admin, Security RBAC, System Settings, Audit Logs, Ledger Sync)</option>
          </select>
          ${isMasterAdmin ? '<div class="form-hint" style="color: var(--warning-dark);">Master admin account tier is locked.</div>' : ''}
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Account Status</label>
          <select id="usr-edit-status" class="form-select" ${isMasterAdmin ? 'disabled' : ''}>
            <option value="ACTIVE" ${u.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE (Authorized to authenticate and perform tasks)</option>
            <option value="INACTIVE" ${u.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE (Temporarily suspended / Login blocked)</option>
          </select>
        </div>
      </form>
    `,
    primaryText: 'Save Changes',
    onPrimary: () => window.submitEditUser(u.userId)
  });
};

/**
 * Handle Edit User Submission
 */
window.submitEditUser = async function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  const fullName = document.getElementById('usr-edit-fullname')?.value.trim();
  const email = document.getElementById('usr-edit-email')?.value.trim();
  const role = document.getElementById('usr-edit-role')?.value || u.role;
  const status = document.getElementById('usr-edit-status')?.value || u.status;

  if (!fullName || !email) {
    window.showToast('Full name and email are required.', 'error');
    return;
  }

  const oldRole = u.role;
  u.fullName = fullName;
  u.email = email;
  if (u.username !== 'admin') {
    u.role = role;
    u.status = status;
  }

  if (api.isConfigured()) {
    try {
      await api.updateUser({
        userId,
        fullName,
        email,
        role: u.role,
        status: u.status
      }, auth.getToken());
    } catch (e) {
      console.warn('API updateUser failed, updated in local session:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'UPDATE_USER',
    module: 'Users',
    recordId: userId,
    description: `Updated profile for @${u.username} (Role: ${oldRole} → ${u.role}, Status: ${u.status})`
  });

  window.closeModal();
  window.showToast(`Operator @${u.username} profile updated successfully.`, 'success');
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderUsers();
};

/**
 * 3. Password Reset Modal
 */
window.openResetUserPasswordModal = function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  window.openModal({
    title: `Reset Password: @${u.username}`,
    body: `
      <div>
        <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px;">
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${u.fullName}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Account: @${u.username} • Role: <strong>${u.role}</strong></div>
        </div>

        <form id="reset-pwd-form" onsubmit="event.preventDefault(); window.submitResetUserPassword('${u.userId}');">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">New Temporary Password <span class="required-star">*</span></label>
            <div style="position: relative;">
              <input type="password" id="usr-reset-newpwd" class="form-input" placeholder="Enter new password (min 6 chars)" minlength="6" required />
              <button type="button" onclick="window.toggleModalPwdVisibility('usr-reset-newpwd')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--text-muted);">Show</button>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Confirm Password <span class="required-star">*</span></label>
            <input type="password" id="usr-reset-confirmpwd" class="form-input" placeholder="Repeat new password" minlength="6" required />
          </div>
        </form>

        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0;">
          The operator will be required to authenticate with this new credential upon their next portal sign-in.
        </p>
      </div>
    `,
    primaryText: 'Set New Password',
    onPrimary: () => window.submitResetUserPassword(u.userId)
  });
};

/**
 * Handle Password Reset Submission
 */
window.submitResetUserPassword = async function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  const p1 = document.getElementById('usr-reset-newpwd')?.value.trim();
  const p2 = document.getElementById('usr-reset-confirmpwd')?.value.trim();

  if (!p1 || p1.length < 6) {
    window.showToast('Password must be at least 6 characters long.', 'error');
    return;
  }

  if (p1 !== p2) {
    window.showToast('Password confirmation does not match.', 'error');
    return;
  }

  if (api.isConfigured()) {
    try {
      await api.resetUserPassword(userId, p1, auth.getToken());
    } catch (e) {
      console.warn('API resetUserPassword failed, updated in local session:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'RESET_PASSWORD',
    module: 'Users',
    recordId: userId,
    description: `Administrative credential reset issued for operator @${u.username}`
  });

  window.closeModal();
  window.showToast(`Credentials for @${u.username} reset successfully.`, 'success');
};

/**
 * 4. Toggle Status Prompt
 */
window.toggleUserStatusPrompt = function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  if (u.username === 'admin') {
    window.showToast('Primary master admin account cannot be deactivated.', 'error');
    return;
  }

  const isDeactivating = u.status === 'ACTIVE';

  window.openModal({
    title: `${isDeactivating ? 'Deactivate' : 'Activate'} Operator: @${u.username}`,
    body: `
      <div>
        <p style="font-size: 14px; color: var(--text-main); margin-bottom: 10px;">
          Are you sure you want to <strong>${isDeactivating ? 'deactivate' : 'reactivate'}</strong> the account for <strong>${u.fullName} (@${u.username})</strong>?
        </p>
        <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.6;">
          ${isDeactivating 
            ? 'Deactivated operators are immediately blocked from logging into the Stock Management System. All historic transaction ledgers created by this user will remain permanently preserved.'
            : 'Reactivating this operator restores their access privileges according to their assigned security tier.'}
        </p>
      </div>
    `,
    primaryText: isDeactivating ? 'Yes, Deactivate' : 'Yes, Activate',
    onPrimary: async () => {
      u.status = isDeactivating ? 'INACTIVE' : 'ACTIVE';

      if (api.isConfigured()) {
        try {
          await api.deactivateUser(userId, auth.getToken());
        } catch (e) {
          console.warn('API deactivateUser failed:', e);
        }
      }

      SAMPLE_AUDIT_LOGS.unshift({
        id: `LOG-${Date.now().toString().slice(-4)}`,
        dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: auth.getUser()?.userId || 'USR-001',
        username: auth.getUser()?.username || 'admin',
        action: 'UPDATE_USER_STATUS',
        module: 'Users',
        recordId: userId,
        description: `Set account status for @${u.username} to ${u.status}`
      });

      window.closeModal();
      window.showToast(`Operator @${u.username} status toggled to ${u.status}.`, 'info');
      const container = document.getElementById('view-content');
      if (container) container.innerHTML = renderUsers();
    }
  });
};

/**
 * 5. View User Dossier Modal
 */
window.viewUserDossier = function(userId) {
  const u = SAMPLE_USERS.find(item => item.userId === userId);
  if (!u) return;

  const initials = u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const userAudits = SAMPLE_AUDIT_LOGS.filter(l => l.userId === u.userId || l.username === u.username);

  const permissions = u.role === 'ADMIN' ? [
    'Full Master Product Catalog Management (Add/Edit/Archive)',
    'Stock In / Purchase Receipts Management',
    'Stock Out / Fulfillment Dispatching',
    'Stock Adjustment & Count Reconciliation',
    'Ledger Synchronization & Equation Recalculation',
    'Full User Administration & Security Tier Assignment',
    'Corporate System Configuration & Settings',
    'Security Audit Log Inspection & Compliance Export'
  ] : u.role === 'STOCK_MANAGER' ? [
    'Master Product Catalog Operations (Add/Edit)',
    'Stock In / Purchase Receipts Execution',
    'Stock Out / Dispatch Orders Execution',
    'Stock Adjustment & Variance Logging',
    'Ledger Recalculation & Synchronize Balances',
    'Analytical Inventory Reports View & Export'
  ] : [
    'Executive Dashboard Live Telemetry (Read-Only)',
    'Inventory Catalog & Balances Search (Read-Only)',
    'Valuation & Movement Reports (Read-Only)',
    'Export Reports & Inventory Data to CSV'
  ];

  window.openModal({
    title: `Operator Dossier: ${u.fullName}`,
    body: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--primary); color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${initials}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 17px; font-weight: 700; color: var(--text-main);">${u.fullName}</div>
            <div style="font-size: 12px; color: var(--text-muted); font-family: monospace;">@${u.username} • ${u.userId}</div>
          </div>
          <div>
            <span class="badge ${u.role === 'ADMIN' ? 'badge-primary' : u.role === 'STOCK_MANAGER' ? 'badge-in-stock' : 'badge-neutral'}">
              ${u.role}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Email:</strong> <div>${u.email}</div></div>
          <div><strong style="color: var(--text-muted);">Account Status:</strong> <div><span class="badge ${u.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-out-of-stock'}">${u.status}</span></div></div>
          <div><strong style="color: var(--text-muted);">Last Login:</strong> <div>${u.lastLogin || 'Never'}</div></div>
          <div><strong style="color: var(--text-muted);">Account Created:</strong> <div>${u.createdDate}</div></div>
        </div>

        <div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Role Permissions Cleared:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 12.5px; color: var(--text-secondary); line-height: 1.6;">
            ${permissions.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>

        ${userAudits.length > 0 ? `
          <div style="border-top: 1px solid var(--border); padding-top: 12px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Recent Audit Activity:</div>
            <div style="max-height: 120px; overflow-y: auto; font-size: 11.5px; display: flex; flex-direction: column; gap: 6px;">
              ${userAudits.slice(0, 3).map(a => `
                <div style="background: var(--surface-alt); padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <span style="font-weight: 600; color: var(--primary);">[${a.action}]</span> ${a.description}
                  <div style="color: var(--text-muted); font-size: 10.5px;">${a.dateTime}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `,
    primaryText: 'Close Dossier',
    onPrimary: () => window.closeModal()
  });
};

/**
 * Filter & Utility Hooks
 */
window.handleUserSearch = function(val) {
  userFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderUsers();
};

window.handleUserFilter = function(key, val) {
  userFilter[key] = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderUsers();
};

window.resetUserFilters = function() {
  userFilter = { search: '', role: 'ALL', status: 'ALL' };
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderUsers();
};

window.toggleModalPwdVisibility = function(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.type = el.type === 'password' ? 'text' : 'password';
  }
};

window.exportUsersCSV = function() {
  const nowStr = new Date().toISOString().slice(0, 10);
  const rows = [
    ['Apex Stock Management System - Operator Roster'],
    ['Generated On', new Date().toISOString()],
    ['Generated By', `${auth.getUser()?.fullName || 'System User'} (${auth.getUser()?.role || 'VIEWER'})`],
    [],
    ['User ID', 'Username', 'Full Name', 'Work Email', 'Security Role Tier', 'Status', 'Last Login', 'Created Date'],
    ...SAMPLE_USERS.map(u => [
      u.userId,
      u.username,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.status,
      u.lastLogin || 'Never',
      u.createdDate
    ])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `System_Operators_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast('Operator roster exported to CSV.', 'success');
};
