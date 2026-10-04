import { SAMPLE_SUPPLIERS, SAMPLE_PRODUCTS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let supplierFilter = {
  search: '',
  status: 'ALL'
};

export function renderSuppliers() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');

  // Compute live product counts and valuation per supplier
  const supplierStats = {};
  SAMPLE_PRODUCTS.forEach(p => {
    if (p.status !== 'ARCHIVED' && p.supplier) {
      if (!supplierStats[p.supplier]) {
        supplierStats[p.supplier] = { count: 0, totalValue: 0, products: [] };
      }
      supplierStats[p.supplier].count += 1;
      supplierStats[p.supplier].totalValue += (p.costPrice * p.currentStock);
      supplierStats[p.supplier].products.push(p);
    }
  });

  // Calculate KPIs
  const totalSuppliers = SAMPLE_SUPPLIERS.length;
  const activeSuppliers = SAMPLE_SUPPLIERS.filter(s => s.status === 'ACTIVE').length;
  
  // Find top sourcing partner
  let topSupplierName = 'None';
  let topSupplierCount = 0;
  Object.keys(supplierStats).forEach(sName => {
    if (supplierStats[sName].count > topSupplierCount) {
      topSupplierCount = supplierStats[sName].count;
      topSupplierName = sName;
    }
  });

  const totalProductsSourced = Object.values(supplierStats).reduce((acc, s) => acc + s.count, 0);

  // Apply filters
  const filtered = SAMPLE_SUPPLIERS.filter(s => {
    const term = supplierFilter.search.toLowerCase();
    const matchesSearch = !term ||
      s.name.toLowerCase().includes(term) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.phone && s.phone.toLowerCase().includes(term)) ||
      (s.address && s.address.toLowerCase().includes(term)) ||
      (s.id && s.id.toLowerCase().includes(term));

    const matchesStatus = supplierFilter.status === 'ALL' || s.status === supplierFilter.status;
    return matchesSearch && matchesStatus;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Supplier & Vendor Directory</h1>
        <p>Maintain authorized procurement partners, contact channels, lead times, and fulfillment agreements.</p>
      </div>
      <div class="page-actions">
        ${canManage ? `
          <button class="btn btn-primary btn-sm" onclick="window.openAddSupplierModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Supplier
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Supplier KPI Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Registered Vendors</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalSuppliers}</div>
        <div class="kpi-footer">Approved procurement partners</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Suppliers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${activeSuppliers}</div>
        <div class="kpi-footer">Eligible for Purchase Orders & Stock In</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">SKUs Sourced</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalProductsSourced}</div>
        <div class="kpi-footer">Products with assigned vendor</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Top Sourcing Partner</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 18px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${topSupplierName}
        </div>
        <div class="kpi-footer">${topSupplierCount} catalog items supplied</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 300px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search vendor by name, contact, email, or city..." 
              value="${supplierFilter.search}" 
              oninput="window.handleSupplierSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleSupplierStatusFilter(this.value)">
            <option value="ALL" ${supplierFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="ACTIVE" ${supplierFilter.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${supplierFilter.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> of ${SAMPLE_SUPPLIERS.length} suppliers
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Supplier / Company</th>
              <th>Primary Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Physical Address</th>
              <th style="text-align: right;">Sourced Items</th>
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
                    <div class="empty-state-title">No matching suppliers found</div>
                    <div class="empty-state-desc">Try clearing your search query or add a new vendor.</div>
                  </div>
                </td>
              </tr>
            ` : filtered.map(s => {
              const stats = supplierStats[s.name] || { count: 0, totalValue: 0 };
              const initial = (s.name || 'S').charAt(0).toUpperCase();

              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 34px; height: 34px; border-radius: 6px; background: rgba(0, 87, 231, 0.08); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">
                        ${initial}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${s.name}</div>
                        <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${s.contactPerson || 'N/A'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Account Rep</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${s.phone ? `
                      <a href="tel:${s.phone}" style="color: var(--text-main); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: var(--text-light); fill: none;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                        ${s.phone}
                      </a>
                    ` : '<span style="color: var(--text-light);">-</span>'}
                  </td>
                  <td style="font-size: 13px;">
                    ${s.email ? `
                      <a href="mailto:${s.email}" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 500;">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: currentColor; fill: none;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                        ${s.email}
                      </a>
                    ` : '<span style="color: var(--text-light);">-</span>'}
                  </td>
                  <td style="font-size: 12px; color: var(--text-secondary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${s.address || ''}">
                    ${s.address || '<span style="color: var(--text-light);">No address specified</span>'}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewSupplierProducts('${s.name}')" title="Filter catalog by ${s.name}">
                      <strong>${stats.count}</strong> items
                    </button>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${s.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}">
                      ${s.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Supplier Profile & Catalog" onclick="window.viewSupplierDetails('${s.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </button>

                      ${canManage ? `
                        <button class="btn btn-secondary btn-sm" title="Edit Supplier" onclick="window.openEditSupplierModal('${s.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleSupplierStatus('${s.id}')">
                          ${s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
// Supplier Filter & Navigation Handlers
// --------------------------------------------------------------------------
window.handleSupplierSearch = function(val) {
  supplierFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSuppliers();
};

window.handleSupplierStatusFilter = function(val) {
  supplierFilter.status = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSuppliers();
};

window.viewSupplierProducts = function(supplierName) {
  window.router.navigate('inventory');
  setTimeout(() => {
    window.handleInventorySearch(supplierName);
  }, 50);
};

// --------------------------------------------------------------------------
// View Supplier Details Modal
// --------------------------------------------------------------------------
window.viewSupplierDetails = function(id) {
  const s = SAMPLE_SUPPLIERS.find(item => item.id === id);
  if (!s) return;

  const suppliedItems = SAMPLE_PRODUCTS.filter(p => p.supplier === s.name || p.supplierId === s.id);
  const totalValuation = suppliedItems.reduce((acc, p) => acc + (p.costPrice * p.currentStock), 0);
  const totalUnits = suppliedItems.reduce((acc, p) => acc + p.currentStock, 0);

  window.openModal({
    title: `Supplier Profile: ${s.name}`,
    body: `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 87, 231, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${(s.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${s.name}</h3>
            <div style="font-family: monospace; font-size: 12px; color: var(--text-light);">${s.id}</div>
          </div>
        </div>
        <span class="badge ${s.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}" style="font-size: 12px; padding: 4px 10px;">
          ${s.status}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: var(--bg-main); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Contact Person</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">${s.contactPerson || 'Not specified'}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Phone Number</div>
          <div style="font-size: 14px; color: var(--text-main);">${s.phone || 'Not provided'}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Email Address</div>
          <div style="font-size: 14px; color: var(--primary); font-weight: 500;">
            ${s.email ? `<a href="mailto:${s.email}" style="color: var(--primary);">${s.email}</a>` : 'Not provided'}
          </div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Physical Facility / Address</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${s.address || 'Not provided'}</div>
        </div>
        <div style="grid-column: span 2;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Payment Terms & Notes</div>
          <div style="font-size: 13px; color: var(--text-secondary);">${s.notes || 'Standard procurement agreement (Net 30).'}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main);">
          Supplied Catalog Products (${suppliedItems.length})
        </h4>
        <div style="font-size: 12px; color: var(--text-muted);">
          Total Stock: <strong>${totalUnits.toLocaleString()} units</strong> | Holding Value: <strong style="color: var(--primary);">$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
        <table class="data-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th style="text-align: right;">Cost Price</th>
              <th style="text-align: right;">Stock</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${suppliedItems.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                  No catalog products are currently assigned to this vendor.
                </td>
              </tr>
            ` : suppliedItems.map(p => `
              <tr>
                <td style="font-family: monospace; font-weight: 600; color: var(--primary);">${p.sku}</td>
                <td style="font-weight: 600;">${p.name}</td>
                <td><span class="badge badge-neutral" style="font-size: 11px;">${p.category}</span></td>
                <td style="text-align: right;">$${Number(p.costPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">${p.currentStock}</td>
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
// Add Supplier Modal
// --------------------------------------------------------------------------
window.openAddSupplierModal = function() {
  window.openModal({
    title: 'Register New Vendor / Supplier',
    body: `
      <form id="add-supplier-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewSupplier();">
        <div class="form-group col-span-2">
          <label class="form-label">Company / Supplier Name <span class="required-star">*</span></label>
          <input type="text" id="sup-new-name" class="form-input" placeholder="e.g. Apex Industrial Supplies" required />
          <div class="form-hint">Must be unique across authorized vendor directory</div>
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person <span class="required-star">*</span></label>
          <input type="text" id="sup-new-contact" class="form-input" placeholder="Representative full name" required />
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number <span class="required-star">*</span></label>
          <input type="tel" id="sup-new-phone" class="form-input" placeholder="+1 (555) 000-0000" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Email Address <span class="required-star">*</span></label>
          <input type="email" id="sup-new-email" class="form-input" placeholder="procurement@supplier.com" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address / Logistics Depot</label>
          <input type="text" id="sup-new-address" class="form-input" placeholder="Street, Building, City, State, ZIP" />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Procurement Terms & Notes</label>
          <textarea id="sup-new-notes" class="form-textarea" rows="2" placeholder="e.g. Net 30 payment terms, 5-day delivery lead time, MOQ: 50 units"></textarea>
        </div>
      </form>
    `,
    primaryText: 'Save Supplier',
    onPrimary: () => window.submitNewSupplier()
  });
};

window.submitNewSupplier = async function() {
  const name = document.getElementById('sup-new-name')?.value.trim();
  const contact = document.getElementById('sup-new-contact')?.value.trim();
  const phone = document.getElementById('sup-new-phone')?.value.trim();
  const email = document.getElementById('sup-new-email')?.value.trim();
  const address = document.getElementById('sup-new-address')?.value.trim() || 'Not specified';
  const notes = document.getElementById('sup-new-notes')?.value.trim() || 'Standard Net 30 procurement terms.';

  if (!name || !contact || !phone || !email) {
    window.showToast('Please fill in all mandatory supplier fields.', 'error');
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    window.showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Check duplicate supplier name
  if (SAMPLE_SUPPLIERS.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    window.showToast(`Error: Supplier "${name}" is already registered.`, 'error');
    return;
  }

  const newSupplier = {
    id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
    name,
    contactPerson: contact,
    phone,
    email,
    address,
    notes,
    status: 'ACTIVE'
  };

  // Sync with live Google Apps Script API if configured
  if (api.isConfigured()) {
    try {
      window.showToast('Registering supplier in Google Sheets...', 'info');
      await api.request('createSupplier', {
        method: 'POST',
        data: newSupplier,
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API supplier registration failed, keeping in local memory:', e);
    }
  }

  SAMPLE_SUPPLIERS.push(newSupplier);

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'CREATE_SUPPLIER',
    module: 'Suppliers',
    recordId: newSupplier.id,
    description: `Registered new supplier "${name}" (${contact})`
  });

  window.closeModal();
  window.showToast(`Supplier "${name}" registered successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSuppliers();
};

// --------------------------------------------------------------------------
// Edit Supplier Modal
// --------------------------------------------------------------------------
window.openEditSupplierModal = function(id) {
  const s = SAMPLE_SUPPLIERS.find(item => item.id === id);
  if (!s) return;

  window.openModal({
    title: `Edit Supplier: ${s.name}`,
    body: `
      <form id="edit-supplier-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditSupplier('${s.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Supplier / Company Name <span class="required-star">*</span></label>
          <input type="text" id="sup-edit-name" class="form-input" value="${s.name}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person <span class="required-star">*</span></label>
          <input type="text" id="sup-edit-contact" class="form-input" value="${s.contactPerson || ''}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number <span class="required-star">*</span></label>
          <input type="tel" id="sup-edit-phone" class="form-input" value="${s.phone || ''}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Email Address <span class="required-star">*</span></label>
          <input type="email" id="sup-edit-email" class="form-input" value="${s.email || ''}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address</label>
          <input type="text" id="sup-edit-address" class="form-input" value="${s.address || ''}" />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Payment Terms & Notes</label>
          <textarea id="sup-edit-notes" class="form-textarea" rows="2">${s.notes || ''}</textarea>
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Status</label>
          <select id="sup-edit-status" class="form-select">
            <option value="ACTIVE" ${s.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
            <option value="INACTIVE" ${s.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,
    primaryText: 'Update Supplier',
    onPrimary: () => window.submitEditSupplier(s.id)
  });
};

window.submitEditSupplier = async function(id) {
  const s = SAMPLE_SUPPLIERS.find(item => item.id === id);
  if (!s) return;

  const newName = document.getElementById('sup-edit-name')?.value.trim();
  const newContact = document.getElementById('sup-edit-contact')?.value.trim();
  const newPhone = document.getElementById('sup-edit-phone')?.value.trim();
  const newEmail = document.getElementById('sup-edit-email')?.value.trim();
  const newAddress = document.getElementById('sup-edit-address')?.value.trim();
  const newNotes = document.getElementById('sup-edit-notes')?.value.trim();
  const newStatus = document.getElementById('sup-edit-status')?.value;

  if (!newName || !newContact || !newPhone || !newEmail) {
    window.showToast('Please fill all mandatory fields.', 'error');
    return;
  }

  // Duplicate name check against other suppliers
  if (SAMPLE_SUPPLIERS.some(item => item.id !== id && item.name.toLowerCase() === newName.toLowerCase())) {
    window.showToast(`Error: Another supplier is already named "${newName}".`, 'error');
    return;
  }

  const oldName = s.name;
  s.name = newName;
  s.contactPerson = newContact;
  s.phone = newPhone;
  s.email = newEmail;
  s.address = newAddress;
  s.notes = newNotes;
  s.status = newStatus;

  // Propagate name change to associated products
  if (oldName !== newName) {
    SAMPLE_PRODUCTS.forEach(p => {
      if (p.supplier === oldName || p.supplierId === id) {
        p.supplier = newName;
      }
    });
  }

  // Live API call
  if (api.isConfigured()) {
    try {
      await api.request('updateSupplier', {
        method: 'POST',
        data: { id, name: newName, contactPerson: newContact, phone: newPhone, email: newEmail, address: newAddress, notes: newNotes, status: newStatus },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API updateSupplier failed:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'UPDATE_SUPPLIER',
    module: 'Suppliers',
    recordId: id,
    description: `Updated supplier profile "${oldName}" -> "${newName}"`
  });

  window.closeModal();
  window.showToast(`Supplier "${newName}" updated successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSuppliers();
};

// --------------------------------------------------------------------------
// Toggle Status Action
// --------------------------------------------------------------------------
window.toggleSupplierStatus = async function(id) {
  const s = SAMPLE_SUPPLIERS.find(item => item.id === id);
  if (!s) return;

  const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  
  // Warning if deactivating a supplier with active items
  if (newStatus === 'INACTIVE') {
    const activeItems = SAMPLE_PRODUCTS.filter(p => p.supplier === s.name && p.status !== 'ARCHIVED');
    if (activeItems.length > 0) {
      const confirmDeactivate = confirm(`Warning: "${s.name}" currently supplies ${activeItems.length} active catalog items. Deactivating will prevent new purchase receipts from this supplier. Do you wish to continue?`);
      if (!confirmDeactivate) return;
    }
  }

  s.status = newStatus;

  if (api.isConfigured()) {
    try {
      await api.request('toggleSupplierStatus', {
        method: 'POST',
        data: { id },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API toggleSupplierStatus failed:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'TOGGLE_SUPPLIER_STATUS',
    module: 'Suppliers',
    recordId: id,
    description: `Changed supplier "${s.name}" status to ${newStatus}`
  });

  window.showToast(`Supplier "${s.name}" is now ${newStatus}.`, 'info');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderSuppliers();
};
