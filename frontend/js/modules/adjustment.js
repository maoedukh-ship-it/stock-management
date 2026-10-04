import { SAMPLE_PRODUCTS, SAMPLE_LOCATIONS, SAMPLE_TRANSACTIONS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let adjustmentFilter = {
  search: '',
  location: 'ALL',
  type: 'ALL'
};

export function renderAdjustment() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');
  const allAdjustments = SAMPLE_TRANSACTIONS.filter(t => t.type === 'ADJUSTMENT_IN' || t.type === 'ADJUSTMENT_OUT');
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultRef = `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate Adjustment Metrics
  const totalAdjustments = allAdjustments.length;
  const netVarianceUnits = allAdjustments.reduce((acc, t) => {
    return t.type === 'ADJUSTMENT_IN' ? acc + t.quantity : acc - t.quantity;
  }, 0);
  const netValuationImpact = allAdjustments.reduce((acc, t) => {
    const val = t.totalValue || (t.quantity * (t.unitCost || 0));
    return t.type === 'ADJUSTMENT_IN' ? acc + val : acc - val;
  }, 0);
  const countIn = allAdjustments.filter(t => t.type === 'ADJUSTMENT_IN').length;
  const countOut = allAdjustments.filter(t => t.type === 'ADJUSTMENT_OUT').length;

  // Filtered transactions for the ledger
  const filtered = allAdjustments.filter(t => {
    const term = adjustmentFilter.search.toLowerCase();
    const matchesSearch = !term ||
      (t.refNo && t.refNo.toLowerCase().includes(term)) ||
      (t.id && t.id.toLowerCase().includes(term)) ||
      (t.sku && t.sku.toLowerCase().includes(term)) ||
      (t.productName && t.productName.toLowerCase().includes(term)) ||
      (t.reason && t.reason.toLowerCase().includes(term)) ||
      (t.location && t.location.toLowerCase().includes(term));

    const matchesLoc = adjustmentFilter.location === 'ALL' || t.location === adjustmentFilter.location;
    const matchesType = adjustmentFilter.type === 'ALL' || t.type === adjustmentFilter.type;

    return matchesSearch && matchesLoc && matchesType;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock Adjustment & Variance Reconciliation</h1>
        <p>Conduct physical cycle counts, audit stock take reconciliations, and resolve physical-to-book discrepancies.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportAdjustmentCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Audit Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Adjustment KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Audit Reconciliations</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalAdjustments}</div>
        <div class="kpi-footer">${countIn} Surpluses | ${countOut} Deficits</div>
      </div>

      <div class="kpi-card ${netVarianceUnits >= 0 ? 'kpi-green' : 'kpi-orange'}">
        <div class="kpi-card-header">
          <span class="kpi-title">Net Unit Variance</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${netVarianceUnits >= 0 ? '+' : ''}${netVarianceUnits.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative physical discrepancy</div>
      </div>

      <div class="kpi-card ${netValuationImpact >= 0 ? 'kpi-cyan' : 'kpi-purple'}">
        <div class="kpi-card-header">
          <span class="kpi-title">Net Financial Impact</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          ${netValuationImpact >= 0 ? '+' : '-'}$${Math.abs(netValuationImpact).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="kpi-footer">Book valuation adjustment balance</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog Audit Status</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 18px;">100% Verified</div>
        <div class="kpi-footer">Active reconciliation safeguards</div>
      </div>
    </div>

    <!-- Reconciliation Form & Audit Guidelines -->
    ${canManage ? `
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Physical Count Reconciliation Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--warning);" viewBox="0 0 24 24" fill="none"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" stroke-width="2"/></svg>
              Physical Stock Count Reconciliation Form
            </div>
            <span class="badge badge-neutral">AUDIT VERIFIED</span>
          </div>

          <div class="card-body">
            <form id="adjustment-form" onsubmit="event.preventDefault(); window.submitStockAdjustment();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Audit / Verification Date <span class="required-star">*</span></label>
                  <input type="date" id="adj-date" class="form-input" value="${todayStr}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Audit Ref / Count Sheet # <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('adj-ref').value = 'AUD-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="adj-ref" class="form-input" value="${defaultRef}" placeholder="AUD-2026-XXXX" required />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Target Catalog Product <span class="required-star">*</span></label>
                  <select id="adj-product" class="form-select" onchange="window.handleAdjustmentProductChange(this.value)" required>
                    <option value="">Select Product to Reconcile...</option>
                    ${SAMPLE_PRODUCTS.filter(p => p.status !== 'ARCHIVED').map(p => `
                      <option value="${p.id}" data-current="${p.currentStock}" data-unit="${p.unit}" data-cost="${p.costPrice}" data-location="${p.location}">
                        [${p.sku}] ${p.name} — Current System Balance: ${p.currentStock} ${p.unit}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Current System Book Quantity</label>
                  <input type="number" id="adj-sys-qty" class="form-input" value="0" readonly style="background: var(--bg-main); font-weight: 700; color: var(--text-main);" />
                  <div class="form-hint">Recorded digital balance in database</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Physical Counted Quantity <span class="required-star">*</span></label>
                  <input type="number" id="adj-phy-qty" class="form-input" min="0" step="1" placeholder="Enter verified count on shelf" oninput="window.updateAdjustmentVariance()" required />
                  <div class="form-hint">Physical stock verified on shelf</div>
                </div>

                <!-- Live Discrepancy & Direction Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner" id="adj-banner-box" style="background: var(--bg-main); border: 1px solid var(--border-color);">
                    <div>
                      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Calculated Discrepancy</div>
                      <div style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin-top: 2px;">
                        Formula: <strong>Physical Count − System Book</strong>
                      </div>
                      <div id="adj-financial-impact" style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Valuation Impact: $0.00
                      </div>
                    </div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 14px;">
                      <div>
                        <div id="adj-diff-val" style="font-size: 22px; font-weight: 800; color: var(--text-muted);">0 Units</div>
                      </div>
                      <div id="adj-action-badge">
                        <span class="badge badge-neutral">BALANCED</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Warehouse Facility <span class="required-star">*</span></label>
                  <select id="adj-location" class="form-select" required>
                    ${SAMPLE_LOCATIONS.filter(l => l.status === 'ACTIVE').map(l => `
                      <option value="${l.name}">${l.name}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Adjustment Reason <span class="required-star">*</span></label>
                  <select id="adj-reason" class="form-select" required>
                    <option value="">Select Reason...</option>
                    <option value="Periodic Cycle Count Variance">Periodic Cycle Count Variance</option>
                    <option value="Annual Physical Stock Take Audit">Annual Physical Stock Take Audit</option>
                    <option value="Damaged in Warehouse Storage">Damaged in Warehouse Storage</option>
                    <option value="Defective / Broken in Transit">Defective / Broken in Transit</option>
                    <option value="Supplier Packaging Error">Supplier Packaging Error</option>
                    <option value="Theft / Unexplained Shrinkage">Theft / Unexplained Shrinkage</option>
                    <option value="Found Unrecorded Surplus Stock">Found Unrecorded Surplus Stock</option>
                    <option value="Expired Product Disposal">Expired Product Disposal</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Auditor Investigation Notes & Justification</label>
                  <textarea id="adj-notes" class="form-textarea" rows="2" placeholder="Detail the root cause of the variance, recount verification, or corrective action taken..."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetAdjustmentForm()">Reset</button>
                <button type="submit" class="btn btn-primary" id="btn-save-adj">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Post Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Audit Reconciliation SOP & Rules -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2"/></svg>
                Audit Reconciliation Protocol
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Dual Ledger Synchronization:</strong> Adjustments post to both the dedicated <code>Stock_Adjustments</code> log and the master <code>Stock_Transactions</code> ledger.</p>
              <p style="margin-top: 6px;">• <strong>Direction Assignment:</strong> Positive discrepancies automatically log as <code>ADJUSTMENT_IN</code>; negative discrepancies automatically log as <code>ADJUSTMENT_OUT</code>.</p>
              <p style="margin-top: 6px;">• <strong>Managerial Oversight:</strong> Discrepancies exceeding $500 or 20% of on-hand inventory require senior management countersignature.</p>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Audit Trail Compliance</div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>Every posted adjustment generates an immutable cryptographic transaction ID and permanent audit record with operator identity and timestamp.</p>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Adjustments History Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Stock Adjustments History Ledger</div>
        <span class="badge badge-neutral">${filtered.length} Audit Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by Audit #, SKU, product, reason, or location..." 
              value="${adjustmentFilter.search}" 
              oninput="window.handleAdjustmentSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleAdjustmentLocationFilter(this.value)">
            <option value="ALL" ${adjustmentFilter.location === 'ALL' ? 'selected' : ''}>All Locations</option>
            ${SAMPLE_LOCATIONS.map(l => `
              <option value="${l.name}" ${adjustmentFilter.location === l.name ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>

          <select class="select-filter" onchange="window.handleAdjustmentTypeFilter(this.value)">
            <option value="ALL" ${adjustmentFilter.type === 'ALL' ? 'selected' : ''}>All Variance Types</option>
            <option value="ADJUSTMENT_IN" ${adjustmentFilter.type === 'ADJUSTMENT_IN' ? 'selected' : ''}>ADJUSTMENT_IN (Surplus)</option>
            <option value="ADJUSTMENT_OUT" ${adjustmentFilter.type === 'ADJUSTMENT_OUT' ? 'selected' : ''}>ADJUSTMENT_OUT (Deficit)</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> adjustments
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Audit Ref / ID</th>
              <th>Timestamp</th>
              <th>Product Line</th>
              <th>Location</th>
              <th>Reason & Root Cause</th>
              <th style="text-align: right;">Variance Quantity</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Financial Impact</th>
              <th style="text-align: center;">Direction</th>
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
                    <div class="empty-state-title">No stock adjustments found</div>
                    <div class="empty-state-desc">Try clearing the search query or reconcile a physical stock count.</div>
                  </div>
                </td>
              </tr>
            ` : filtered.map(t => {
              const isSurplus = t.type === 'ADJUSTMENT_IN';
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
                  <td style="font-size: 12.5px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.reason || ''}">
                    ${t.reason || 'Cycle count reconciliation'}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 800; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'}; font-size: 14px;">
                      ${isSurplus ? '+' : '-'}${t.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(t.unitCost || 0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'};">
                    ${isSurplus ? '+' : '-'}$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${isSurplus ? 'badge-in-stock' : 'badge-out-of-stock'}" style="font-size: 11px;">
                      ${isSurplus ? '+ SURPLUS' : '- DEFICIT'}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewAdjustmentVoucher('${t.id}')" title="View Adjustment Voucher">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      Voucher
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
// Form Interactivity & Live Variance Calculations
// --------------------------------------------------------------------------
window.handleAdjustmentProductChange = function(prodId) {
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const sysInput = document.getElementById('adj-sys-qty');
  const phyInput = document.getElementById('adj-phy-qty');
  const locSelect = document.getElementById('adj-location');

  if (p) {
    if (sysInput) sysInput.value = p.currentStock || 0;
    if (phyInput) phyInput.value = p.currentStock || 0;
    if (p.location && locSelect) locSelect.value = p.location;
    window.updateAdjustmentVariance();
  }
};

window.updateAdjustmentVariance = function() {
  const prodId = document.getElementById('adj-product')?.value;
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const sys = parseInt(document.getElementById('adj-sys-qty')?.value || '0', 10);
  const phy = parseInt(document.getElementById('adj-phy-qty')?.value || '0', 10);
  const diff = isNaN(phy) ? 0 : phy - sys;
  const cost = p ? (p.costPrice || 0) : 0;
  const financialImpact = diff * cost;

  const diffEl = document.getElementById('adj-diff-val');
  const badgeEl = document.getElementById('adj-action-badge');
  const financialEl = document.getElementById('adj-financial-impact');

  if (!diffEl || !badgeEl) return;

  if (financialEl) {
    financialEl.innerHTML = `Valuation Impact: <strong style="color: ${diff > 0 ? 'var(--success)' : (diff < 0 ? 'var(--danger)' : 'var(--text-main)')};">${diff >= 0 ? '+' : '-'}$${Math.abs(financialImpact).toFixed(2)}</strong>`;
  }

  if (diff > 0) {
    diffEl.textContent = `+${diff} Units`;
    diffEl.style.color = 'var(--success)';
    badgeEl.innerHTML = `<span class="badge badge-in-stock">ADJUSTMENT_IN (+${diff} SURPLUS)</span>`;
  } else if (diff < 0) {
    diffEl.textContent = `${diff} Units`;
    diffEl.style.color = 'var(--danger)';
    badgeEl.innerHTML = `<span class="badge badge-out-of-stock">ADJUSTMENT_OUT (${diff} DEFICIT)</span>`;
  } else {
    diffEl.textContent = `0 Units`;
    diffEl.style.color = 'var(--text-muted)';
    badgeEl.innerHTML = `<span class="badge badge-neutral">BALANCED (NO DISCREPANCY)</span>`;
  }
};

window.resetAdjustmentForm = function() {
  setTimeout(() => {
    window.updateAdjustmentVariance();
  }, 50);
};

// --------------------------------------------------------------------------
// Stock Adjustment Submission
// --------------------------------------------------------------------------
window.submitStockAdjustment = async function() {
  const prodId = document.getElementById('adj-product')?.value;
  const p = SAMPLE_PRODUCTS.find(item => item.id === prodId);
  const sys = parseInt(document.getElementById('adj-sys-qty')?.value || '0', 10);
  const phy = parseInt(document.getElementById('adj-phy-qty')?.value || '0', 10);
  const reason = document.getElementById('adj-reason')?.value;
  const refNo = document.getElementById('adj-ref')?.value.trim();
  const location = document.getElementById('adj-location')?.value;
  const dateVal = document.getElementById('adj-date')?.value || new Date().toISOString().slice(0, 10);
  const notes = document.getElementById('adj-notes')?.value.trim();

  if (!p || isNaN(phy) || !reason || !refNo || !location) {
    window.showToast('Please specify target product, physical verified count, reason, and location.', 'error');
    return;
  }

  const diff = phy - sys;
  if (diff === 0) {
    window.showToast('Physical count matches system balance exactly. No variance to post.', 'info');
    return;
  }

  const txnType = diff > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
  const qty = Math.abs(diff);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const fullDateTime = `${dateVal} ${nowTime}`;
  const txnId = `TXN-ADJ-${Date.now().toString().slice(-6)}`;
  const totalVal = qty * p.costPrice;

  const payload = {
    id: txnId,
    date: fullDateTime,
    type: txnType,
    refNo,
    productId: p.id,
    sku: p.sku,
    productName: p.name,
    quantity: qty,
    unitCost: p.costPrice,
    totalValue: totalVal,
    location,
    supplier: '-',
    department: 'Inventory Control',
    reason,
    user: auth.getUser()?.fullName || 'Alex Thorne',
    notes: notes || 'Cycle Count Variance Reconciliation'
  };

  // Live Google Apps Script API sync
  if (api.isConfigured()) {
    try {
      window.showToast('Posting Stock Adjustment to Google Sheets...', 'info');
      await api.request('createStockAdjustment', {
        method: 'POST',
        data: {
          productId: p.id,
          physicalQuantity: phy,
          reason,
          refNo,
          location,
          notes
        },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API createStockAdjustment failed, keeping local memory:', e);
    }
  }

  // Update in-memory state
  SAMPLE_TRANSACTIONS.unshift(payload);

  // Directly update physical stock balance
  p.currentStock = phy;
  if (p.currentStock === 0) {
    p.stockStatus = 'OUT OF STOCK';
  } else if (p.currentStock <= p.minStock) {
    p.stockStatus = 'LOW STOCK';
  } else {
    p.stockStatus = 'IN STOCK';
  }

  // Record Audit Log
  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'STOCK_ADJUSTMENT',
    module: 'Stock Adjustment',
    recordId: txnId,
    description: `Reconciled ${p.name} from ${sys} to ${phy} (${diff > 0 ? '+' : ''}${diff}) — ${reason}`
  });

  window.showToast(`Stock Adjustment ${refNo} posted. Balance reconciled to ${phy} ${p.unit}.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAdjustment();
};

// --------------------------------------------------------------------------
// Adjustment Voucher Modal
// --------------------------------------------------------------------------
window.viewAdjustmentVoucher = function(txnId) {
  const t = SAMPLE_TRANSACTIONS.find(item => item.id === txnId);
  if (!t) return;

  const isSurplus = t.type === 'ADJUSTMENT_IN';
  const totalVal = t.totalValue || (t.quantity * (t.unitCost || 0));

  window.openModal({
    title: `Stock Adjustment Voucher: ${t.refNo || t.id}`,
    body: `
      <div id="printable-adj-voucher" style="padding: 10px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${isSurplus ? 'var(--success)' : 'var(--warning)'}; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Inventory Cycle Count & Reconciliation Certificate</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">ADJUSTMENT VOUCHER</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Metadata -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Audit Reference No:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Audit Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Storage Location:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location || 'Central Storage'}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Variance Direction:</span>
            <div><span class="badge ${isSurplus ? 'badge-in-stock' : 'badge-out-of-stock'}">${isSurplus ? '+ SURPLUS INTAKE' : '- DEFICIT WRITE-OFF'}</span></div>
          </div>
        </div>

        <!-- Line Item Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Product Description</th>
                <th style="text-align: right;">Variance Qty</th>
                <th style="text-align: right;">Unit Cost</th>
                <th style="text-align: right;">Financial Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 800; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'}; font-size: 14px;">
                  ${isSurplus ? '+' : '-'}${t.quantity}
                </td>
                <td style="text-align: right;">$${Number(t.unitCost || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 800; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'};">
                  ${isSurplus ? '+' : '-'}$${totalVal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Justification Notes -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Auditor Finding & Root Cause:</strong> ${t.reason || 'Cycle count discrepancy'}. ${t.notes || ''}
        </div>

        <!-- Dual Signature Blocks -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Auditor / Physical Count Verified By:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user || 'Stock Auditor'}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Warehouse Manager Approval:</div>
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
window.handleAdjustmentSearch = function(val) {
  adjustmentFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAdjustment();
};

window.handleAdjustmentLocationFilter = function(val) {
  adjustmentFilter.location = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAdjustment();
};

window.handleAdjustmentTypeFilter = function(val) {
  adjustmentFilter.type = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderAdjustment();
};

window.exportAdjustmentCSV = function() {
  const adjs = SAMPLE_TRANSACTIONS.filter(t => t.type === 'ADJUSTMENT_IN' || t.type === 'ADJUSTMENT_OUT');
  if (adjs.length === 0) {
    window.showToast('No adjustment records to export.', 'info');
    return;
  }

  const headers = ['Transaction_ID', 'Date', 'Type', 'Reference_No', 'SKU', 'Product_Name', 'Variance_Quantity', 'Unit_Cost', 'Financial_Impact', 'Location', 'Reason', 'Auditor', 'Notes'];
  const rows = adjs.map(t => [
    t.id,
    `"${t.date}"`,
    t.type,
    `"${t.refNo}"`,
    `"${t.sku}"`,
    `"${(t.productName || '').replace(/"/g, '""')}"`,
    t.type === 'ADJUSTMENT_IN' ? t.quantity : -t.quantity,
    Number(t.unitCost || 0).toFixed(2),
    Number(t.totalValue || (t.quantity * (t.unitCost || 0))).toFixed(2),
    `"${(t.location || '').replace(/"/g, '""')}"`,
    `"${(t.reason || '').replace(/"/g, '""')}"`,
    `"${(t.user || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Stock_Adjustments_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.showToast('Adjustment audit records exported to CSV successfully.', 'success');
};
