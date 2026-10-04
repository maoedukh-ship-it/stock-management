import { SAMPLE_PRODUCTS, SAMPLE_SUPPLIERS, SAMPLE_LOCATIONS, SAMPLE_TRANSACTIONS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let stockInFilter = {
  search: '',
  location: 'ALL',
  supplier: 'ALL'
};

export function renderStockIn() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');
  const allStockIn = SAMPLE_TRANSACTIONS.filter(t => t.type === 'STOCK_IN');
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultRef = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate Inbound KPIs
  const totalShipments = allStockIn.length;
  const totalUnitsReceived = allStockIn.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalValuation = allStockIn.reduce((acc, t) => acc + (t.totalValue || (t.quantity * (t.unitCost || 0))), 0);
  const uniqueVendors = new Set(allStockIn.map(t => t.supplier).filter(Boolean)).size;

  // Filtered transactions for the ledger
  const filtered = allStockIn.filter(t => {
    const term = stockInFilter.search.toLowerCase();
    const matchesSearch = !term ||
      (t.refNo && t.refNo.toLowerCase().includes(term)) ||
      (t.id && t.id.toLowerCase().includes(term)) ||
      (t.sku && t.sku.toLowerCase().includes(term)) ||
      (t.productName && t.productName.toLowerCase().includes(term)) ||
      (t.supplier && t.supplier.toLowerCase().includes(term)) ||
      (t.location && t.location.toLowerCase().includes(term));

    const matchesLoc = stockInFilter.location === 'ALL' || t.location === stockInFilter.location;
    const matchesSup = stockInFilter.supplier === 'ALL' || t.supplier === stockInFilter.supplier;

    return matchesSearch && matchesLoc && matchesSup;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock In & Inbound Receiving</h1>
        <p>Record vendor purchase shipments, inbound consignments, and warehouse stock receipts.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportStockInCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Inbound Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Stock In KPI Cards Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Inbound Receipts</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalShipments}</div>
        <div class="kpi-footer">Completed intake vouchers</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Received</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalUnitsReceived.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative physical stock additions</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Inbound Stock Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="kpi-footer">Gross procurement value</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Sourcing Partners</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${uniqueVendors}</div>
        <div class="kpi-footer">Suppliers with completed receipts</div>
      </div>
    </div>

    <!-- Intake Form & Live Impact Section -->
    ${canManage ? `
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Inbound Voucher Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--success);" viewBox="0 0 24 24" fill="none"><path d="M7 11l5-5m0 0l5 5m-5-5v12" stroke="currentColor" stroke-width="2"/></svg>
              New Goods Receipt Voucher (GRN)
            </div>
            <span class="badge badge-in-stock">INBOUND MOVEMENT</span>
          </div>

          <div class="card-body">
            <form id="stock-in-form" onsubmit="event.preventDefault(); window.submitStockIn();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Receipt Date <span class="required-star">*</span></label>
                  <input type="date" id="in-date" class="form-input" value="${todayStr}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    PO / Delivery Reference <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('in-ref').value = 'PO-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="in-ref" class="form-input" value="${defaultRef}" placeholder="PO-2026-XXXX" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Supplying Vendor <span class="required-star">*</span></label>
                  <select id="in-supplier" class="form-select" required>
                    <option value="">Select Supplier...</option>
                    ${SAMPLE_SUPPLIERS.filter(s => s.status === 'ACTIVE').map(s => `
                      <option value="${s.name}">${s.name}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Receiving Facility <span class="required-star">*</span></label>
                  <select id="in-location" class="form-select" required>
                    ${SAMPLE_LOCATIONS.filter(l => l.status === 'ACTIVE').map(l => `
                      <option value="${l.name}">${l.name}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Catalog Item to Receive <span class="required-star">*</span></label>
                  <select id="in-product" class="form-select" onchange="window.handleStockInProductChange(this.value)" required>
                    <option value="">Select Product from Catalog...</option>
                    ${SAMPLE_PRODUCTS.filter(p => p.status !== 'ARCHIVED').map(p => `
                      <option value="${p.id}" data-cost="${p.costPrice}" data-name="${p.name}" data-sku="${p.sku}" data-unit="${p.unit}" data-stock="${p.currentStock}" data-min="${p.minStock}" data-max="${p.maxStock}">
                        [${p.sku}] ${p.name} — Current: ${p.currentStock} ${p.unit}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Intake Quantity <span class="required-star">*</span></label>
                  <input type="number" id="in-qty" class="form-input" min="1" step="1" placeholder="e.g. 50" oninput="window.updateStockInCalc()" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Unit Cost ($) <span class="required-star">*</span></label>
                  <input type="number" id="in-cost" class="form-input" min="0" step="0.01" placeholder="0.00" oninput="window.updateStockInCalc()" required />
                </div>

                <!-- Live Calculation Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner">
                    <div class="calc-summary-left">
                      <span>Valuation Formula: <strong>Quantity × Unit Cost</strong></span>
                      <span id="in-calc-breakdown" style="font-weight: 600; color: var(--text-main);">0 × $0.00</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Total Inbound Value</div>
                      <div class="calc-summary-val" id="in-total-val" style="color: var(--success);">$0.00</div>
                    </div>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Carrier / Delivery Notes</label>
                  <textarea id="in-notes" class="form-textarea" rows="2" placeholder="e.g. Received via FedLine logistics. Bill of Lading #BL-992. Packaging inspected intact."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetStockInForm()">Reset</button>
                <button type="submit" class="btn btn-primary" id="btn-save-stock-in">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Confirm & Post Stock In
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Real-Time Stock Impact Widget -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/></svg>
                Inventory Impact Preview
              </div>
            </div>
            <div class="card-body" id="inbound-impact-preview">
              <div class="empty-state" style="padding: 24px;">
                <div class="empty-state-icon">
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
                <div class="empty-state-desc" style="font-size: 12px;">Choose a catalog product to preview before/after stock levels and valuation.</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>
                Receiving Compliance SOP
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Count Verification:</strong> Unload and physically verify quantity against the Vendor Packing Slip.</p>
              <p style="margin-top: 6px;">• <strong>Audit Trail:</strong> Inbound records are immutable. Corrections must be handled via Stock Adjustments.</p>
              <p style="margin-top: 6px;">• <strong>FIFO Valuation:</strong> Stock valuation balances reflect transaction at-cost pricing.</p>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Inbound Receipts Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Inbound Receipts History Ledger</div>
        <span class="badge badge-neutral">${filtered.length} Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by PO #, SKU, product, or vendor..." 
              value="${stockInFilter.search}" 
              oninput="window.handleStockInSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleStockInLocationFilter(this.value)">
            <option value="ALL" ${stockInFilter.location === 'ALL' ? 'selected' : ''}>All Locations</option>
            ${SAMPLE_LOCATIONS.map(l => `
              <option value="${l.name}" ${stockInFilter.location === l.name ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>

          <select class="select-filter" onchange="window.handleStockInSupplierFilter(this.value)">
            <option value="ALL" ${stockInFilter.supplier === 'ALL' ? 'selected' : ''}>All Suppliers</option>
            ${SAMPLE_SUPPLIERS.map(s => `
              <option value="${s.name}" ${stockInFilter.supplier === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> receipts
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Receipt Ref / ID</th>
              <th>Date & Time</th>
              <th>Product Line</th>
              <th>Destination Depot</th>
              <th>Supplying Vendor</th>
              <th style="text-align: right;">Qty Intake</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Total Value</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No inbound receipts found</div>
                    <div class="empty-state-desc">Try clearing the search query or post a new Stock In voucher.</div>
                  </div>
                </td>
              </tr>
            ` : filtered.map(t => {
              const totalVal = t.totalValue || (t.quantity * (t.unitCost || 0));
              return `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${t.refNo || t.id}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${t.id}</div>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); white-space: nowrap;">
                    ${t.date}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${t.productName}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${t.sku}</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${t.location || 'Central Storage'}
                  </td>
                  <td style="font-size: 13px; font-weight: 500;">
                    ${t.supplier || 'N/A'}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 700; color: var(--success); font-size: 14px;">
                      +${t.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(t.unitCost || 0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge badge-in-stock" style="font-size: 11px;">
                      COMPLETED
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewReceiptVoucher('${t.id}')" title="View Goods Receipt Note">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      GRN Voucher
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
// Form Interactivity & Live Calculations
// --------------------------------------------------------------------------
window.handleStockInProductChange = function(prodId) {
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const costInput = document.getElementById('in-cost');
  const supplierSelect = document.getElementById('in-supplier');
  const locationSelect = document.getElementById('in-location');

  if (p) {
    if (costInput) costInput.value = Number(p.costPrice || 0).toFixed(2);
    if (p.supplier && supplierSelect) supplierSelect.value = p.supplier;
    if (p.location && locationSelect) locationSelect.value = p.location;
  }
  window.updateStockInCalc();
};

window.updateStockInCalc = function() {
  const prodSelect = document.getElementById('in-product');
  const prodId = prodSelect?.value;
  const qty = parseFloat(document.getElementById('in-qty')?.value || '0');
  const cost = parseFloat(document.getElementById('in-cost')?.value || '0');
  const total = qty * cost;

  const breakdownEl = document.getElementById('in-calc-breakdown');
  const totalEl = document.getElementById('in-total-val');
  if (breakdownEl) breakdownEl.textContent = `${qty} units × $${cost.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Update Impact Preview Card
  const impactEl = document.getElementById('inbound-impact-preview');
  if (!impactEl) return;

  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  if (!p) {
    impactEl.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
        <div class="empty-state-desc" style="font-size: 12px;">Choose a catalog product to preview before/after stock levels and valuation.</div>
      </div>
    `;
    return;
  }

  const currentStock = p.currentStock || 0;
  const newStock = currentStock + (isNaN(qty) || qty < 0 ? 0 : qty);
  const minStock = p.minStock || 10;
  const maxStock = p.maxStock || 500;
  const capacityPct = Math.min(100, Math.round((newStock / maxStock) * 100));

  let newStatus = 'IN STOCK';
  let badgeClass = 'badge-in-stock';
  if (newStock === 0) {
    newStatus = 'OUT OF STOCK';
    badgeClass = 'badge-out-of-stock';
  } else if (newStock <= minStock) {
    newStatus = 'LOW STOCK';
    badgeClass = 'badge-low-stock';
  }

  impactEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
      <div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${p.name}</div>
        <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${p.sku} | ${p.category}</div>
      </div>
      <span class="badge ${badgeClass}" style="font-size: 11px;">${newStatus}</span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
      <div style="background: var(--bg-main); padding: 10px; border-radius: 6px; text-align: center;">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Current Stock</div>
        <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">${currentStock} ${p.unit}</div>
      </div>

      <div style="background: rgba(34, 197, 94, 0.08); padding: 10px; border-radius: 6px; text-align: center; border: 1px dashed var(--success);">
        <div style="font-size: 11px; color: var(--success); font-weight: 600; text-transform: uppercase;">Projected Stock</div>
        <div style="font-size: 18px; font-weight: 700; color: var(--success);">+${newStock} ${p.unit}</div>
      </div>
    </div>

    <div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Warehouse Capacity (${newStock}/${maxStock})</span>
        <span style="font-weight: 600; color: var(--text-main);">${capacityPct}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${capacityPct}%; background: var(--success);"></div>
      </div>
    </div>
  `;
};

window.resetStockInForm = function() {
  setTimeout(() => {
    window.updateStockInCalc();
  }, 50);
};

// --------------------------------------------------------------------------
// Stock In Submission & Transaction Processing
// --------------------------------------------------------------------------
window.submitStockIn = async function() {
  const prodSelect = document.getElementById('in-product');
  const prodId = prodSelect?.value;
  const qty = parseInt(document.getElementById('in-qty')?.value || '0', 10);
  const unitCost = parseFloat(document.getElementById('in-cost')?.value || '0');
  const refNo = document.getElementById('in-ref')?.value.trim();
  const supplier = document.getElementById('in-supplier')?.value;
  const location = document.getElementById('in-location')?.value;
  const dateVal = document.getElementById('in-date')?.value || new Date().toISOString().slice(0, 10);
  const notes = document.getElementById('in-notes')?.value.trim();

  if (!prodId || !qty || qty <= 0 || unitCost < 0 || !refNo || !supplier || !location) {
    window.showToast('Please validate all mandatory fields. Intake quantity must be greater than zero.', 'error');
    return;
  }

  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  if (!p) {
    window.showToast('Selected product could not be found.', 'error');
    return;
  }

  const nowTime = new Date().toTimeString().slice(0, 5);
  const fullDateTime = `${dateVal} ${nowTime}`;
  const txnId = `TXN-IN-${Date.now().toString().slice(-6)}`;
  const totalVal = qty * unitCost;

  const payload = {
    id: txnId,
    date: fullDateTime,
    type: 'STOCK_IN',
    refNo,
    productId: p.id,
    sku: p.sku,
    productName: p.name,
    quantity: qty,
    unitCost,
    totalValue: totalVal,
    supplier,
    location,
    user: auth.getUser()?.fullName || 'Alex Thorne',
    notes: notes || 'Supplier Purchase Intake'
  };

  // Live Google Apps Script API synchronization if configured
  if (api.isConfigured()) {
    try {
      window.showToast('Recording Stock In with Google Sheets Ledger...', 'info');
      await api.request('createStockIn', {
        method: 'POST',
        data: payload,
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API Stock In failed, updating in-memory state:', e);
    }
  }

  // Update in-memory state
  SAMPLE_TRANSACTIONS.unshift(payload);

  // Recalculate physical stock balance
  p.currentStock += qty;
  if (p.currentStock > p.minStock) {
    p.stockStatus = 'IN STOCK';
  } else if (p.currentStock > 0) {
    p.stockStatus = 'LOW STOCK';
  }

  // Record Audit Trail
  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'STOCK_IN',
    module: 'Stock In',
    recordId: txnId,
    description: `Received ${qty} ${p.unit} of [${p.sku}] ${p.name} from "${supplier}" (Ref: ${refNo})`
  });

  window.showToast(`Goods Receipt Voucher ${refNo} posted successfully! Updated balance: ${p.currentStock} ${p.unit}.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockIn();
};

// --------------------------------------------------------------------------
// Goods Receipt Note (GRN) Voucher Modal
// --------------------------------------------------------------------------
window.viewReceiptVoucher = function(txnId) {
  const t = SAMPLE_TRANSACTIONS.find(item => item.id === txnId);
  if (!t) return;

  const totalVal = t.totalValue || (t.quantity * (t.unitCost || 0));

  window.openModal({
    title: `Goods Receipt Note: ${t.refNo || t.id}`,
    body: `
      <div id="printable-grn-voucher" style="padding: 10px;">
        <!-- Voucher Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--primary); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Warehouse Inbound Receiving & Quality Verification</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">GOODS RECEIPT NOTE</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Voucher Metadata Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">PO / Delivery Challan:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Receipt Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Supplying Vendor:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.supplier || 'Authorized Vendor'}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Receiving Depot:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location || 'Central Storage'}</div>
          </div>
        </div>

        <!-- Received Line Items Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 700; color: var(--success); font-size: 14px;">+${t.quantity}</td>
                <td style="text-align: right;">$${Number(t.unitCost || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${totalVal.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: var(--bg-main); font-weight: 700;">
                <td colspan="4" style="text-align: right; font-size: 13px;">Grand Total Received:</td>
                <td style="text-align: right; color: var(--primary); font-size: 14px;">$${totalVal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes & Remarks -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Receipt Remarks:</strong> ${t.notes || 'Goods verified and inspected with zero defects.'}
        </div>

        <!-- Sign-Off Block -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Received & Inspected By:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user || 'Warehouse Receiver'}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Site Supervisor Authorization:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; margin-left: auto; padding-top: 4px; font-weight: 600; color: var(--text-main);">Signature & Stamp</div>
          </div>
        </div>
      </div>
    `,
    primaryText: 'Print Voucher',
    onPrimary: () => {
      window.print();
    }
  });
};

// --------------------------------------------------------------------------
// Filtering & CSV Export
// --------------------------------------------------------------------------
window.handleStockInSearch = function(val) {
  stockInFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockIn();
};

window.handleStockInLocationFilter = function(val) {
  stockInFilter.location = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockIn();
};

window.handleStockInSupplierFilter = function(val) {
  stockInFilter.supplier = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockIn();
};

window.exportStockInCSV = function() {
  const stockIns = SAMPLE_TRANSACTIONS.filter(t => t.type === 'STOCK_IN');
  if (stockIns.length === 0) {
    window.showToast('No Stock In records to export.', 'info');
    return;
  }

  const headers = ['Transaction_ID', 'Date', 'Type', 'Reference_No', 'SKU', 'Product_Name', 'Quantity', 'Unit_Cost', 'Total_Value', 'Supplier', 'Location', 'Received_By', 'Notes'];
  const rows = stockIns.map(t => [
    t.id,
    `"${t.date}"`,
    t.type,
    `"${t.refNo}"`,
    `"${t.sku}"`,
    `"${(t.productName || '').replace(/"/g, '""')}"`,
    t.quantity,
    Number(t.unitCost || 0).toFixed(2),
    Number(t.totalValue || (t.quantity * (t.unitCost || 0))).toFixed(2),
    `"${(t.supplier || '').replace(/"/g, '""')}"`,
    `"${(t.location || '').replace(/"/g, '""')}"`,
    `"${(t.user || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Stock_In_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.showToast('Stock In receipts exported to CSV successfully.', 'success');
};
