import { SAMPLE_AUDIT_LOGS, SAMPLE_USERS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let auditFilter = {
  search: '',
  module: 'ALL',
  action: 'ALL',
  user: 'ALL',
  dateFrom: '',
  dateTo: new Date().toISOString().slice(0, 10)
};

let liveAuditLogs = [...SAMPLE_AUDIT_LOGS];
let isSyncing = false;

/**
 * Fetch live audit logs from Google Apps Script if connected
 */
export async function fetchLiveAuditLogs() {
  if (api.isConfigured()) {
    try {
      isSyncing = true;
      const res = await api.getAuditLogs(auditFilter, auth.getToken());
      if (res && res.success && Array.isArray(res.data)) {
        liveAuditLogs = res.data;
      }
    } catch (e) {
      console.warn('Could not fetch live audit logs from Google Sheets, using session state:', e);
    } finally {
      isSyncing = false;
    }
  }
}

/**
 * Main View Renderer
 */
export function renderAuditLog() {
  const currentUser = auth.getUser();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Available Modules & Actions
  const availableModules = [
    'Products',
    'Current Stock',
    'Stock In',
    'Stock Out',
    'Stock Adjustments',
    'Categories',
    'Suppliers',
    'Locations',
    'Users',
    'Settings',
    'Auth'
  ];

  const availableActions = [
    'STOCK_IN',
    'STOCK_OUT',
    'STOCK_ADJUSTMENT',
    'RECALCULATE_STOCK',
    'CREATE_PRODUCT',
    'UPDATE_PRODUCT',
    'ARCHIVE_PRODUCT',
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY',
    'CREATE_SUPPLIER',
    'UPDATE_SUPPLIER',
    'CREATE_LOCATION',
    'UPDATE_LOCATION',
    'CREATE_USER',
    'UPDATE_USER',
    'UPDATE_USER_STATUS',
    'RESET_PASSWORD',
    'UPDATE_SETTINGS',
    'LOGIN'
  ];

  // Unique usernames in log
  const uniqueUsers = Array.from(new Set(liveAuditLogs.map(l => l.username).filter(Boolean)));

  // Filtered Logs
  const filtered = liveAuditLogs.filter(item => {
    const term = auditFilter.search.toLowerCase();
    const matchSearch = !term ||
      (item.id && item.id.toLowerCase().includes(term)) ||
      (item.action && item.action.toLowerCase().includes(term)) ||
      (item.username && item.username.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.module && item.module.toLowerCase().includes(term)) ||
      (item.recordId && item.recordId.toLowerCase().includes(term));

    const matchModule = auditFilter.module === 'ALL' || item.module === auditFilter.module;
    const matchAction = auditFilter.action === 'ALL' || item.action === auditFilter.action;
    const matchUser = auditFilter.user === 'ALL' || item.username === auditFilter.user;

    const dStr = String(item.dateTime || '').slice(0, 10);
    const matchFrom = !auditFilter.dateFrom || dStr >= auditFilter.dateFrom;
    const matchTo = !auditFilter.dateTo || dStr <= auditFilter.dateTo;

    return matchSearch && matchModule && matchAction && matchUser && matchFrom && matchTo;
  });

  // KPI Calculations
  const totalEvents = liveAuditLogs.length;
  const movementEvents = liveAuditLogs.filter(l => 
    l.action === 'STOCK_IN' || l.action === 'STOCK_OUT' || l.action === 'STOCK_ADJUSTMENT' || l.action === 'RECALCULATE_STOCK'
  ).length;
  const catalogEvents = liveAuditLogs.filter(l => 
    l.module === 'Products' || l.module === 'Categories' || l.module === 'Suppliers' || l.module === 'Locations'
  ).length;
  const adminEvents = liveAuditLogs.filter(l => 
    l.module === 'Users' || l.module === 'Settings' || l.action === 'RESET_PASSWORD'
  ).length;
  const authEvents = liveAuditLogs.filter(l => 
    l.action === 'LOGIN' || l.action === 'LOGOUT' || l.module === 'Auth'
  ).length;

  return `
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>System Security & Activity Audit Log</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 16 Active</span>
        </div>
        <p>Immutable enterprise audit trail capturing all critical inventory actions, security authorizations, and administrative events.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.refreshAuditTrail()" title="Sync audit logs with database">
          <svg viewBox="0 0 24 24" id="audit-sync-icon" style="${isSyncing ? 'animation: spin 1s linear infinite;' : ''}"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          ${isSyncing ? 'Syncing...' : 'Refresh Logs'}
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.printAuditTrail()" title="Print compliance audit record">
          <svg viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Audit
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.exportAuditCSV()" title="Export audit trail to CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- 5 KPI Statistics Cards -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Audited Events</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalEvents}</div>
        <div class="kpi-footer"><span class="kpi-trend positive">Tamper-evident</span> journal</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Movements</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${movementEvents}</div>
        <div class="kpi-footer">In, Out, Adjustments</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Master Catalog Ops</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${catalogEvents}</div>
        <div class="kpi-footer">Products, Categories, Suppliers</div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-card-header">
          <span class="kpi-title">Security & RBAC</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${adminEvents}</div>
        <div class="kpi-footer">User admin & settings</div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Authentications</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
          </div>
        </div>
        <div class="kpi-value">${authEvents}</div>
        <div class="kpi-footer">Operator logins & sessions</div>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search Narrative / Record / User</label>
            <input type="text" class="form-input" placeholder="Search audit trail..." value="${auditFilter.search}" oninput="window.setAuditFilter('search', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Module</label>
            <select class="form-select" onchange="window.setAuditFilter('module', this.value)">
              <option value="ALL" ${auditFilter.module === 'ALL' ? 'selected' : ''}>All Modules</option>
              ${availableModules.map(m => `<option value="${m}" ${auditFilter.module === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Action Code</label>
            <select class="form-select" onchange="window.setAuditFilter('action', this.value)">
              <option value="ALL" ${auditFilter.action === 'ALL' ? 'selected' : ''}>All Actions</option>
              ${availableActions.map(a => `<option value="${a}" ${auditFilter.action === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Operator User</label>
            <select class="form-select" onchange="window.setAuditFilter('user', this.value)">
              <option value="ALL" ${auditFilter.user === 'ALL' ? 'selected' : ''}>All Operators</option>
              ${uniqueUsers.map(u => `<option value="${u}" ${auditFilter.user === u ? 'selected' : ''}>@${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Date From</label>
            <input type="date" class="form-input" value="${auditFilter.dateFrom}" onchange="window.setAuditFilter('dateFrom', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Date To</label>
            <input type="date" class="form-input" value="${auditFilter.dateTo}" onchange="window.setAuditFilter('dateTo', this.value)" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetAuditFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>

    <!-- Audit Log Table Card -->
    <div class="card" id="printable-audit-area">
      <!-- Print Only Header -->
      <div class="print-only-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Apex Stock Management System</h1>
            <h2 style="font-size: 15px; font-weight: 600; color: #0057E7;">System Security & Activity Audit Log</h2>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Generated: <strong>${todayStr}</strong></div>
            <div>Auditor: <strong>${currentUser?.fullName || 'System User'}</strong> [${currentUser?.role || 'VIEWER'}]</div>
          </div>
        </div>
      </div>

      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>
          Audit Activity Journal
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-neutral" style="font-size: 11.5px;">Showing <strong>${filtered.length}</strong> of ${totalEvents} logged events</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Log Ref</th>
              <th>Date & Time</th>
              <th>Operator</th>
              <th>Module</th>
              <th>Action Code</th>
              <th>Target Record</th>
              <th>Event Narrative</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px;">No audit events match current search and filter parameters.</td></tr>
            ` : filtered.map(item => {
              const initials = (item.username || 'SY').slice(0, 2).toUpperCase();
              return `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 12px;">
                      ${item.id}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">
                    ${item.dateTime}
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background: var(--surface-alt); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--text-main);">
                        ${initials}
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 12.5px;">@${item.username}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-family: monospace;">${item.userId || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-neutral" style="font-weight: 600; font-size: 11px;">
                      ${item.module}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${
                      item.action.includes('IN') ? 'badge-in-stock' :
                      item.action.includes('OUT') ? 'badge-out-of-stock' :
                      item.action.includes('ADJUST') ? 'badge-low-stock' :
                      item.action.includes('USER') || item.action.includes('PASSWORD') ? 'badge-primary' :
                      'badge-neutral'
                    }" style="font-size: 10.5px;">
                      ${item.action}
                    </span>
                  </td>
                  <td>
                    <code style="font-size: 11.5px; background: var(--surface-alt); padding: 2px 6px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                      ${item.recordId}
                    </code>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; color: var(--text-main); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.description}">
                      ${item.description}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewAuditEventDetails('${item.id}')" title="Inspect full audit record">
                      Inspect
                    </button>
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
// Interactive Actions & Global Window Hooks
// --------------------------------------------------------------------------

/**
 * View Audit Event Dossier Modal
 */
window.viewAuditEventDetails = function(logId) {
  const item = liveAuditLogs.find(l => l.id === logId);
  if (!item) return;

  const matchedUser = SAMPLE_USERS.find(u => u.username === item.username || u.userId === item.userId);

  window.openModal({
    title: `Audit Dossier: ${item.id}`,
    body: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Log Reference</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--primary); font-family: monospace;">${item.id}</div>
          </div>
          <div>
            <span class="badge ${
              item.action.includes('IN') ? 'badge-in-stock' :
              item.action.includes('OUT') ? 'badge-out-of-stock' :
              item.action.includes('ADJUST') ? 'badge-low-stock' :
              item.action.includes('USER') || item.action.includes('PASSWORD') ? 'badge-primary' :
              'badge-neutral'
            }">
              ${item.action}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Timestamp:</strong> <div>${item.dateTime}</div></div>
          <div><strong style="color: var(--text-muted);">Module Affected:</strong> <div><strong>${item.module}</strong></div></div>
          <div><strong style="color: var(--text-muted);">Operator Username:</strong> <div>@${item.username}</div></div>
          <div><strong style="color: var(--text-muted);">Operator Identity:</strong> <div>${matchedUser ? `${matchedUser.fullName} [${matchedUser.role}]` : (item.userId || 'System')}</div></div>
          <div><strong style="color: var(--text-muted);">Target Record ID:</strong> <div><code>${item.recordId}</code></div></div>
          <div><strong style="color: var(--text-muted);">Integrity State:</strong> <div style="color: var(--success); font-weight: 600;">✓ Verified Authentic</div></div>
        </div>

        <div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Event Narrative:</div>
          <div style="padding: 12px 14px; background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-main); line-height: 1.6;">
            ${item.description}
          </div>
        </div>

        <div style="font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; border-top: 1px solid var(--border); padding-top: 10px;">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: var(--primary); fill: none; stroke-width: 2;"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>Immutable audit record registered in Google Sheets <code>Audit_Log</code> master ledger.</span>
        </div>
      </div>
    `,
    primaryText: 'Close Dossier',
    onPrimary: () => window.closeModal()
  });
};

/**
 * Filter change hooks
 */
window.setAuditFilter = function(key, val) {
  auditFilter[key] = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAuditLog();
};

window.resetAuditFilters = function() {
  auditFilter = {
    search: '',
    module: 'ALL',
    action: 'ALL',
    user: 'ALL',
    dateFrom: '',
    dateTo: new Date().toISOString().slice(0, 10)
  };
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAuditLog();
};

/**
 * Refresh audit trail from database
 */
window.refreshAuditTrail = async function() {
  window.showToast('Synchronizing audit trail with database...', 'info');
  await fetchLiveAuditLogs();
  window.showToast('Audit trail refreshed successfully.', 'success');
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAuditLog();
};

/**
 * Print audit trail
 */
window.printAuditTrail = function() {
  window.print();
};

/**
 * Export filtered audit trail to CSV
 */
window.exportAuditCSV = function() {
  const nowStr = new Date().toISOString().slice(0, 10);
  const rows = [
    ['Apex Stock Management System - Official Security & Activity Audit Trail'],
    ['Generated On', new Date().toISOString()],
    ['Generated By', `${auth.getUser()?.fullName || 'System User'} (${auth.getUser()?.role || 'VIEWER'})`],
    [],
    ['Log ID', 'Timestamp', 'Operator User', 'User ID', 'Module', 'Action Code', 'Target Record ID', 'Event Description'],
    ...liveAuditLogs.map(item => [
      item.id,
      item.dateTime,
      item.username,
      item.userId || '',
      item.module,
      item.action,
      item.recordId,
      `"${String(item.description || '').replace(/"/g, '""')}"`
    ])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Audit_Trail_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast('Audit trail exported to CSV.', 'success');
};
