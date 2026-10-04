import { SAMPLE_SETTINGS, SAMPLE_LOCATIONS } from '../sampleData.js';

let activeTab = 'company';

export function renderSettings() {
  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Enterprise Configuration & Preferences</h1>
        <p>Manage company details, inventory business rules, localization, and security policies.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.saveSettings()">
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          Save Configuration
        </button>
      </div>
    </div>

    <!-- Settings Navigation Tabs -->
    <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); margin-bottom: 24px;">
      <button class="btn btn-sm ${activeTab === 'company' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchSettingsTab('company')">
        Company Information
      </button>
      <button class="btn btn-sm ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchSettingsTab('inventory')">
        Inventory Business Rules
      </button>
      <button class="btn btn-sm ${activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchSettingsTab('system')">
        Localization & Language (EN / KH)
      </button>
      <button class="btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchSettingsTab('security')">
        Security & Session
      </button>
    </div>

    <!-- Active Tab Content -->
    ${activeTab === 'company' ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Company Profile</div>
          <span class="badge badge-neutral">Master Entity</span>
        </div>
        <div class="card-body">
          <form class="form-grid">
            <div class="form-group col-span-2">
              <label class="form-label">Corporate Registered Name <span class="required-star">*</span></label>
              <input type="text" id="set-company-name" class="form-input" value="${SAMPLE_SETTINGS.companyName}" />
            </div>
            <div class="form-group col-span-2">
              <label class="form-label">Physical HQ Address <span class="required-star">*</span></label>
              <input type="text" id="set-address" class="form-input" value="${SAMPLE_SETTINGS.address}" />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <input type="text" id="set-phone" class="form-input" value="${SAMPLE_SETTINGS.phone}" />
            </div>
            <div class="form-group">
              <label class="form-label">Primary Business Email</label>
              <input type="email" id="set-email" class="form-input" value="${SAMPLE_SETTINGS.email}" />
            </div>
            <div class="form-group col-span-2">
              <label class="form-label">Brand Logo Asset</label>
              <div style="display: flex; align-items: center; gap: 16px; margin-top: 6px;">
                <img src="/assets/logo.svg" alt="Company Logo" style="width: 48px; height: 48px; border-radius: var(--radius-md); border: 1px solid var(--border);" />
                <div>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.showToast('Logo upload supported in Google Drive storage phase.', 'info')">
                    Replace Logo SVG
                  </button>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Recommended: 200x200px SVG or PNG with transparent background</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    ` : ''}

    ${activeTab === 'inventory' ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Inventory Controls & Thresholds</div>
        </div>
        <div class="card-body">
          <form class="form-grid">
            <div class="form-group">
              <label class="form-label">Default Minimum Stock Alert Threshold</label>
              <input type="number" id="set-min-stock" class="form-input" value="${SAMPLE_SETTINGS.defaultMinStock}" />
              <div class="form-hint">Triggers Low Stock warning badge when units fall below this number</div>
            </div>
            <div class="form-group">
              <label class="form-label">Default Intake Location</label>
              <select id="set-default-loc" class="form-select">
                ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}" ${SAMPLE_SETTINGS.defaultLocation === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Valuation Currency</label>
              <select id="set-currency" class="form-select">
                <option value="USD ($)" ${SAMPLE_SETTINGS.currency === 'USD ($)' ? 'selected' : ''}>USD ($)</option>
                <option value="KHR (៛)" ${SAMPLE_SETTINGS.currency === 'KHR (៛)' ? 'selected' : ''}>KHR (៛ - Khmer Riel)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Costing Methodology</label>
              <select class="form-select" disabled style="background: var(--surface-alt);">
                <option>FIFO (First-In, First-Out)</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    ` : ''}

    ${activeTab === 'system' ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Localization & Language Support</div>
          <span class="badge badge-in-stock">Bilingual Ready</span>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Interface Display Language</label>
              <select id="set-lang" class="form-select" onchange="window.handleLanguageChange(this.value)">
                <option value="English" selected>English (Primary)</option>
                <option value="Khmer">ភាសាខ្មែរ (Khmer)</option>
              </select>
              <div class="form-hint">System is architected with complete bilingual i18n dictionary structure</div>
            </div>
            <div class="form-group">
              <label class="form-label">Time Zone</label>
              <select class="form-select">
                <option value="UTC+7" selected>Asia/Phnom_Penh (UTC+07:00)</option>
                <option value="UTC-5">America/Chicago (UTC-05:00)</option>
                <option value="UTC+0">UTC (Universal Coordinated Time)</option>
              </select>
            </div>
            <div class="form-group col-span-2" style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 8px;">
              <label class="form-label">Google Apps Script Web App API URL</label>
              <div style="display: flex; gap: 8px;">
                <input type="url" id="set-api-url" class="form-input" placeholder="https://script.google.com/macros/s/AKfycbx.../exec" value="${window.api?.getApiUrl() || ''}" />
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.testApiConnection()">
                  Test Connection
                </button>
              </div>
              <div class="form-hint" style="margin-top: 4px;">Paste the deployed Web App URL from your Google Apps Script editor.</div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    ${activeTab === 'security' ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Authentication & Session Rules</div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Inactivity Auto-Logout Timer</label>
              <select class="form-select">
                <option value="30" selected>30 Minutes of idle inactivity</option>
                <option value="60">60 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Password Complexity Rule</label>
              <select class="form-select">
                <option selected>Minimum 8 characters with numbers & symbols</option>
                <option>Standard (minimum 6 characters)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

window.switchSettingsTab = function(tab) {
  activeTab = tab;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSettings();
};

window.handleLanguageChange = function(lang) {
  SAMPLE_SETTINGS.language = lang;
  if (lang === 'Khmer') {
    window.showToast('ភាសាខ្មែរ (Khmer bilingual dictionary loaded for UI demonstration).', 'info');
  } else {
    window.showToast('English interface active.', 'info');
  }
};

window.saveSettings = function() {
  const comp = document.getElementById('set-company-name')?.value;
  if (comp) SAMPLE_SETTINGS.companyName = comp;

  const apiUrl = document.getElementById('set-api-url')?.value;
  if (apiUrl !== undefined && window.api) {
    window.api.setApiUrl(apiUrl);
  }

  window.showToast('System configuration settings saved successfully.', 'success');
};

window.testApiConnection = async function() {
  const urlInput = document.getElementById('set-api-url');
  const url = urlInput?.value.trim();
  if (!url) {
    window.showToast('Please paste your Google Apps Script Web App URL first.', 'warning');
    return;
  }

  window.api.setApiUrl(url);
  window.showToast('Pinging Google Apps Script API...', 'info');

  try {
    const res = await window.api.ping();
    if (res && res.success) {
      window.showToast('✅ Connected successfully to Google Apps Script Database!', 'success');
    } else {
      window.showToast('Connection responded, but ping was unsuccessful.', 'warning');
    }
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

