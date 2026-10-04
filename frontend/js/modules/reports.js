import { SAMPLE_PRODUCTS, SAMPLE_TRANSACTIONS, SAMPLE_CATEGORIES, SAMPLE_LOCATIONS, SAMPLE_SUPPLIERS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let activeReportType = 'VALUATION_REPORT'; // VALUATION_REPORT, MOVEMENT_LEDGER, REORDER_REPORT, SUPPLIER_REPORT, CURRENT_INVENTORY

let reportFilters = {
  search: '',
  dateFrom: '',
  dateTo: new Date().toISOString().slice(0, 10),
  category: 'ALL',
  location: 'ALL',
  supplier: 'ALL',
  stockStatus: 'ALL',
  movementType: 'ALL',
  urgency: 'ALL'
};

// Set default dateFrom to 30 days ago
const d30 = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
reportFilters.dateFrom = d30.toISOString().slice(0, 10);

/**
 * Main View Renderer
 */
export function renderReports() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const reportTabs = [
    { id: 'VALUATION_REPORT', name: 'Stock Valuation', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'MOVEMENT_LEDGER', name: 'Movement Ledger', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
    { id: 'REORDER_REPORT', name: 'Low Stock Reorder Plan', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'SUPPLIER_REPORT', name: 'Supplier Procurement', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'CURRENT_INVENTORY', name: 'Master Stock Balances', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }
  ];

  return `
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>Corporate Reports & Analytics</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 14 Active</span>
        </div>
        <p>Audit-grade inventory valuation, movement ledgers, replenishment schedules, and vendor analytics.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.printReport()" title="Print current report view">
          <svg viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Report
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.exportActiveReportCSV()" title="Export clean structured CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Report Type Tab Navigation -->
    <div class="card report-tab-bar" style="margin-bottom: 20px; padding: 6px; background: var(--surface);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${reportTabs.map(tab => {
          const isActive = activeReportType === tab.id;
          return `
            <button 
              class="btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm" 
              onclick="window.switchReportTab('${tab.id}')"
              style="padding: 8px 16px; border-radius: var(--radius-md); font-weight: ${isActive ? '700' : '500'};"
            >
              <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2;"><path d="${tab.icon}"/></svg>
              ${tab.name}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Active Report Summary KPIs & Filter Card -->
    ${renderReportFilterAndKpis()}

    <!-- Printable Report Card Container -->
    <div class="card" id="printable-report-area">
      <!-- Print Only Header -->
      <div class="print-only-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Apex Stock Management System</h1>
            <h2 style="font-size: 15px; font-weight: 600; color: #0057E7;">${getReportTitle(activeReportType)}</h2>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Generated: <strong>${todayStr}</strong></div>
            <div>Auditor: <strong>${auth.getUser()?.fullName || 'System User'}</strong> [${auth.getUser()?.role || 'VIEWER'}]</div>
          </div>
        </div>
      </div>

      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/></svg>
          ${getReportTitle(activeReportType)}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge badge-neutral" style="font-size: 11px;">As of ${todayStr}</span>
        </div>
      </div>

      <div class="table-responsive">
        ${renderActiveReportContent()}
      </div>
    </div>
  `;
}

function getReportTitle(type) {
  switch (type) {
    case 'VALUATION_REPORT': return 'Comprehensive Inventory Valuation Report';
    case 'MOVEMENT_LEDGER': return 'Stock Movement & Transaction Ledger';
    case 'REORDER_REPORT': return 'Low Stock & Replenishment Reorder Schedule';
    case 'SUPPLIER_REPORT': return 'Supplier Procurement & Fulfillment Performance';
    case 'CURRENT_INVENTORY': return 'Master Catalog & Physical Stock Balances';
    default: return 'Inventory Analytical Report';
  }
}

/**
 * Filter Bar & Summary KPIs by Report Type
 */
function renderReportFilterAndKpis() {
  if (activeReportType === 'VALUATION_REPORT') {
    const products = getFilteredValuationProducts();
    const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const totalCost = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.costPrice || 0)), 0);
    const totalRetail = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.sellingPrice || 0)), 0);
    const totalProfit = totalRetail - totalCost;
    const marginPct = totalRetail > 0 ? ((totalProfit / totalRetail) * 100) : 0;

    return `
      <!-- Valuation KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Catalog Items</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div></div>
          <div class="kpi-value">${products.length}</div>
          <div class="kpi-footer">Filtered lines</div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Physical Units</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></div></div>
          <div class="kpi-value">${totalUnits.toLocaleString()}</div>
          <div class="kpi-footer">Total inventory on hand</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Total Cost Value (FIFO)</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-footer"><span class="kpi-trend positive">Asset valuation</span></div>
        </div>
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Total Retail Valuation</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div></div>
          <div class="kpi-value">$${totalRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-footer">Potential turnover value</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Unrealized Margin</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div></div>
          <div class="kpi-value">${marginPct.toFixed(1)}%</div>
          <div class="kpi-footer">Profit: <strong>$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        </div>
      </div>

      <!-- Valuation Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Product / SKU / Barcode</label>
              <input type="text" class="form-input" placeholder="Search by name, SKU..." value="${reportFilters.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Category</label>
              <select class="form-select" onchange="window.setReportFilter('category', this.value)">
                <option value="ALL" ${reportFilters.category === 'ALL' ? 'selected' : ''}>All Categories</option>
                ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}" ${reportFilters.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Location</label>
              <select class="form-select" onchange="window.setReportFilter('location', this.value)">
                <option value="ALL" ${reportFilters.location === 'ALL' ? 'selected' : ''}>All Locations</option>
                ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}" ${reportFilters.location === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Stock Status</label>
              <select class="form-select" onchange="window.setReportFilter('stockStatus', this.value)">
                <option value="ALL" ${reportFilters.stockStatus === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="IN STOCK" ${reportFilters.stockStatus === 'IN STOCK' ? 'selected' : ''}>In Stock</option>
                <option value="LOW STOCK" ${reportFilters.stockStatus === 'LOW STOCK' ? 'selected' : ''}>Low Stock</option>
                <option value="OUT OF STOCK" ${reportFilters.stockStatus === 'OUT OF STOCK' ? 'selected' : ''}>Out of Stock</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeReportType === 'MOVEMENT_LEDGER') {
    const txns = getFilteredLedgerTxns();
    const inTxns = txns.filter(t => t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN');
    const outTxns = txns.filter(t => t.type === 'STOCK_OUT' || t.type === 'ADJUSTMENT_OUT');
    const inUnits = inTxns.reduce((acc, t) => acc + (t.quantity || 0), 0);
    const inVal = inTxns.reduce((acc, t) => acc + (t.totalValue || ((t.quantity || 0) * (t.unitCost || 0))), 0);
    const outUnits = outTxns.reduce((acc, t) => acc + (t.quantity || 0), 0);
    const outVal = outTxns.reduce((acc, t) => acc + (t.totalValue || ((t.quantity || 0) * (t.unitCost || 0))), 0);

    return `
      <!-- Ledger KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Transactions</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div></div>
          <div class="kpi-value">${txns.length}</div>
          <div class="kpi-footer">In selected timeframe</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Inbound Receipts</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg></div></div>
          <div class="kpi-value">+${inUnits.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
          <div class="kpi-footer">Valued at <strong>$${inVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-card-header"><span class="kpi-title">Outbound Dispatches</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg></div></div>
          <div class="kpi-value">-${outUnits.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
          <div class="kpi-footer">Valued at <strong>$${outVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Net Volume Delta</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg></div></div>
          <div class="kpi-value" style="color: ${inUnits >= outUnits ? 'var(--success-text)' : 'var(--danger-text)'};">
            ${inUnits >= outUnits ? '+' : ''}${(inUnits - outUnits).toLocaleString()}
          </div>
          <div class="kpi-footer">Net balance change</div>
        </div>
      </div>

      <!-- Ledger Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Ref / Product / User</label>
              <input type="text" class="form-input" placeholder="Search ref #, name..." value="${reportFilters.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Date From</label>
              <input type="date" class="form-input" value="${reportFilters.dateFrom}" onchange="window.setReportFilter('dateFrom', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Date To</label>
              <input type="date" class="form-input" value="${reportFilters.dateTo}" onchange="window.setReportFilter('dateTo', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Movement Type</label>
              <select class="form-select" onchange="window.setReportFilter('movementType', this.value)">
                <option value="ALL" ${reportFilters.movementType === 'ALL' ? 'selected' : ''}>All Types</option>
                <option value="STOCK_IN" ${reportFilters.movementType === 'STOCK_IN' ? 'selected' : ''}>Stock In</option>
                <option value="STOCK_OUT" ${reportFilters.movementType === 'STOCK_OUT' ? 'selected' : ''}>Stock Out</option>
                <option value="ADJUSTMENT_IN" ${reportFilters.movementType === 'ADJUSTMENT_IN' ? 'selected' : ''}>Adjustment In</option>
                <option value="ADJUSTMENT_OUT" ${reportFilters.movementType === 'ADJUSTMENT_OUT' ? 'selected' : ''}>Adjustment Out</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Facility</label>
              <select class="form-select" onchange="window.setReportFilter('location', this.value)">
                <option value="ALL" ${reportFilters.location === 'ALL' ? 'selected' : ''}>All Facilities</option>
                ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}" ${reportFilters.location === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeReportType === 'REORDER_REPORT') {
    const critical = getFilteredReorderProducts();
    const depleted = critical.filter(p => p.currentStock === 0);
    const lowStock = critical.filter(p => p.currentStock > 0);
    const totalCapital = critical.reduce((acc, p) => {
      const rec = Math.max(0, (p.maxStock || (p.minStock * 2)) - p.currentStock);
      return acc + (rec * (p.costPrice || 0));
    }, 0);

    return `
      <!-- Reorder KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-amber">
          <div class="kpi-card-header"><span class="kpi-title">Critical Lines</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div></div>
          <div class="kpi-value">${critical.length}</div>
          <div class="kpi-footer">Require procurement attention</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-card-header"><span class="kpi-title">Completely Depleted</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></div></div>
          <div class="kpi-value">${depleted.length}</div>
          <div class="kpi-footer"><span class="kpi-trend negative">Zero stock available</span></div>
        </div>
        <div class="kpi-card kpi-amber">
          <div class="kpi-card-header"><span class="kpi-title">Low Stock Warnings</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">${lowStock.length}</div>
          <div class="kpi-footer">At or below minimum limit</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Restock Capital Required</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-footer">To reach maximum stock capacity</div>
        </div>
      </div>

      <!-- Reorder Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Product / SKU</label>
              <input type="text" class="form-input" placeholder="Search product..." value="${reportFilters.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Depletion Severity</label>
              <select class="form-select" onchange="window.setReportFilter('urgency', this.value)">
                <option value="ALL" ${reportFilters.urgency === 'ALL' ? 'selected' : ''}>All Critical (0 & Low)</option>
                <option value="DEPLETED" ${reportFilters.urgency === 'DEPLETED' ? 'selected' : ''}>Out of Stock Only (0)</option>
                <option value="LOW" ${reportFilters.urgency === 'LOW' ? 'selected' : ''}>Low Stock Only (&gt; 0)</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Category</label>
              <select class="form-select" onchange="window.setReportFilter('category', this.value)">
                <option value="ALL" ${reportFilters.category === 'ALL' ? 'selected' : ''}>All Categories</option>
                ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}" ${reportFilters.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Supplier</label>
              <select class="form-select" onchange="window.setReportFilter('supplier', this.value)">
                <option value="ALL" ${reportFilters.supplier === 'ALL' ? 'selected' : ''}>All Suppliers</option>
                ${SAMPLE_SUPPLIERS.map(s => `<option value="${s.name}" ${reportFilters.supplier === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeReportType === 'SUPPLIER_REPORT') {
    const suppliers = getFilteredSupplierPerformance();
    const totalSpend = suppliers.reduce((acc, s) => acc + s.totalSpend, 0);
    const totalUnits = suppliers.reduce((acc, s) => acc + s.totalUnits, 0);
    const totalOrders = suppliers.reduce((acc, s) => acc + s.totalShipments, 0);

    return `
      <!-- Supplier KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Active Suppliers</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div></div>
          <div class="kpi-value">${suppliers.length}</div>
          <div class="kpi-footer">Approved vendors</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Total Procurement Spend</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-footer">Across all delivered POs</div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Total Units Procured</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div></div>
          <div class="kpi-value">${totalUnits.toLocaleString()}</div>
          <div class="kpi-footer">${totalOrders} total shipments received</div>
        </div>
      </div>

      <!-- Supplier Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Supplier Name / Contact Person</label>
              <input type="text" class="form-input" placeholder="Search vendor..." value="${reportFilters.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Status</label>
              <select class="form-select" onchange="window.setReportFilter('supplierStatus', this.value)">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE" selected>Active Vendors</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `;
  }

  // Fallback / Current Inventory filter
  return `
    <div class="card report-filter-card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search Product / SKU</label>
            <input type="text" class="form-input" placeholder="Search..." value="${reportFilters.search}" oninput="window.setReportFilter('search', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Category</label>
            <select class="form-select" onchange="window.setReportFilter('category', this.value)">
              <option value="ALL">All Categories</option>
              ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Location</label>
            <select class="form-select" onchange="window.setReportFilter('location', this.value)">
              <option value="ALL">All Locations</option>
              ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Filter data helper functions
 */
function getFilteredValuationProducts() {
  return SAMPLE_PRODUCTS.filter(p => {
    if (p.status === 'ARCHIVED') return false;
    const term = reportFilters.search.toLowerCase();
    const matchSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.includes(term));

    const matchCat = reportFilters.category === 'ALL' || p.category === reportFilters.category;
    const matchLoc = reportFilters.location === 'ALL' || p.location === reportFilters.location || p.locationId === reportFilters.location;
    const matchStock = reportFilters.stockStatus === 'ALL' || p.stockStatus === reportFilters.stockStatus;

    return matchSearch && matchCat && matchLoc && matchStock;
  });
}

function getFilteredLedgerTxns() {
  return SAMPLE_TRANSACTIONS.filter(t => {
    const term = reportFilters.search.toLowerCase();
    const matchSearch = !term ||
      (t.refNo && t.refNo.toLowerCase().includes(term)) ||
      (t.productName && t.productName.toLowerCase().includes(term)) ||
      (t.sku && t.sku.toLowerCase().includes(term)) ||
      (t.user && t.user.toLowerCase().includes(term));

    const dStr = String(t.date || '').slice(0, 10);
    const matchFrom = !reportFilters.dateFrom || dStr >= reportFilters.dateFrom;
    const matchTo = !reportFilters.dateTo || dStr <= reportFilters.dateTo;
    const matchType = reportFilters.movementType === 'ALL' || t.type === reportFilters.movementType;
    const matchLoc = reportFilters.location === 'ALL' || t.location === reportFilters.location;

    return matchSearch && matchFrom && matchTo && matchType && matchLoc;
  });
}

function getFilteredReorderProducts() {
  return SAMPLE_PRODUCTS.filter(p => {
    if (p.status === 'ARCHIVED') return false;
    if (p.currentStock > p.minStock) return false; // only critical

    const term = reportFilters.search.toLowerCase();
    const matchSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term);

    const matchCat = reportFilters.category === 'ALL' || p.category === reportFilters.category;
    const matchSup = reportFilters.supplier === 'ALL' || p.supplier === reportFilters.supplier;

    let matchUrgency = true;
    if (reportFilters.urgency === 'DEPLETED') matchUrgency = p.currentStock === 0;
    else if (reportFilters.urgency === 'LOW') matchUrgency = p.currentStock > 0;

    return matchSearch && matchCat && matchSup && matchUrgency;
  }).sort((a, b) => {
    if (a.currentStock === 0 && b.currentStock !== 0) return -1;
    if (b.currentStock === 0 && a.currentStock !== 0) return 1;
    const ratioA = a.minStock > 0 ? (a.currentStock / a.minStock) : 0;
    const ratioB = b.minStock > 0 ? (b.currentStock / b.minStock) : 0;
    return ratioA - ratioB;
  });
}

function getFilteredSupplierPerformance() {
  const inboundTxns = SAMPLE_TRANSACTIONS.filter(t => t.type === 'STOCK_IN');
  const term = reportFilters.search.toLowerCase();

  return SAMPLE_SUPPLIERS.filter(s => {
    const matchSearch = !term ||
      s.name.toLowerCase().includes(term) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(term));
    const matchStatus = !reportFilters.supplierStatus || reportFilters.supplierStatus === 'ALL' || s.status === reportFilters.supplierStatus;
    return matchSearch && matchStatus;
  }).map(s => {
    const vendorTxns = inboundTxns.filter(t => t.supplier === s.name);
    const vendorProducts = SAMPLE_PRODUCTS.filter(p => p.supplier === s.name && p.status !== 'ARCHIVED');

    let totalUnits = 0;
    let totalSpend = 0;
    let lastDate = '-';

    vendorTxns.forEach(t => {
      const q = Number(t.quantity) || 0;
      const v = Number(t.totalValue || (q * (t.unitCost || 0))) || 0;
      totalUnits += q;
      totalSpend += v;
      if (!lastDate || String(t.date) > lastDate) {
        lastDate = String(t.date).slice(0, 10);
      }
    });

    const avgPO = vendorTxns.length > 0 ? (totalSpend / vendorTxns.length) : 0;

    return {
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson || '-',
      phone: s.phone || '-',
      email: s.email || '-',
      status: s.status || 'ACTIVE',
      activeLines: vendorProducts.length,
      totalShipments: vendorTxns.length,
      totalUnits,
      totalSpend,
      avgOrderValue: avgPO,
      lastDeliveryDate: lastDate
    };
  }).sort((a, b) => b.totalSpend - a.totalSpend);
}

/**
 * Report Content Table Generator
 */
function renderActiveReportContent() {
  // 1. Stock Valuation Report Table
  if (activeReportType === 'VALUATION_REPORT') {
    const products = getFilteredValuationProducts();
    const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const totalCost = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.costPrice || 0)), 0);
    const totalRetail = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.sellingPrice || 0)), 0);
    const totalProfit = totalRetail - totalCost;
    const avgMargin = totalRetail > 0 ? ((totalProfit / totalRetail) * 100) : 0;

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Location</th>
            <th style="text-align: right;">Stock Count</th>
            <th style="text-align: right;">Unit Cost</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Cost Valuation</th>
            <th style="text-align: right;">Retail Valuation</th>
            <th style="text-align: right;">Margin %</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${products.length === 0 ? `
            <tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 32px;">No products match current criteria.</td></tr>
          ` : products.map(p => {
            const costVal = (p.currentStock || 0) * (p.costPrice || 0);
            const retailVal = (p.currentStock || 0) * (p.sellingPrice || 0);
            const profit = retailVal - costVal;
            const margin = retailVal > 0 ? ((profit / retailVal) * 100) : 0;
            return `
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${p.sku}</td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main);">${p.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${p.supplier || ''}</div>
                </td>
                <td><span class="badge badge-neutral">${p.category}</span></td>
                <td style="font-size: 12px; color: var(--text-muted);">${p.location || 'Central'}</td>
                <td style="text-align: right; font-weight: 700;">${p.currentStock} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">${p.unit}</span></td>
                <td style="text-align: right;">$${(p.costPrice || 0).toFixed(2)}</td>
                <td style="text-align: right; color: var(--text-muted);">$${(p.sellingPrice || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${costVal.toFixed(2)}</td>
                <td style="text-align: right; color: var(--text-muted);">$${retailVal.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 600; color: var(--success);">${margin.toFixed(1)}%</td>
                <td style="text-align: center;">
                  <span class="badge ${p.currentStock === 0 ? 'badge-out-of-stock' : p.currentStock <= p.minStock ? 'badge-low-stock' : 'badge-in-stock'}">
                    ${p.stockStatus}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="4" style="text-align: right; padding: 14px 16px;">Consolidated Portfolio Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">${totalUnits.toLocaleString()} units</td>
            <td colspan="2"></td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 14px;">
              $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="text-align: right; padding: 14px 16px; color: var(--text-main); font-size: 14px;">
              $${totalRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="text-align: right; padding: 14px 16px; color: var(--success); font-size: 14px;">
              ${avgMargin.toFixed(1)}%
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // 2. Movement Ledger Report Table
  if (activeReportType === 'MOVEMENT_LEDGER') {
    const txns = getFilteredLedgerTxns();
    const inUnits = txns.filter(t => t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const outUnits = txns.filter(t => t.type === 'STOCK_OUT' || t.type === 'ADJUSTMENT_OUT').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const totalVal = txns.reduce((acc, t) => acc + (t.totalValue || ((t.quantity || 0) * (t.unitCost || 0))), 0);

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Ref No</th>
            <th>Type</th>
            <th>Product Name / SKU</th>
            <th>Location</th>
            <th>Counterparty</th>
            <th style="text-align: right;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total Value</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          ${txns.length === 0 ? `
            <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px;">No transactions recorded within selected date and filter range.</td></tr>
          ` : txns.map(t => {
            const isPositive = t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN';
            return `
              <tr>
                <td style="font-size: 12px; color: var(--text-muted);">${t.date}</td>
                <td style="font-weight: 700; font-family: monospace;">${t.refNo}</td>
                <td>
                  <span class="badge ${
                    t.type === 'STOCK_IN' ? 'badge-in-stock' :
                    t.type === 'STOCK_OUT' ? 'badge-out-of-stock' : 'badge-low-stock'
                  }">
                    ${t.type.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${t.productName}</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${t.sku || ''}</div>
                </td>
                <td style="font-size: 12px; color: var(--text-muted);">${t.location || 'Central'}</td>
                <td style="font-size: 12px;">${t.supplier || t.destination || t.recipient || 'Internal'}</td>
                <td style="text-align: right; font-weight: 700; color: ${isPositive ? 'var(--success-text)' : 'var(--danger-text)'};">
                  ${isPositive ? '+' : '-'}${t.quantity}
                </td>
                <td style="text-align: right;">$${(t.unitCost || t.unitPrice || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">$${(t.totalValue || ((t.quantity || 0) * (t.unitCost || 0))).toFixed(2)}</td>
                <td style="font-size: 12px; color: var(--text-muted);">${t.user || 'System'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="6" style="text-align: right; padding: 14px 16px;">Ledger Range Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">
              <span style="color: var(--success); font-weight: 700;">+${inUnits} In</span> / 
              <span style="color: var(--danger); font-weight: 700;">-${outUnits} Out</span>
            </td>
            <td></td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 14px;">
              $${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // 3. Low Stock & Reorder Plan Table
  if (activeReportType === 'REORDER_REPORT') {
    const critical = getFilteredReorderProducts();
    const totalCapital = critical.reduce((acc, p) => {
      const rec = Math.max(0, (p.maxStock || (p.minStock * 2)) - p.currentStock);
      return acc + (rec * (p.costPrice || 0));
    }, 0);

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Primary Supplier</th>
            <th style="text-align: right;">Current Stock</th>
            <th style="text-align: right;">Min Stock</th>
            <th style="text-align: right;">Max Target</th>
            <th style="text-align: right;">Deficit</th>
            <th style="text-align: right;">Recommended Reorder</th>
            <th style="text-align: right;">Estimated Cost</th>
            <th style="text-align: center;">Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${critical.length === 0 ? `
            <tr><td colspan="12" style="text-align: center; color: var(--success); font-weight: 600; padding: 32px;">✓ All inventory items are adequately stocked above minimum thresholds.</td></tr>
          ` : critical.map(p => {
            const deficit = Math.max(0, p.minStock - p.currentStock);
            const target = p.maxStock || (p.minStock * 2);
            const recommended = Math.max(deficit, target - p.currentStock);
            const cost = recommended * (p.costPrice || 0);

            return `
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${p.sku}</td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${p.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${p.location || 'Central'}</div>
                </td>
                <td><span class="badge badge-neutral">${p.category}</span></td>
                <td style="font-size: 12.5px; font-weight: 500;">${p.supplier || 'Unassigned'}</td>
                <td style="text-align: right; font-weight: 700; color: ${p.currentStock === 0 ? 'var(--danger)' : 'var(--warning-dark)'};">
                  ${p.currentStock} ${p.unit}
                </td>
                <td style="text-align: right; color: var(--text-muted);">${p.minStock}</td>
                <td style="text-align: right; color: var(--text-muted);">${target}</td>
                <td style="text-align: right; font-weight: 600; color: var(--danger);">${deficit > 0 ? `-${deficit}` : '0'}</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">
                  <strong>+${recommended}</strong> ${p.unit}
                </td>
                <td style="text-align: right; font-weight: 700;">$${cost.toFixed(2)}</td>
                <td style="text-align: center;">
                  <span class="badge ${p.currentStock === 0 ? 'badge-out-of-stock' : 'badge-low-stock'}">
                    ${p.stockStatus}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-primary btn-sm" onclick="window.reorderReportItem('${p.id}', ${recommended})" title="Open Stock In with recommended intake">
                    Reorder
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="8" style="text-align: right; padding: 14px 16px;">Total Estimated Reorder Procurement Capital:</td>
            <td colspan="2" style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 15px;">
              $${totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // 4. Supplier Performance Report Table
  if (activeReportType === 'SUPPLIER_REPORT') {
    const suppliers = getFilteredSupplierPerformance();
    const totalSpend = suppliers.reduce((acc, s) => acc + s.totalSpend, 0);
    const totalUnits = suppliers.reduce((acc, s) => acc + s.totalUnits, 0);
    const totalShipments = suppliers.reduce((acc, s) => acc + s.totalShipments, 0);

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Contact Person</th>
            <th>Phone / Email</th>
            <th style="text-align: right;">Active Catalog Lines</th>
            <th style="text-align: right;">Purchase Orders</th>
            <th style="text-align: right;">Units Supplied</th>
            <th style="text-align: right;">Total Spend ($)</th>
            <th style="text-align: right;">Avg PO Value</th>
            <th>Last Shipment</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${suppliers.length === 0 ? `
            <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px;">No supplier records found.</td></tr>
          ` : suppliers.map(s => `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${s.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${s.id}</div>
              </td>
              <td style="font-weight: 500;">${s.contactPerson}</td>
              <td>
                <div style="font-size: 12px; color: var(--text-main);">${s.phone}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${s.email}</div>
              </td>
              <td style="text-align: right; font-weight: 600;">${s.activeLines} lines</td>
              <td style="text-align: right; font-weight: 600;">${s.totalShipments} POs</td>
              <td style="text-align: right; font-weight: 700; color: var(--primary);">${s.totalUnits.toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${s.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align: right; color: var(--text-muted);">$${s.avgOrderValue.toFixed(2)}</td>
              <td style="font-size: 12px; color: var(--text-muted);">${s.lastDeliveryDate}</td>
              <td style="text-align: center;">
                <span class="badge ${s.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}">
                  ${s.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="4" style="text-align: right; padding: 14px 16px;">Vendor Portfolio Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">${totalShipments} POs</td>
            <td style="text-align: right; padding: 14px 16px;">${totalUnits.toLocaleString()} units</td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 15px;">
              $${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // 5. Default: Master Stock Balances Table
  const products = getFilteredValuationProducts();
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Location</th>
          <th style="text-align: right;">Current Stock</th>
          <th style="text-align: right;">Min Stock</th>
          <th style="text-align: right;">Max Stock</th>
          <th style="text-align: right;">Unit Cost</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${p.sku}</td>
            <td style="font-weight: 600;">${p.name}</td>
            <td><span class="badge badge-neutral">${p.category}</span></td>
            <td>${p.location}</td>
            <td style="text-align: right; font-weight: 700;">${p.currentStock} ${p.unit}</td>
            <td style="text-align: right; color: var(--text-muted);">${p.minStock}</td>
            <td style="text-align: right; color: var(--text-muted);">${p.maxStock}</td>
            <td style="text-align: right;">$${(p.costPrice || 0).toFixed(2)}</td>
            <td style="text-align: right;">$${(p.sellingPrice || 0).toFixed(2)}</td>
            <td style="text-align: center;"><span class="badge ${p.stockStatus === 'IN STOCK' ? 'badge-in-stock' : p.stockStatus === 'LOW STOCK' ? 'badge-low-stock' : 'badge-out-of-stock'}">${p.stockStatus}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// --------------------------------------------------------------------------
// Interactive Report Actions & Global Window Hooks
// --------------------------------------------------------------------------

/**
 * Switch active report tab
 */
window.switchReportTab = function(type) {
  activeReportType = type;
  // Reset search filter upon tab change for clean view
  reportFilters.search = '';
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderReports();
};

/**
 * Update a report filter property
 */
window.setReportFilter = function(key, val) {
  reportFilters[key] = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderReports();
};

/**
 * Reset report filters
 */
window.resetReportFilters = function() {
  reportFilters = {
    search: '',
    dateFrom: d30.toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    category: 'ALL',
    location: 'ALL',
    supplier: 'ALL',
    stockStatus: 'ALL',
    movementType: 'ALL',
    urgency: 'ALL'
  };
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderReports();
};

/**
 * 1-Click Reorder from Reorder Plan Report
 */
window.reorderReportItem = function(productId, suggestedQty) {
  window.router.navigate('stock-in');
  setTimeout(() => {
    const sel = document.getElementById('in-product');
    if (sel) {
      sel.value = productId;
      window.handleStockInProductChange?.(productId);
      const qtyInput = document.getElementById('in-qty');
      if (qtyInput) {
        qtyInput.value = suggestedQty || 50;
        window.updateStockInCalc?.();
        qtyInput.focus();
      }
    }
    window.showToast('Product and reorder volume pre-populated for intake.', 'info');
  }, 100);
};

/**
 * Print Report View
 */
window.printReport = function() {
  window.print();
};

/**
 * Export Active Report to Structured CSV
 */
window.exportActiveReportCSV = function() {
  const nowStr = new Date().toISOString().slice(0, 10);
  let rows = [];

  rows.push(['Apex Stock Management System - Official Report']);
  rows.push(['Report Type', getReportTitle(activeReportType)]);
  rows.push(['Generated On', new Date().toISOString()]);
  rows.push(['Generated By', `${auth.getUser()?.fullName || 'System User'} (${auth.getUser()?.role || 'VIEWER'})`]);
  rows.push([]);

  // 1. Valuation Report Export
  if (activeReportType === 'VALUATION_REPORT') {
    const products = getFilteredValuationProducts();
    rows.push(['SKU', 'Product Name', 'Category', 'Location', 'Current Stock', 'Unit', 'Cost Price', 'Selling Price', 'Cost Valuation', 'Retail Valuation', 'Unrealized Profit', 'Margin %', 'Status']);

    products.forEach(p => {
      const costVal = (p.currentStock || 0) * (p.costPrice || 0);
      const retailVal = (p.currentStock || 0) * (p.sellingPrice || 0);
      const profit = retailVal - costVal;
      const margin = retailVal > 0 ? ((profit / retailVal) * 100) : 0;
      rows.push([
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.location || 'Central',
        p.currentStock,
        p.unit,
        (p.costPrice || 0).toFixed(2),
        (p.sellingPrice || 0).toFixed(2),
        costVal.toFixed(2),
        retailVal.toFixed(2),
        profit.toFixed(2),
        `${margin.toFixed(1)}%`,
        p.stockStatus
      ]);
    });
  }

  // 2. Movement Ledger Report Export
  else if (activeReportType === 'MOVEMENT_LEDGER') {
    const txns = getFilteredLedgerTxns();
    rows.push(['Date & Time', 'Ref No', 'Type', 'SKU', 'Product Name', 'Location', 'Counterparty', 'Quantity', 'Unit Cost', 'Total Value', 'User']);

    txns.forEach(t => {
      const isPos = t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN';
      rows.push([
        t.date,
        t.refNo,
        t.type,
        t.sku || '',
        `"${t.productName.replace(/"/g, '""')}"`,
        t.location || 'Central',
        `"${(t.supplier || t.destination || t.recipient || 'Internal').replace(/"/g, '""')}"`,
        `${isPos ? '+' : '-'}${t.quantity}`,
        (t.unitCost || 0).toFixed(2),
        (t.totalValue || ((t.quantity || 0) * (t.unitCost || 0))).toFixed(2),
        t.user || 'System'
      ]);
    });
  }

  // 3. Reorder Plan Report Export
  else if (activeReportType === 'REORDER_REPORT') {
    const critical = getFilteredReorderProducts();
    rows.push(['SKU', 'Product Name', 'Category', 'Primary Supplier', 'Location', 'Current Stock', 'Min Stock', 'Max Target', 'Deficit', 'Recommended Reorder', 'Unit Cost', 'Estimated Restock Cost', 'Status']);

    critical.forEach(p => {
      const deficit = Math.max(0, p.minStock - p.currentStock);
      const target = p.maxStock || (p.minStock * 2);
      const recommended = Math.max(deficit, target - p.currentStock);
      const cost = recommended * (p.costPrice || 0);
      rows.push([
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        `"${(p.supplier || 'Unassigned').replace(/"/g, '""')}"`,
        p.location || 'Central',
        p.currentStock,
        p.minStock,
        target,
        deficit,
        recommended,
        (p.costPrice || 0).toFixed(2),
        cost.toFixed(2),
        p.stockStatus
      ]);
    });
  }

  // 4. Supplier Performance Report Export
  else if (activeReportType === 'SUPPLIER_REPORT') {
    const suppliers = getFilteredSupplierPerformance();
    rows.push(['Supplier ID', 'Supplier Name', 'Contact Person', 'Phone', 'Email', 'Active Catalog Lines', 'Total Purchase Orders', 'Total Units Supplied', 'Total Spend ($)', 'Avg PO Value ($)', 'Last Delivery Date', 'Status']);

    suppliers.forEach(s => {
      rows.push([
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.contactPerson.replace(/"/g, '""')}"`,
        s.phone,
        s.email,
        s.activeLines,
        s.totalShipments,
        s.totalUnits,
        s.totalSpend.toFixed(2),
        s.avgOrderValue.toFixed(2),
        s.lastDeliveryDate,
        s.status
      ]);
    });
  }

  // 5. Master Stock Balances Export
  else {
    const products = getFilteredValuationProducts();
    rows.push(['SKU', 'Product Name', 'Category', 'Location', 'Current Stock', 'Min Stock', 'Max Stock', 'Cost Price', 'Selling Price', 'Status']);
    products.forEach(p => {
      rows.push([
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.location,
        p.currentStock,
        p.minStock,
        p.maxStock,
        (p.costPrice || 0).toFixed(2),
        (p.sellingPrice || 0).toFixed(2),
        p.stockStatus
      ]);
    });
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${activeReportType}_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast(`${getReportTitle(activeReportType)} CSV exported successfully.`, 'success');
};
