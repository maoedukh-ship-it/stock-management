import { SAMPLE_LOCATIONS, SAMPLE_PRODUCTS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let locationFilter = {
  search: '',
  type: 'ALL',
  status: 'ALL'
};

export function renderLocations() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');

  // Compute live stock metrics per location
  const locationStats = {};
  SAMPLE_PRODUCTS.forEach(p => {
    if (p.status !== 'ARCHIVED' && p.location) {
      if (!locationStats[p.location]) {
        locationStats[p.location] = { count: 0, totalUnits: 0, totalValue: 0, products: [] };
      }
      locationStats[p.location].count += 1;
      locationStats[p.location].totalUnits += (p.currentStock || 0);
      locationStats[p.location].totalValue += ((p.costPrice || 0) * (p.currentStock || 0));
      locationStats[p.location].products.push(p);
    }
  });

  // Calculate High-level KPIs
  const totalLocations = SAMPLE_LOCATIONS.length;
  const activeLocations = SAMPLE_LOCATIONS.filter(l => l.status === 'ACTIVE').length;
  const totalUnitsStored = Object.values(locationStats).reduce((acc, l) => acc + l.totalUnits, 0);
  const totalValuationStored = Object.values(locationStats).reduce((acc, l) => acc + l.totalValue, 0);

  // Filter locations
  const filtered = SAMPLE_LOCATIONS.filter(loc => {
    const term = locationFilter.search.toLowerCase();
    const matchesSearch = !term ||
      loc.name.toLowerCase().includes(term) ||
      loc.id.toLowerCase().includes(term) ||
      (loc.type && loc.type.toLowerCase().includes(term)) ||
      (loc.manager && loc.manager.toLowerCase().includes(term)) ||
      (loc.address && loc.address.toLowerCase().includes(term));

    const matchesType = locationFilter.type === 'ALL' || loc.type === locationFilter.type;
    const matchesStatus = locationFilter.status === 'ALL' || loc.status === locationFilter.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Storage Locations & Warehouses</h1>
        <p>Manage central distribution depots, fulfillment hubs, retail store stock rooms, and regional facilities.</p>
      </div>
      <div class="page-actions">
        ${canManage ? `
          <button class="btn btn-primary btn-sm" onclick="window.openAddLocationModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Location
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Location KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Facilities</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalLocations}</div>
        <div class="kpi-footer">Registered warehouses & outlets</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Depots</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${activeLocations}</div>
        <div class="kpi-footer">Operational storage destinations</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Stored</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalUnitsStored.toLocaleString()}</div>
        <div class="kpi-footer">Physical items across all nodes</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Holding Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${totalValuationStored.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="kpi-footer">Cumulative at-cost valuation</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search location by name, manager, or address..." 
              value="${locationFilter.search}" 
              oninput="window.handleLocationSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleLocationTypeFilter(this.value)">
            <option value="ALL" ${locationFilter.type === 'ALL' ? 'selected' : ''}>All Types</option>
            <option value="Central Storage" ${locationFilter.type === 'Central Storage' ? 'selected' : ''}>Central Storage</option>
            <option value="Corporate Store" ${locationFilter.type === 'Corporate Store' ? 'selected' : ''}>Corporate Store</option>
            <option value="Retail Outlet" ${locationFilter.type === 'Retail Outlet' ? 'selected' : ''}>Retail Outlet</option>
            <option value="Fulfillment Hub" ${locationFilter.type === 'Fulfillment Hub' ? 'selected' : ''}>Fulfillment Hub</option>
            <option value="Quarantine / QC Bay" ${locationFilter.type === 'Quarantine / QC Bay' ? 'selected' : ''}>Quarantine / QC Bay</option>
          </select>

          <select class="select-filter" onchange="window.handleLocationStatusFilter(this.value)">
            <option value="ALL" ${locationFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="ACTIVE" ${locationFilter.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${locationFilter.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> of ${SAMPLE_LOCATIONS.length} facilities
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Facility Name</th>
              <th>Type</th>
              <th>Address / Premises</th>
              <th>Facility Manager</th>
              <th style="text-align: right;">Inventory Held</th>
              <th style="text-align: right;">Holding Value</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching locations found</div>
                    <div class="empty-state-desc">Try clearing search filters or add a new facility.</div>
                  </div>
                </td>
              </tr>
            ` : filtered.map(loc => {
              const stats = locationStats[loc.name] || { count: 0, totalUnits: 0, totalValue: 0 };
              return `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${loc.name}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${loc.id}</div>
                  </td>
                  <td>
                    <span class="badge badge-neutral" style="font-weight: 600;">
                      ${loc.type}
                    </span>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${loc.address || ''}">
                    ${loc.address || '<span style="color: var(--text-light);">No address specified</span>'}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${loc.manager}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Site Supervisor</div>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewLocationProducts('${loc.name}')" title="Filter catalog by ${loc.name}">
                      <strong>${stats.count}</strong> SKUs <span style="color: var(--text-muted);">(${stats.totalUnits} pcs)</span>
                    </button>
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--primary);">
                    $${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${loc.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}">
                      ${loc.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Location Profile & Stock" onclick="window.viewLocationDetails('${loc.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </button>

                      ${canManage ? `
                        <button class="btn btn-secondary btn-sm" title="Edit Location" onclick="window.openEditLocationModal('${loc.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleLocationStatus('${loc.id}')">
                          ${loc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
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
// Location Filters & Navigation Handlers
// --------------------------------------------------------------------------
window.handleLocationSearch = function(val) {
  locationFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};

window.handleLocationTypeFilter = function(val) {
  locationFilter.type = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};

window.handleLocationStatusFilter = function(val) {
  locationFilter.status = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};

window.viewLocationProducts = function(locName) {
  window.router.navigate('inventory');
  setTimeout(() => {
    window.handleInventoryFilter('location', locName);
  }, 50);
};

// --------------------------------------------------------------------------
// View Location Details Modal
// --------------------------------------------------------------------------
window.viewLocationDetails = function(id) {
  const loc = SAMPLE_LOCATIONS.find(l => l.id === id);
  if (!loc) return;

  const storedProducts = SAMPLE_PRODUCTS.filter(p => p.location === loc.name || p.locationId === loc.id);
  const totalStockUnits = storedProducts.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalStockValue = storedProducts.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0);

  window.openModal({
    title: `Facility Dossier: ${loc.name}`,
    body: `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 87, 231, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">
            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2;"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${loc.name}</h3>
            <div style="font-family: monospace; font-size: 12px; color: var(--text-light);">${loc.id} | ${loc.type}</div>
          </div>
        </div>
        <span class="badge ${loc.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}" style="font-size: 12px; padding: 4px 10px;">
          ${loc.status}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: var(--bg-main); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Warehouse Manager</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">${loc.manager}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Facility Classification</div>
          <div style="font-size: 14px; color: var(--text-main); font-weight: 500;">${loc.type}</div>
        </div>
        <div style="grid-column: span 2;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Physical Address</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${loc.address || 'Not specified'}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main);">
          Stored Products Inventory (${storedProducts.length})
        </h4>
        <div style="font-size: 12px; color: var(--text-muted);">
          Total Stock: <strong>${totalStockUnits.toLocaleString()} units</strong> | Holding Value: <strong style="color: var(--primary);">$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
        <table class="data-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Stock Balance</th>
              <th style="text-align: right;">Total Value</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${storedProducts.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">
                  No products are currently assigned to this storage facility.
                </td>
              </tr>
            ` : storedProducts.map(p => `
              <tr>
                <td style="font-family: monospace; font-weight: 600; color: var(--primary);">${p.sku}</td>
                <td style="font-weight: 600;">${p.name}</td>
                <td><span class="badge badge-neutral" style="font-size: 11px;">${p.category}</span></td>
                <td style="text-align: right;">$${Number(p.costPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">${p.currentStock}</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">
                  $${(p.costPrice * p.currentStock).toFixed(2)}
                </td>
                <td style="text-align: center;">
                  <span class="badge ${p.stockStatus === 'IN STOCK' ? 'badge-in-stock' : (p.stockStatus === 'LOW STOCK' ? 'badge-low-stock' : 'badge-out-of-stock')}" style="font-size: 10px;">
                    ${p.stockStatus}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `,
    primaryText: 'Close',
    onPrimary: () => window.closeModal()
  });
};

// --------------------------------------------------------------------------
// Add Location Modal
// --------------------------------------------------------------------------
window.openAddLocationModal = function() {
  window.openModal({
    title: 'Register New Storage Location',
    body: `
      <form id="add-location-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewLocation();">
        <div class="form-group col-span-2">
          <label class="form-label">Location / Warehouse Name <span class="required-star">*</span></label>
          <input type="text" id="loc-new-name" class="form-input" placeholder="e.g. Distribution Center South" required />
          <div class="form-hint">Must be unique across facility network</div>
        </div>

        <div class="form-group">
          <label class="form-label">Facility Classification <span class="required-star">*</span></label>
          <select id="loc-new-type" class="form-select">
            <option value="Central Storage">Central Storage</option>
            <option value="Corporate Store">Corporate Store</option>
            <option value="Retail Outlet">Retail Outlet</option>
            <option value="Fulfillment Hub">Fulfillment Hub</option>
            <option value="Quarantine / QC Bay">Quarantine / QC Bay</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Site Manager <span class="required-star">*</span></label>
          <input type="text" id="loc-new-mgr" class="form-input" placeholder="Manager in Charge" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address / Gate Location <span class="required-star">*</span></label>
          <input type="text" id="loc-new-address" class="form-input" placeholder="Plot / Building / Street / City" required />
        </div>
      </form>
    `,
    primaryText: 'Save Location',
    onPrimary: () => window.submitNewLocation()
  });
};

window.submitNewLocation = async function() {
  const name = document.getElementById('loc-new-name')?.value.trim();
  const type = document.getElementById('loc-new-type')?.value;
  const mgr = document.getElementById('loc-new-mgr')?.value.trim();
  const address = document.getElementById('loc-new-address')?.value.trim();

  if (!name || !mgr || !address) {
    window.showToast('Please fill all mandatory location fields.', 'error');
    return;
  }

  // Check duplicate location name
  if (SAMPLE_LOCATIONS.some(l => l.name.toLowerCase() === name.toLowerCase())) {
    window.showToast(`Error: Location "${name}" already exists.`, 'error');
    return;
  }

  const newLoc = {
    id: `LOC-${Math.floor(100 + Math.random() * 900)}`,
    name,
    type,
    address,
    manager: mgr,
    status: 'ACTIVE'
  };

  // Sync with live Google Apps Script API
  if (api.isConfigured()) {
    try {
      window.showToast('Registering facility in Google Sheets...', 'info');
      await api.request('createLocation', {
        method: 'POST',
        data: newLoc,
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API createLocation failed:', e);
    }
  }

  SAMPLE_LOCATIONS.push(newLoc);

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'CREATE_LOCATION',
    module: 'Locations',
    recordId: newLoc.id,
    description: `Added facility "${name}" (${type}, Manager: ${mgr})`
  });

  window.closeModal();
  window.showToast(`Storage location "${name}" registered successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};

// --------------------------------------------------------------------------
// Edit Location Modal
// --------------------------------------------------------------------------
window.openEditLocationModal = function(id) {
  const loc = SAMPLE_LOCATIONS.find(l => l.id === id);
  if (!loc) return;

  window.openModal({
    title: `Edit Facility: ${loc.name}`,
    body: `
      <form id="edit-location-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditLocation('${loc.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Location / Warehouse Name <span class="required-star">*</span></label>
          <input type="text" id="loc-edit-name" class="form-input" value="${loc.name}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Facility Classification <span class="required-star">*</span></label>
          <select id="loc-edit-type" class="form-select">
            <option value="Central Storage" ${loc.type === 'Central Storage' ? 'selected' : ''}>Central Storage</option>
            <option value="Corporate Store" ${loc.type === 'Corporate Store' ? 'selected' : ''}>Corporate Store</option>
            <option value="Retail Outlet" ${loc.type === 'Retail Outlet' ? 'selected' : ''}>Retail Outlet</option>
            <option value="Fulfillment Hub" ${loc.type === 'Fulfillment Hub' ? 'selected' : ''}>Fulfillment Hub</option>
            <option value="Quarantine / QC Bay" ${loc.type === 'Quarantine / QC Bay' ? 'selected' : ''}>Quarantine / QC Bay</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Site Manager <span class="required-star">*</span></label>
          <input type="text" id="loc-edit-mgr" class="form-input" value="${loc.manager}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address</label>
          <input type="text" id="loc-edit-address" class="form-input" value="${loc.address || ''}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Operational Status</label>
          <select id="loc-edit-status" class="form-select">
            <option value="ACTIVE" ${loc.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
            <option value="INACTIVE" ${loc.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,
    primaryText: 'Update Location',
    onPrimary: () => window.submitEditLocation(loc.id)
  });
};

window.submitEditLocation = async function(id) {
  const loc = SAMPLE_LOCATIONS.find(l => l.id === id);
  if (!loc) return;

  const newName = document.getElementById('loc-edit-name')?.value.trim();
  const newType = document.getElementById('loc-edit-type')?.value;
  const newMgr = document.getElementById('loc-edit-mgr')?.value.trim();
  const newAddress = document.getElementById('loc-edit-address')?.value.trim();
  const newStatus = document.getElementById('loc-edit-status')?.value;

  if (!newName || !newMgr || !newAddress) {
    window.showToast('Please fill all mandatory fields.', 'error');
    return;
  }

  // Duplicate name check
  if (SAMPLE_LOCATIONS.some(l => l.id !== id && l.name.toLowerCase() === newName.toLowerCase())) {
    window.showToast(`Error: Another location is already named "${newName}".`, 'error');
    return;
  }

  const oldName = loc.name;
  loc.name = newName;
  loc.type = newType;
  loc.manager = newMgr;
  loc.address = newAddress;
  loc.status = newStatus;

  // Propagate name change to associated products
  if (oldName !== newName) {
    SAMPLE_PRODUCTS.forEach(p => {
      if (p.location === oldName || p.locationId === id) {
        p.location = newName;
      }
    });
  }

  // Live API call
  if (api.isConfigured()) {
    try {
      await api.request('updateLocation', {
        method: 'POST',
        data: { id, name: newName, type: newType, manager: newMgr, address: newAddress, status: newStatus },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API updateLocation failed:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'UPDATE_LOCATION',
    module: 'Locations',
    recordId: id,
    description: `Updated facility profile "${oldName}" -> "${newName}"`
  });

  window.closeModal();
  window.showToast(`Facility "${newName}" updated successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};

// --------------------------------------------------------------------------
// Toggle Location Status Action
// --------------------------------------------------------------------------
window.toggleLocationStatus = async function(id) {
  const loc = SAMPLE_LOCATIONS.find(l => l.id === id);
  if (!loc) return;

  const newStatus = loc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  if (newStatus === 'INACTIVE') {
    const storedItems = SAMPLE_PRODUCTS.filter(p => (p.location === loc.name || p.locationId === id) && p.currentStock > 0);
    if (storedItems.length > 0) {
      const confirmDeactivate = confirm(`Warning: "${loc.name}" currently holds physical stock for ${storedItems.length} items. Deactivating will prevent new stock-in or receipts into this facility. Do you wish to continue?`);
      if (!confirmDeactivate) return;
    }
  }

  loc.status = newStatus;

  if (api.isConfigured()) {
    try {
      await api.request('toggleLocationStatus', {
        method: 'POST',
        data: { id },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API toggleLocationStatus failed:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'TOGGLE_LOCATION_STATUS',
    module: 'Locations',
    recordId: id,
    description: `Changed facility "${loc.name}" status to ${newStatus}`
  });

  window.showToast(`Facility "${loc.name}" is now ${newStatus}.`, 'info');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderLocations();
};
