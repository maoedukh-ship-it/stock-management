import { SAMPLE_PRODUCTS, SAMPLE_TRANSACTIONS, SAMPLE_CATEGORIES, SAMPLE_LOCATIONS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let isRefreshing = false;

/**
 * Calculates live dashboard analytics from memory state or active Google Sheets data
 */
export function getDashboardMetrics() {
  const activeProducts = SAMPLE_PRODUCTS.filter(p => p.status !== 'ARCHIVED');
  const allTxns = SAMPLE_TRANSACTIONS;

  let totalProducts = activeProducts.length;
  let totalCatalogCount = SAMPLE_PRODUCTS.length;
  let totalCurrentStock = 0;
  let totalInventoryValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let healthyStockCount = 0;

  activeProducts.forEach(p => {
    const stock = Number(p.currentStock) || 0;
    const cost = Number(p.costPrice) || 0;
    const sell = Number(p.sellingPrice) || 0;

    totalCurrentStock += stock;
    totalInventoryValue += (stock * cost);
    totalRetailValue += (stock * sell);

    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= p.minStock) {
      lowStockCount++;
    } else {
      healthyStockCount++;
    }
  });

  const grossProfit = totalRetailValue - totalInventoryValue;
  const marginPct = totalRetailValue > 0 ? ((grossProfit / totalRetailValue) * 100) : 0;

  // Today & This Month movements
  const todayStr = new Date().toISOString().slice(0, 10);
  const thisMonthStr = new Date().toISOString().slice(0, 7);

  let stockInTodayQty = 0;
  let stockInTodayVal = 0;
  let stockOutTodayQty = 0;
  let stockOutTodayVal = 0;

  let stockInMonthQty = 0;
  let stockInMonthVal = 0;
  let stockOutMonthQty = 0;
  let stockOutMonthVal = 0;

  allTxns.forEach(t => {
    const txDate = String(t.date || '').slice(0, 10);
    const txMonth = String(t.date || '').slice(0, 7);
    const qty = Number(t.quantity) || 0;
    const val = Number(t.totalValue || (qty * (t.unitCost || t.unitPrice || 0))) || 0;

    if (txDate === todayStr) {
      if (t.type === 'STOCK_IN') {
        stockInTodayQty += qty;
        stockInTodayVal += val;
      } else if (t.type === 'STOCK_OUT') {
        stockOutTodayQty += qty;
        stockOutTodayVal += val;
      }
    }

    if (txMonth === thisMonthStr) {
      if (t.type === 'STOCK_IN') {
        stockInMonthQty += qty;
        stockInMonthVal += val;
      } else if (t.type === 'STOCK_OUT') {
        stockOutMonthQty += qty;
        stockOutMonthVal += val;
      }
    }
  });

  // Calculate dynamic 7-Day movement trend
  const now = new Date();
  const last7Days = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = targetDate.toISOString().slice(0, 10);
    const label = `${monthNames[targetDate.getMonth()]} ${String(targetDate.getDate()).padStart(2, '0')}`;

    let inQty = 0;
    let outQty = 0;

    allTxns.forEach(t => {
      const dStr = String(t.date || '').slice(0, 10);
      if (dStr === dateStr) {
        if (t.type === 'STOCK_IN') inQty += (Number(t.quantity) || 0);
        else if (t.type === 'STOCK_OUT') outQty += (Number(t.quantity) || 0);
      }
    });

    last7Days.push({
      dateStr,
      label,
      inQty,
      outQty,
      net: inQty - outQty
    });
  }

  // Calculate Category Distribution
  const catMap = {};
  SAMPLE_CATEGORIES.forEach(c => {
    catMap[c.name] = { name: c.name, units: 0, count: 0, value: 0 };
  });

  activeProducts.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!catMap[cat]) {
      catMap[cat] = { name: cat, units: 0, count: 0, value: 0 };
    }
    const s = Number(p.currentStock) || 0;
    catMap[cat].units += s;
    catMap[cat].count += 1;
    catMap[cat].value += (s * (Number(p.costPrice) || 0));
  });

  const categoryDistribution = Object.values(catMap)
    .filter(c => c.count > 0 || c.units > 0)
    .map(c => ({
      ...c,
      percentage: totalCurrentStock > 0 ? Number(((c.units / totalCurrentStock) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.units - a.units);

  // Facility / Location Breakdown
  const locMap = {};
  SAMPLE_LOCATIONS.forEach(l => {
    locMap[l.name] = { name: l.name, type: l.type, units: 0, count: 0, value: 0 };
  });

  activeProducts.forEach(p => {
    const loc = p.location || p.locationId || 'Main Warehouse';
    if (!locMap[loc]) {
      locMap[loc] = { name: loc, type: 'Storage', units: 0, count: 0, value: 0 };
    }
    const s = Number(p.currentStock) || 0;
    locMap[loc].units += s;
    locMap[loc].count += 1;
    locMap[loc].value += (s * (Number(p.costPrice) || 0));
  });

  const locationDistribution = Object.values(locMap)
    .filter(l => l.count > 0 || l.units > 0)
    .map(l => ({
      ...l,
      percentage: totalCurrentStock > 0 ? Number(((l.units / totalCurrentStock) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.units - a.units);

  // Low Stock & Depletion Warnings (Sorted by urgency)
  const lowStockItems = activeProducts
    .filter(p => p.currentStock <= p.minStock)
    .sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock !== 0) return -1;
      if (b.currentStock === 0 && a.currentStock !== 0) return 1;
      const ratioA = a.minStock > 0 ? (a.currentStock / a.minStock) : 0;
      const ratioB = b.minStock > 0 ? (b.currentStock / b.minStock) : 0;
      return ratioA - ratioB;
    });

  return {
    kpis: {
      totalProducts,
      totalCatalogCount,
      totalCurrentStock,
      totalInventoryValue,
      totalRetailValue,
      grossProfit,
      marginPct,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
      stockInToday: { quantity: stockInTodayQty, value: stockInTodayVal },
      stockOutToday: { quantity: stockOutTodayQty, value: stockOutTodayVal },
      stockInMonth: { quantity: stockInMonthQty, value: stockInMonthVal },
      stockOutMonth: { quantity: stockOutMonthQty, value: stockOutMonthVal }
    },
    last7Days,
    categoryDistribution,
    locationDistribution,
    lowStockItems,
    recentTransactions: allTxns.slice(0, 8)
  };
}

/**
 * Generate Dynamic SVG Line & Bar Composite Movement Chart
 */
function renderMovementChartSvg(trendData) {
  // Determine chart maximum for auto-scaling
  const maxIn = Math.max(...trendData.map(d => d.inQty), 0);
  const maxOut = Math.max(...trendData.map(d => d.outQty), 0);
  const maxMovement = Math.max(maxIn, maxOut, 50);
  // Round up to nice number
  const yMax = Math.ceil(maxMovement / 50) * 50;
  const yMid = Math.round(yMax / 2);
  const yQuarter = Math.round(yMax / 4);
  const yThreeQuarter = Math.round(yMax * 0.75);

  const width = 620;
  const height = 210;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 35;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const getY = (val) => padTop + chartHeight - ((val / yMax) * chartHeight);
  const getX = (idx) => padLeft + (idx * (chartWidth / (trendData.length - 1)));

  // Build stock in path points
  const points = trendData.map((d, i) => ({
    x: getX(i),
    y: getY(d.inQty),
    inQty: d.inQty,
    outQty: d.outQty,
    label: d.label,
    dateStr: d.dateStr
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

  // Bar width and offset for stock out
  const barWidth = 14;

  const totalIn7Days = trendData.reduce((acc, d) => acc + d.inQty, 0);
  const totalOut7Days = trendData.reduce((acc, d) => acc + d.outQty, 0);

  return `
    <div style="width: 100%; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; color: var(--text-muted);">
        <div>
          7-Day Movement: 
          <strong style="color: var(--primary);">+${totalIn7Days} In</strong> / 
          <strong style="color: var(--danger);">-${totalOut7Days} Out</strong> 
          <span style="margin-left: 6px; font-weight: 600; color: ${totalIn7Days >= totalOut7Days ? 'var(--success)' : 'var(--warning)'};">
            (Net: ${totalIn7Days >= totalOut7Days ? '+' : ''}${totalIn7Days - totalOut7Days} units)
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: var(--primary); border-radius: 50%;"></span>
            <span>Inbound Receipts</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: var(--danger); border-radius: 2px;"></span>
            <span>Outbound Dispatches</span>
          </div>
        </div>
      </div>

      <div style="height: 220px; width: 100%;">
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" id="dashboard-movement-svg">
          <defs>
            <linearGradient id="dashBlueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0057E7" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#0057E7" stop-opacity="0.01"/>
            </linearGradient>
            <filter id="chartDropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0057E7" flood-opacity="0.2"/>
            </filter>
          </defs>

          <!-- Grid Lines -->
          <line x1="${padLeft}" y1="${getY(yMax)}" x2="${width - padRight}" y2="${getY(yMax)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${padLeft}" y1="${getY(yThreeQuarter)}" x2="${width - padRight}" y2="${getY(yThreeQuarter)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${padLeft}" y1="${getY(yMid)}" x2="${width - padRight}" y2="${getY(yMid)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${padLeft}" y1="${getY(yQuarter)}" x2="${width - padRight}" y2="${getY(yQuarter)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${padLeft}" y1="${padTop + chartHeight}" x2="${width - padRight}" y2="${padTop + chartHeight}" stroke="#CBD5E1"/>

          <!-- Y Axis Labels -->
          <text x="${padLeft - 8}" y="${getY(yMax) + 4}" font-size="10" fill="#94A3B8" text-anchor="end">${yMax}</text>
          <text x="${padLeft - 8}" y="${getY(yMid) + 4}" font-size="10" fill="#94A3B8" text-anchor="end">${yMid}</text>
          <text x="${padLeft - 8}" y="${padTop + chartHeight + 4}" font-size="10" fill="#94A3B8" text-anchor="end">0</text>

          <!-- Stock Out Bars (Offset slightly to the left) -->
          ${trendData.map((d, i) => {
            const barH = (d.outQty / yMax) * chartHeight;
            const barX = getX(i) - (barWidth / 2);
            const barY = padTop + chartHeight - barH;
            return `
              <g class="chart-bar-group" data-date="${d.label}" data-out="${d.outQty}" data-in="${d.inQty}">
                <rect 
                  x="${barX}" 
                  y="${barY}" 
                  width="${barWidth}" 
                  height="${Math.max(barH, d.outQty > 0 ? 3 : 0)}" 
                  rx="3" 
                  fill="#EF4444" 
                  opacity="0.82"
                  style="transition: opacity 0.2s;"
                >
                  <title>${d.label}: Dispatched ${d.outQty} units</title>
                </rect>
              </g>
            `;
          }).join('')}

          <!-- Stock In Gradient Area & Stroke Line -->
          <path d="${areaPath}" fill="url(#dashBlueArea)"/>
          <path d="${linePath}" fill="none" stroke="#0057E7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#chartDropShadow)"/>

          <!-- Data Points & Day Labels -->
          ${points.map((p) => `
            <!-- X Axis Label -->
            <text x="${p.x}" y="${padTop + chartHeight + 18}" font-size="10.5" fill="#64748B" text-anchor="middle" font-weight="500">
              ${p.label}
            </text>

            <!-- Stock In Circle -->
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#0057E7" stroke="#FFFFFF" stroke-width="2" style="cursor: pointer;">
              <title>${p.label}: Received ${p.inQty} units</title>
            </circle>

            ${p.inQty > 0 ? `
              <text x="${p.x}" y="${p.y - 8}" font-size="9" fill="#0057E7" text-anchor="middle" font-weight="600">
                ${p.inQty}
              </text>
            ` : ''}
          `).join('')}
        </svg>
      </div>
    </div>
  `;
}

/**
 * Main View Renderer
 */
export function renderDashboard() {
  const user = auth.getUser();
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');
  const metrics = getDashboardMetrics();
  const k = metrics.kpis;

  const categoryColors = ['#0057E7', '#0284C7', '#F59E0B', '#22C55E', '#8B5CF6', '#EC4899', '#64748B'];

  return `
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>Executive Inventory Dashboard</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 13 Active</span>
        </div>
        <p>Real-time corporate overview of stock balance, valuation, and transaction movement.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" id="btn-refresh-dashboard" onclick="window.refreshDashboardData()" title="Synchronize latest inventory metrics">
          <svg viewBox="0 0 24 24" id="refresh-icon" style="${isRefreshing ? 'animation: spin 1s linear infinite;' : ''}"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          ${isRefreshing ? 'Syncing...' : 'Refresh Data'}
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.exportDashboardSummaryCSV()" title="Export executive overview to CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Summary
        </button>
        ${canManage ? `
          <button class="btn btn-secondary btn-sm" onclick="window.recalculateStockLedger()" title="Recalculate ledger equations">
            <svg viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Sync Ledger
          </button>
        ` : ''}
        <button class="btn btn-primary btn-sm" onclick="window.router.navigate('stock-in')">
          <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          New Stock In
        </button>
      </div>
    </div>

    <!-- 7 KPI Statistics Cards Row with Interactive Drill-Down Navigation -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));">
      
      <!-- 1. Total Products -->
      <div class="kpi-card kpi-blue" onclick="window.router.navigate('inventory')" style="cursor: pointer;" title="View all catalog items in Inventory">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog Products</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${k.totalProducts.toLocaleString()}</div>
        <div class="kpi-footer">
          <span class="kpi-trend positive">${k.healthyStockCount} in stock</span> • ${k.totalCatalogCount} total
        </div>
      </div>

      <!-- 2. Total Current Stock -->
      <div class="kpi-card kpi-cyan" onclick="window.router.navigate('inventory')" style="cursor: pointer;" title="View Inventory Balances">
        <div class="kpi-card-header">
          <span class="kpi-title">Current Stock</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${k.totalCurrentStock.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Across ${metrics.locationDistribution.length} facilities</div>
      </div>

      <!-- 3. Total Inventory Value (FIFO Cost) -->
      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Inventory Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">$${k.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="kpi-footer">
          <span class="kpi-trend positive">${k.marginPct.toFixed(1)}% margin</span> (Retail: $${k.totalRetailValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
        </div>
      </div>

      <!-- 4. Low Stock Items -->
      <div class="kpi-card kpi-amber" onclick="window.drillDownStockStatus('LOW STOCK')" style="cursor: pointer;" title="Filter Inventory to Low Stock items">
        <div class="kpi-card-header">
          <span class="kpi-title">Low Stock Items</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--warning-dark);">${k.lowStockCount}</div>
        <div class="kpi-footer">
          <span class="kpi-trend warning">Reorder required</span>
        </div>
      </div>

      <!-- 5. Out of Stock Items -->
      <div class="kpi-card kpi-red" onclick="window.drillDownStockStatus('OUT OF STOCK')" style="cursor: pointer;" title="Filter Inventory to Out of Stock items">
        <div class="kpi-card-header">
          <span class="kpi-title">Out of Stock</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--danger);">${k.outOfStockCount}</div>
        <div class="kpi-footer">
          <span class="kpi-trend negative">Critical depletion</span>
        </div>
      </div>

      <!-- 6. Stock In Today -->
      <div class="kpi-card kpi-green" onclick="window.router.navigate('stock-in')" style="cursor: pointer;" title="View Inbound Receipts">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock In Today</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
        </div>
        <div class="kpi-value">${k.stockInToday.quantity.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Valued at <strong>$${k.stockInToday.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      </div>

      <!-- 7. Stock Out Today -->
      <div class="kpi-card kpi-blue" onclick="window.router.navigate('stock-out')" style="cursor: pointer;" title="View Outbound Dispatches">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Out Today</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
        </div>
        <div class="kpi-value">${k.stockOutToday.quantity.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Valued at <strong>$${k.stockOutToday.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      </div>

    </div>

    <!-- Charts Row: 7-Day In vs Out Trend & Category Breakdown -->
    <div class="dashboard-grid-2">
      <!-- Stock Movement Composite Trend Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" stroke-width="2"/></svg>
            Stock Movement (7-Day In vs Out Trend)
          </div>
          <span class="badge badge-primary">Units / Day</span>
        </div>
        <div class="card-body">
          ${renderMovementChartSvg(metrics.last7Days)}
        </div>
      </div>

      <!-- Stock by Category Distribution -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" stroke="currentColor" stroke-width="2"/><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" stroke="currentColor" stroke-width="2"/></svg>
            Stock by Category
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('categories')">View All</button>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${metrics.categoryDistribution.slice(0, 5).map((cat, idx) => {
              const color = categoryColors[idx % categoryColors.length];
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px;">
                    <span style="font-weight: 600; color: var(--text-main);">${cat.name}</span>
                    <span style="color: var(--text-muted); font-size: 12px;">
                      <strong>${cat.units.toLocaleString()}</strong> units (${cat.percentage}%) • $${cat.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div style="height: 8px; background: var(--surface-alt); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${Math.max(cat.percentage, 2)}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}

            ${metrics.categoryDistribution.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 20px 0;">No category data available</div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Facility Warehouse Distribution Bar -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" stroke-width="2"/></svg>
          Warehouse & Storage Facilities Balance
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('locations')">Manage Facilities</button>
      </div>
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${metrics.locationDistribution.map((loc, idx) => `
            <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${loc.name}</span>
                <span class="badge badge-neutral" style="font-size: 11px;">${loc.type}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
                <span>${loc.count} catalog items</span>
                <span><strong>${loc.units.toLocaleString()}</strong> units (${loc.percentage}%)</span>
              </div>
              <div style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${Math.max(loc.percentage, 3)}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; text-align: right;">
                Valuation: <strong style="color: var(--text-main);">$${loc.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Tables Row: Low Stock Alerts & Recent Ledger -->
    <div class="dashboard-grid-equal">
      
      <!-- Low Stock & Depletion Warnings -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--warning);" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>
            Low Stock & Depletion Warnings
          </div>
          <span class="badge ${metrics.lowStockItems.length > 0 ? 'badge-low-stock' : 'badge-in-stock'}">
            ${metrics.lowStockItems.length} Critical Items
          </span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Current</th>
                <th>Min</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.lowStockItems.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                      <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: var(--success); fill: none; stroke-width: 2;"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <strong style="color: var(--text-main);">All Inventory Adequately Stocked</strong>
                      <span style="font-size: 12px;">No products are currently below their minimum threshold limits.</span>
                    </div>
                  </td>
                </tr>
              ` : metrics.lowStockItems.slice(0, 6).map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${item.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${item.sku} • ${item.category}</div>
                  </td>
                  <td>
                    <strong style="color: ${item.currentStock === 0 ? 'var(--danger)' : 'var(--warning-dark)'};">
                      ${item.currentStock}
                    </strong> 
                    <span style="font-size: 11px; color: var(--text-muted);">${item.unit}</span>
                  </td>
                  <td style="color: var(--text-muted); font-size: 12px;">${item.minStock}</td>
                  <td>
                    <span class="badge ${item.currentStock === 0 ? 'badge-out-of-stock' : 'badge-low-stock'}">
                      ${item.stockStatus}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm" onclick="window.reorderLowStockItem('${item.id}')" title="Initiate Stock In for ${item.sku}">
                      Reorder
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${metrics.lowStockItems.length > 6 ? `
          <div style="padding: 10px 16px; background: var(--surface-alt); border-top: 1px solid var(--border); text-align: center; font-size: 12px;">
            <a href="javascript:void(0)" onclick="window.drillDownStockStatus('LOW STOCK')" style="font-weight: 600;">
              View all ${metrics.lowStockItems.length} replenishment alerts in catalog →
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Recent Stock Transactions Ledger -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2"/></svg>
            Recent Stock Transactions
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('reports')">Reports</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ref / Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.recentTransactions.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No transactions recorded yet.</td></tr>
              ` : metrics.recentTransactions.map(tx => {
                const isPositive = tx.type === 'STOCK_IN' || tx.type === 'ADJUSTMENT_IN';
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 600; font-size: 12.5px;">${tx.refNo}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${tx.date}</div>
                    </td>
                    <td>
                      <span class="badge ${
                        tx.type === 'STOCK_IN' ? 'badge-in-stock' :
                        tx.type === 'STOCK_OUT' ? 'badge-out-of-stock' : 'badge-low-stock'
                      }" style="font-size: 10.5px;">
                        ${tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style="font-size: 12.5px; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${tx.productName}">
                        ${tx.productName}
                      </div>
                      <div style="font-size: 10.5px; color: var(--text-muted);">${tx.sku || ''}</div>
                    </td>
                    <td>
                      <strong style="color: ${isPositive ? 'var(--success-text)' : 'var(--danger-text)'};">
                        ${isPositive ? '+' : '-'}${tx.quantity}
                      </strong>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="window.viewDashboardTxnDetails('${tx.id}')" title="View Transaction Voucher">
                        View
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding: 10px 16px; background: var(--surface-alt); border-top: 1px solid var(--border); text-align: center; font-size: 12px;">
          <a href="javascript:void(0)" onclick="window.router.navigate('inventory')" style="font-weight: 600;">
            View Master Product Catalog & Ledgers →
          </a>
        </div>
      </div>

    </div>
  `;
}

// --------------------------------------------------------------------------
// Interactive Dashboard Actions & Global Window Hooks
// --------------------------------------------------------------------------

/**
 * Drill down to Inventory with pre-filtered stock status
 */
window.drillDownStockStatus = function(status) {
  window.router.navigate('inventory');
  setTimeout(() => {
    window.handleInventoryFilter?.('stockStatus', status);
    const sel = document.getElementById('filter-stock');
    if (sel) sel.value = status;
  }, 60);
};

/**
 * Reorder low stock product directly from dashboard
 */
window.reorderLowStockItem = function(productId) {
  window.router.navigate('stock-in');
  setTimeout(() => {
    const sel = document.getElementById('in-product');
    if (sel) {
      sel.value = productId;
      window.handleStockInProductChange?.(productId);
      const qtyInput = document.getElementById('in-qty');
      if (qtyInput) {
        const p = SAMPLE_PRODUCTS.find(item => item.id === productId);
        if (p) {
          const deficit = Math.max(10, (p.maxStock || p.minStock * 2) - p.currentStock);
          qtyInput.value = deficit;
          window.updateStockInCalc?.();
        }
        qtyInput.focus();
      }
    }
    window.showToast('Product pre-selected for purchase intake.', 'info');
  }, 100);
};

/**
 * View Transaction Voucher Modal from dashboard
 */
window.viewDashboardTxnDetails = function(txnId) {
  const t = SAMPLE_TRANSACTIONS.find(item => item.id === txnId);
  if (!t) return;

  const isPositive = t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN';

  window.openModal({
    title: `Transaction Voucher: ${t.refNo}`,
    body: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Transaction Ref</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">${t.refNo}</div>
          </div>
          <div>
            <span class="badge ${
              t.type === 'STOCK_IN' ? 'badge-in-stock' :
              t.type === 'STOCK_OUT' ? 'badge-out-of-stock' : 'badge-low-stock'
            }">
              ${t.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Timestamp:</strong> <div>${t.date}</div></div>
          <div><strong style="color: var(--text-muted);">Operator:</strong> <div>${t.user || 'System'}</div></div>
          <div><strong style="color: var(--text-muted);">Product SKU:</strong> <code>${t.sku || '-'}</code></div>
          <div><strong style="color: var(--text-muted);">Movement Qty:</strong> <div style="font-size: 15px; font-weight: 700; color: ${isPositive ? 'var(--success-text)' : 'var(--danger-text)'};">${isPositive ? '+' : '-'}${t.quantity}</div></div>
          <div><strong style="color: var(--text-muted);">Unit Price:</strong> <div>$${(t.unitCost || t.unitPrice || 0).toFixed(2)}</div></div>
          <div><strong style="color: var(--text-muted);">Total Valuation:</strong> <div><strong>$${(t.totalValue || (t.quantity * (t.unitCost || 0))).toFixed(2)}</strong></div></div>
          <div><strong style="color: var(--text-muted);">Facility:</strong> <div>${t.location || 'Central Warehouse'}</div></div>
          <div><strong style="color: var(--text-muted);">Counterparty:</strong> <div>${t.supplier || t.destination || t.recipient || 'Internal'}</div></div>
        </div>

        ${t.notes ? `
          <div style="padding: 10px 12px; background: var(--surface-alt); border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 12px;">
            <strong style="color: var(--text-muted); display: block; margin-bottom: 2px;">Operation Notes:</strong>
            ${t.notes}
          </div>
        ` : ''}
      </div>
    `,
    primaryText: 'Close Voucher',
    onPrimary: () => window.closeModal()
  });
};

/**
 * Refresh Dashboard KPIs
 */
window.refreshDashboardData = async function() {
  if (isRefreshing) return;
  isRefreshing = true;

  const btn = document.getElementById('btn-refresh-dashboard');
  const icon = document.getElementById('refresh-icon');
  if (btn) btn.disabled = true;
  if (icon) icon.style.animation = 'spin 1s linear infinite';

  try {
    if (api.isConfigured()) {
      await api.getDashboard();
    }
    // Re-render
    const container = document.getElementById('view-content');
    if (container) {
      container.innerHTML = renderDashboard();
    }
    window.showToast('Executive Dashboard synchronized successfully.', 'success');
  } catch (err) {
    console.warn('Dashboard sync note:', err);
    const container = document.getElementById('view-content');
    if (container) {
      container.innerHTML = renderDashboard();
    }
    window.showToast('Dashboard metrics refreshed from local transaction balances.', 'info');
  } finally {
    isRefreshing = false;
  }
};

/**
 * Export Executive Summary CSV
 */
window.exportDashboardSummaryCSV = function() {
  const metrics = getDashboardMetrics();
  const k = metrics.kpis;
  const nowStr = new Date().toISOString().slice(0, 10);

  const lines = [
    ['Executive Inventory Dashboard Summary', `Generated: ${nowStr}`],
    [],
    ['--- KEY PERFORMANCE INDICATORS ---'],
    ['Metric', 'Value'],
    ['Total Catalog Products', k.totalProducts],
    ['Total Physical Units in Stock', k.totalCurrentStock],
    ['Total Inventory Valuation (Cost)', `$${k.totalInventoryValue.toFixed(2)}`],
    ['Total Retail Valuation', `$${k.totalRetailValue.toFixed(2)}`],
    ['Unrealized Gross Margin', `$${k.grossProfit.toFixed(2)} (${k.marginPct.toFixed(1)}%)`],
    ['Healthy In-Stock Items', k.healthyStockCount],
    ['Low Stock Warnings', k.lowStockCount],
    ['Out of Stock Items', k.outOfStockCount],
    ['Stock In Today (Units / Valuation)', `${k.stockInToday.quantity} units / $${k.stockInToday.value.toFixed(2)}`],
    ['Stock Out Today (Units / Valuation)', `${k.stockOutToday.quantity} units / $${k.stockOutToday.value.toFixed(2)}`],
    [],
    ['--- STOCK DISTRIBUTION BY CATEGORY ---'],
    ['Category', 'Units in Stock', 'Product Count', 'Valuation ($)', 'Stock Share (%)'],
    ...metrics.categoryDistribution.map(c => [
      `"${c.name}"`,
      c.units,
      c.count,
      c.value.toFixed(2),
      `${c.percentage}%`
    ]),
    [],
    ['--- CRITICAL REPLENISHMENT WARNINGS ---'],
    ['SKU', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Deficit', 'Status'],
    ...metrics.lowStockItems.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.currentStock,
      p.minStock,
      Math.max(0, p.minStock - p.currentStock),
      p.stockStatus
    ])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Executive_Stock_Summary_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast('Executive Dashboard Summary downloaded.', 'success');
};
