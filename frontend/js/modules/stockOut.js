import { SAMPLE_PRODUCTS, SAMPLE_LOCATIONS, SAMPLE_TRANSACTIONS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let stockOutFilter = {
  search: '',
  location: 'ALL',
  department: 'ALL'
};

export function renderStockOut() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');
  const allStockOut = SAMPLE_TRANSACTIONS.filter(t => t.type === 'STOCK_OUT');
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultRef = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate Outbound KPIs
  const totalDispatches = allStockOut.length;
  const totalUnitsIssued = allStockOut.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalValuation = allStockOut.reduce((acc, t) => acc + (t.totalValue || (t.quantity * (t.unitCost || 0))), 0);
  const uniqueDepts = new Set(allStockOut.map(t => t.department).filter(Boolean)).size;

  // Filtered transactions for the ledger
  const filtered = allStockOut.filter(t => {
    const term = stockOutFilter.search.toLowerCase();
    const matchesSearch = !term ||
      (t.refNo && t.refNo.toLowerCase().includes(term)) ||
      (t.id && t.id.toLowerCase().includes(term)) ||
      (t.sku && t.sku.toLowerCase().includes(term)) ||
      (t.productName && t.productName.toLowerCase().includes(term)) ||
      (t.department && t.department.toLowerCase().includes(term)) ||
      (t.location && t.location.toLowerCase().includes(term));

    const matchesLoc = stockOutFilter.location === 'ALL' || t.location === stockOutFilter.location;
    const matchesDept = stockOutFilter.department === 'ALL' || t.department === stockOutFilter.department;

    return matchesSearch && matchesLoc && matchesDept;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock Out & Inventory Dispatch</h1>
        <p>Fulfill customer sales orders, department requisitions, and outgoing facility consignments.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportStockOutCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Outbound Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Stock Out KPI Cards Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Dispatches</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalDispatches}</div>
        <div class="kpi-footer">Completed outgoing orders</div>
      </div>

      <div class="kpi-card kpi-orange">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Issued</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 12H4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalUnitsIssued.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative stock deductions</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Dispatched Valuation</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="kpi-footer">Gross at-cost fulfillment value</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Departments Served</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${uniqueDepts}</div>
        <div class="kpi-footer">Active internal & external channels</div>
      </div>
    </div>

    <!-- Dispatch Form & Stock Depletion Preview -->
    ${canManage ? `
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Dispatch Requisition Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--danger);" viewBox="0 0 24 24" fill="none"><path d="M17 13l-5 5m0 0l-5-5m5 5V6" stroke="currentColor" stroke-width="2"/></svg>
              New Goods Dispatch Voucher (GDN)
            </div>
            <span class="badge badge-out-of-stock">OUTBOUND TRANSACTION</span>
          </div>

          <div class="card-body">
            <form id="stock-out-form" onsubmit="event.preventDefault(); window.submitStockOut();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Dispatch Date <span class="required-star">*</span></label>
                  <input type="date" id="out-date" class="form-input" value="${todayStr}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    SO / Requisition Reference <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('out-ref').value = 'SO-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="out-ref" class="form-input" value="${defaultRef}" placeholder="SO-2026-XXXX" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Issuing Facility <span class="required-star">*</span></label>
                  <select id="out-location" class="form-select" required>
                    ${SAMPLE_LOCATIONS.filter(l => l.status === 'ACTIVE').map(l => `
                      <option value="${l.name}">${l.name}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Requesting Department <span class="required-star">*</span></label>
                  <select id="out-dept" class="form-select" required>
                    <option value="Sales & Distribution">Sales & Distribution</option>
                    <option value="Operations">Operations</option>
                    <option value="Production & Assembly">Production & Assembly</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Administration & HR">Administration & HR</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Catalog Item to Issue <span class="required-star">*</span></label>
                  <select id="out-product" class="form-select" onchange="window.handleStockOutProductChange(this.value)" required>
                    <option value="">Select Product from Catalog...</option>
                    ${SAMPLE_PRODUCTS.filter(p => p.status !== 'ARCHIVED').map(p => `
                      <option value="${p.id}" data-stock="${p.currentStock}" data-unit="${p.unit}" data-cost="${p.costPrice}">
                        [${p.sku}] ${p.name} — Available: ${p.currentStock} ${p.unit} ${p.currentStock === 0 ? '(OUT OF STOCK)' : ''}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Available Stock Callout Indicator -->
                <div class="form-group col-span-2" id="out-availability-box" style="display: none;">
                  <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Available Stock On Hand</span>
                      <div id="out-available-text" style="font-size: 15px; font-weight: 700; color: var(--text-main);">0 Units</div>
                    </div>
                    <div id="out-stock-pill"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Dispatch Quantity <span class="required-star">*</span></label>
                  <input type="number" id="out-qty" class="form-input" min="1" step="1" placeholder="Enter quantity to issue" oninput="window.validateStockOutQuantity()" required />
                  <div id="out-error-notice" style="display: none; font-size: 12px; color: var(--danger); margin-top: 4px; font-weight: 600;"></div>
                </div>

                <div class="form-group">
                  <label class="form-label">Issuance Purpose / Reason <span class="required-star">*</span></label>
                  <select id="out-reason" class="form-select" required>
                    <option value="Customer Sales Fulfillment">Customer Sales Fulfillment</option>
                    <option value="Internal Office Consumption">Internal Office Consumption</option>
                    <option value="Production Line Issuance">Production Line Issuance</option>
                    <option value="Inter-Branch Transfer">Inter-Branch Transfer</option>
                    <option value="Damaged / Expired Write-off">Damaged / Expired Write-off</option>
                    <option value="Sample / Marketing Demo">Sample / Marketing Demo</option>
                  </select>
                </div>

                <!-- Live Valuation Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner">
                    <div class="calc-summary-left">
                      <span>Valuation Formula: <strong>Quantity × Unit Cost</strong></span>
                      <span id="out-calc-breakdown" style="font-weight: 600; color: var(--text-main);">0 units × $0.00</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Dispatched Holding Value</div>
                      <div class="calc-summary-val" id="out-total-val" style="color: var(--danger);">$0.00</div>
                    </div>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Recipient / Consignee & Delivery Notes</label>
                  <textarea id="out-notes" class="form-textarea" rows="2" placeholder="e.g. Dispatched to Chicago Regional Store. Waybill #WB-482. Received by Mark Vance."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetStockOutForm()">Reset</button>
                <button type="submit" class="btn btn-danger" id="btn-save-stock-out">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Confirm & Dispatch Stock
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Real-Time Stock Depletion Impact Widget -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/></svg>
                Inventory Depletion Forecast
              </div>
            </div>
            <div class="card-body" id="outbound-impact-preview">
              <div class="empty-state" style="padding: 24px;">
                <div class="empty-state-icon">
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
                <div class="empty-state-desc" style="font-size: 12px;">Choose an item to preview depletion impact, threshold compliance, and remaining stock.</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--danger);" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>
                Strict Anti-Negative Stock Guardrail
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Zero Negative Inventory:</strong> Requisitions cannot exceed available on-hand stock under any circumstance.</p>
              <p style="margin-top: 6px;">• <strong>Audit Enforcement:</strong> Dispatches immediately decrement physical balance and post immutable entries to the transaction ledger.</p>
              <p style="margin-top: 6px;">• <strong>Threshold Alerts:</strong> When remaining balance drops to or below the minimum reorder point, an alert is triggered.</p>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Outbound Dispatch Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Outbound Dispatches History Ledger</div>
        <span class="badge badge-neutral">${filtered.length} Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by SO #, SKU, product, or department..." 
              value="${stockOutFilter.search}" 
              oninput="window.handleStockOutSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleStockOutLocationFilter(this.value)">
            <option value="ALL" ${stockOutFilter.location === 'ALL' ? 'selected' : ''}>All Locations</option>
            ${SAMPLE_LOCATIONS.map(l => `
              <option value="${l.name}" ${stockOutFilter.location === l.name ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>

          <select class="select-filter" onchange="window.handleStockOutDeptFilter(this.value)">
            <option value="ALL" ${stockOutFilter.department === 'ALL' ? 'selected' : ''}>All Departments</option>
            <option value="Sales & Distribution" ${stockOutFilter.department === 'Sales & Distribution' ? 'selected' : ''}>Sales & Distribution</option>
            <option value="Operations" ${stockOutFilter.department === 'Operations' ? 'selected' : ''}>Operations</option>
            <option value="Production & Assembly" ${stockOutFilter.department === 'Production & Assembly' ? 'selected' : ''}>Production & Assembly</option>
            <option value="IT Services" ${stockOutFilter.department === 'IT Services' ? 'selected' : ''}>IT Services</option>
            <option value="Administration & HR" ${stockOutFilter.department === 'Administration & HR' ? 'selected' : ''}>Administration & HR</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> dispatches
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dispatch Ref / ID</th>
              <th>Date & Time</th>
              <th>Product Line</th>
              <th>Origin Depot</th>
              <th>Department / Purpose</th>
              <th style="text-align: right;">Qty Issued</th>
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
                    <div class="empty-state-title">No outbound dispatches found</div>
                    <div class="empty-state-desc">Try clearing the search query or post a new Stock Out voucher.</div>
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
                  <td>
                    <div style="font-size: 13px; font-weight: 500; color: var(--text-main);">${t.department || 'Operations'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${t.reason || 'Requisition'}</div>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 700; color: var(--danger); font-size: 14px;">
                      -${t.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(t.unitCost || 0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge badge-out-of-stock" style="font-size: 11px;">
                      DISPATCHED
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewDispatchVoucher('${t.id}')" title="View Goods Dispatch Note">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      GDN Voucher
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
// Stock Out Calculations & Strict Negative Stock Prevention
// --------------------------------------------------------------------------
window.handleStockOutProductChange = function(prodId) {
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const box = document.getElementById('out-availability-box');
  const text = document.getElementById('out-available-text');
  const pill = document.getElementById('out-stock-pill');
  const locationSelect = document.getElementById('out-location');

  if (p && box && text && pill) {
    box.style.display = 'block';
    text.textContent = `${p.currentStock} ${p.unit}`;
    pill.className = `badge ${p.currentStock === 0 ? 'badge-out-of-stock' : p.currentStock <= p.minStock ? 'badge-low-stock' : 'badge-in-stock'}`;
    pill.textContent = p.stockStatus;

    if (p.location && locationSelect) locationSelect.value = p.location;
  } else if (box) {
    box.style.display = 'none';
  }

  window.validateStockOutQuantity();
};

window.validateStockOutQuantity = function() {
  const prodId = document.getElementById('out-product')?.value;
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const qtyInput = document.getElementById('out-qty');
  const errorNotice = document.getElementById('out-error-notice');
  const submitBtn = document.getElementById('btn-save-stock-out');

  const requestedQty = parseFloat(qtyInput?.value || '0');
  const unitCost = p ? (p.costPrice || 0) : 0;
  const total = requestedQty * unitCost;

  const breakdownEl = document.getElementById('out-calc-breakdown');
  const totalEl = document.getElementById('out-total-val');
  if (breakdownEl) breakdownEl.textContent = `${requestedQty} units × $${unitCost.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Update Stock Depletion Preview Card
  const impactEl = document.getElementById('outbound-impact-preview');
  if (impactEl) {
    if (!p) {
      impactEl.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
          <div class="empty-state-desc" style="font-size: 12px;">Choose an item to preview depletion impact, threshold compliance, and remaining stock.</div>
        </div>
      `;
    } else {
      const remainingStock = p.currentStock - (isNaN(requestedQty) || requestedQty < 0 ? 0 : requestedQty);
      const minStock = p.minStock || 10;
      const maxStock = p.maxStock || 500;
      const capacityPct = Math.max(0, Math.min(100, Math.round((remainingStock / maxStock) * 100)));

      let remainingStatus = 'IN STOCK';
      let badgeClass = 'badge-in-stock';
      if (remainingStock < 0) {
        remainingStatus = 'NEGATIVE DEFICIT';
        badgeClass = 'badge-out-of-stock';
      } else if (remainingStock === 0) {
        remainingStatus = 'DEPLETED (OUT OF STOCK)';
        badgeClass = 'badge-out-of-stock';
      } else if (remainingStock <= minStock) {
        remainingStatus = 'LOW STOCK (REORDER)';
        badgeClass = 'badge-low-stock';
      }

      impactEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${p.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${p.sku} | Threshold: ${minStock} ${p.unit}</div>
          </div>
          <span class="badge ${badgeClass}" style="font-size: 10px;">${remainingStatus}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
          <div style="background: var(--bg-main); padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Available Now</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">${p.currentStock} ${p.unit}</div>
          </div>

          <div style="background: ${remainingStock < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 87, 231, 0.06)'}; padding: 10px; border-radius: 6px; text-align: center; border: 1px dashed ${remainingStock < 0 ? 'var(--danger)' : 'var(--primary)'};">
            <div style="font-size: 11px; color: ${remainingStock < 0 ? 'var(--danger)' : 'var(--primary)'}; font-weight: 600; text-transform: uppercase;">Balance After Dispatch</div>
            <div style="font-size: 18px; font-weight: 700; color: ${remainingStock < 0 ? 'var(--danger)' : 'var(--text-main)'};">${remainingStock} ${p.unit}</div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Remaining Storage Gauge (${remainingStock}/${maxStock})</span>
            <span style="font-weight: 600; color: var(--text-main);">${capacityPct}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${capacityPct}%; background: ${remainingStock <= minStock ? 'var(--warning)' : 'var(--primary)'};"></div>
          </div>
        </div>
      `;
    }
  }

  // Strict Validation logic
  if (!p || !qtyInput || !errorNotice || !submitBtn) return true;

  if (requestedQty > p.currentStock) {
    qtyInput.style.borderColor = 'var(--danger)';
    errorNotice.style.display = 'block';
    errorNotice.innerHTML = `⚠️ <strong>Insufficient Inventory:</strong> Requisition of <strong>${requestedQty} ${p.unit}</strong> exceeds on-hand balance of <strong>${p.currentStock} ${p.unit}</strong>.`;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.4';
    submitBtn.style.cursor = 'not-allowed';
    return false;
  } else {
    qtyInput.style.borderColor = '';
    errorNotice.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
    return true;
  }
};

window.resetStockOutForm = function() {
  setTimeout(() => {
    window.validateStockOutQuantity();
  }, 50);
};

// --------------------------------------------------------------------------
// Stock Out Submission & Transaction Processing
// --------------------------------------------------------------------------
window.submitStockOut = async function() {
  if (!window.validateStockOutQuantity()) {
    window.showToast('Transaction blocked: requested quantity exceeds available physical stock.', 'error');
    return;
  }

  const prodId = document.getElementById('out-product')?.value;
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const qty = parseInt(document.getElementById('out-qty')?.value || '0', 10);
  const refNo = document.getElementById('out-ref')?.value.trim();
  const location = document.getElementById('out-location')?.value;
  const dept = document.getElementById('out-dept')?.value;
  const reason = document.getElementById('out-reason')?.value;
  const dateVal = document.getElementById('out-date')?.value || new Date().toISOString().slice(0, 10);
  const notes = document.getElementById('out-notes')?.value.trim();

  if (!p || !qty || qty <= 0 || !refNo || !location || !dept) {
    window.showToast('Please complete all mandatory requisition fields.', 'error');
    return;
  }

  // Anti-Negative Stock Guardrail
  if (qty > p.currentStock) {
    window.showToast(`Insufficient stock! Available balance: ${p.currentStock} ${p.unit}.`, 'error');
    return;
  }

  const nowTime = new Date().toTimeString().slice(0, 5);
  const fullDateTime = `${dateVal} ${nowTime}`;
  const txnId = `TXN-OUT-${Date.now().toString().slice(-6)}`;
  const totalVal = qty * p.costPrice;

  const payload = {
    id: txnId,
    date: fullDateTime,
    type: 'STOCK_OUT',
    refNo,
    productId: p.id,
    sku: p.sku,
    productName: p.name,
    quantity: qty,
    unitCost: p.costPrice,
    totalValue: totalVal,
    location,
    supplier: '-',
    department: dept,
    reason,
    user: auth.getUser()?.fullName || 'Alex Thorne',
    notes: notes || 'Dispatch Requisition'
  };

  // Sync with live Google Apps Script API
  if (api.isConfigured()) {
    try {
      window.showToast('Transmitting Stock Out to Google Sheets Ledger...', 'info');
      await api.request('createStockOut', {
        method: 'POST',
        data: payload,
        token: auth.getToken()
      });
      window.showToast('✅ Stock Out successfully recorded in Google Sheets!', 'success');
    } catch (e) {
      console.error('API Stock Out failed:', e);
      window.showToast(`❌ Google Sheets Error: ${e.message}`, 'error', 8000);
    }
  } else {
    window.showToast('⚠️ Demo Mode: Transaction recorded locally. Connect your Google Sheets Web App URL in header to save permanently.', 'warning', 6000);
  }

  // Update in-memory state
  SAMPLE_TRANSACTIONS.unshift(payload);

  // Decrement physical stock balance
  p.currentStock -= qty;
  if (p.currentStock === 0) {
    p.stockStatus = 'OUT OF STOCK';
  } else if (p.currentStock <= p.minStock) {
    p.stockStatus = 'LOW STOCK';
  } else {
    p.stockStatus = 'IN STOCK';
  }

  // Record Audit Trail
  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'STOCK_OUT',
    module: 'Stock Out',
    recordId: txnId,
    description: `Dispatched ${qty} ${p.unit} of [${p.sku}] ${p.name} to "${dept}" (Ref: ${refNo})`
  });

  window.showToast(`Goods Dispatch Note ${refNo} posted successfully! Remaining: ${p.currentStock} ${p.unit}.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockOut();
};

// --------------------------------------------------------------------------
// Goods Dispatch Note (GDN) Voucher Modal
// --------------------------------------------------------------------------
window.viewDispatchVoucher = function(txnId) {
  const t = SAMPLE_TRANSACTIONS.find(item => item.id === txnId);
  if (!t) return;

  const totalVal = t.totalValue || (t.quantity * (t.unitCost || 0));

  window.openModal({
    title: `Goods Dispatch Note: ${t.refNo || t.id}`,
    body: `
      <div id="printable-gdn-voucher" style="padding: 10px;">
        <!-- Voucher Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--danger); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--danger); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Warehouse Outbound Dispatch & Packing Slip</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">GOODS DISPATCH NOTE</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--danger); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Voucher Metadata Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">SO / Requisition Reference:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Dispatch Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Issuing Depot:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location || 'Central Storage'}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Requesting Department:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.department || 'Operations'} (${t.reason || 'Dispatch'})</div>
          </div>
        </div>

        <!-- Dispatched Line Items Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Description</th>
                <th style="text-align: right;">Quantity Issued</th>
                <th style="text-align: right;">Unit Valuation</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 700; color: var(--danger); font-size: 14px;">-${t.quantity}</td>
                <td style="text-align: right;">$${Number(t.unitCost || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${totalVal.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: var(--bg-main); font-weight: 700;">
                <td colspan="4" style="text-align: right; font-size: 13px;">Grand Total Dispatched:</td>
                <td style="text-align: right; color: var(--danger); font-size: 14px;">$${totalVal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes & Remarks -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Dispatch Remarks:</strong> ${t.notes || 'Goods verified and released according to requisition mandate.'}
        </div>

        <!-- Sign-Off Block -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Dispatched By Warehouse Officer:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user || 'Alex Thorne'}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Department Recipient Acknowledgment:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; margin-left: auto; padding-top: 4px; font-weight: 600; color: var(--text-main);">Signature & Employee ID</div>
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
window.handleStockOutSearch = function(val) {
  stockOutFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockOut();
};

window.handleStockOutLocationFilter = function(val) {
  stockOutFilter.location = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockOut();
};

window.handleStockOutDeptFilter = function(val) {
  stockOutFilter.department = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderStockOut();
};

window.exportStockOutCSV = function() {
  const stockOuts = SAMPLE_TRANSACTIONS.filter(t => t.type === 'STOCK_OUT');
  if (stockOuts.length === 0) {
    window.showToast('No Stock Out records to export.', 'info');
    return;
  }

  const headers = ['Transaction_ID', 'Date', 'Type', 'Reference_No', 'SKU', 'Product_Name', 'Quantity_Issued', 'Unit_Cost', 'Total_Value', 'Department', 'Issuing_Location', 'Dispatched_By', 'Notes'];
  const rows = stockOuts.map(t => [
    t.id,
    `"${t.date}"`,
    t.type,
    `"${t.refNo}"`,
    `"${t.sku}"`,
    `"${(t.productName || '').replace(/"/g, '""')}"`,
    t.quantity,
    Number(t.unitCost || 0).toFixed(2),
    Number(t.totalValue || (t.quantity * (t.unitCost || 0))).toFixed(2),
    `"${(t.department || '').replace(/"/g, '""')}"`,
    `"${(t.location || '').replace(/"/g, '""')}"`,
    `"${(t.user || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Stock_Out_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.showToast('Stock Out dispatches exported to CSV successfully.', 'success');
};
