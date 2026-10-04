import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_LOCATIONS, SAMPLE_SUPPLIERS, SAMPLE_TRANSACTIONS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let currentFilter = {
  search: '',
  category: 'ALL',
  location: 'ALL',
  stockStatus: 'ALL',
  status: 'ACTIVE' // ACTIVE, INACTIVE, ALL
};

let liveProducts = [...SAMPLE_PRODUCTS];
let isLoading = false;

export async function fetchCatalogData() {
  if (api.isConfigured()) {
    try {
      isLoading = true;
      const res = await api.getProducts();
      if (res && res.success && Array.isArray(res.data)) {
        liveProducts = res.data;
      }
    } catch (e) {
      console.warn('Could not load live products from Google Sheets, using local state:', e);
    } finally {
      isLoading = false;
    }
  }
}

export function renderInventory() {
  const user = auth.getUser();
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');

  const filtered = liveProducts.filter(p => {
    // Status filter (Active vs Archived)
    if (currentFilter.status !== 'ALL') {
      if (currentFilter.status === 'ARCHIVED' && p.status !== 'ARCHIVED') return false;
      if (currentFilter.status === 'ACTIVE' && p.status === 'ARCHIVED') return false;
    }

    const matchesSearch = !currentFilter.search ||
      p.name.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      p.sku.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      (p.supplier && p.supplier.toLowerCase().includes(currentFilter.search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(currentFilter.search));

    const matchesCat = currentFilter.category === 'ALL' || p.category === currentFilter.category;
    const matchesLoc = currentFilter.location === 'ALL' || p.location === currentFilter.location || p.locationId === currentFilter.location;
    const matchesStock = currentFilter.stockStatus === 'ALL' || p.stockStatus === currentFilter.stockStatus;

    return matchesSearch && matchesCat && matchesLoc && matchesStock;
  });

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Product Master Catalog & Inventory</h1>
        <p>Manage product specifications, pricing, stock levels, thresholds, and suppliers.</p>
      </div>
      <div class="page-actions">
        ${canManage ? `
          <button class="btn btn-secondary btn-sm" onclick="window.recalculateStockLedger()" title="Recalculate current stock from opening balance and all transaction records">
            <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Recalculate Ledger
          </button>
        ` : ''}
        <button class="btn btn-secondary btn-sm" onclick="window.refreshProductCatalog()">
          <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Sync
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.exportInventoryCSV()">
          <svg viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export CSV
        </button>
        ${canManage ? `
          <button class="btn btn-primary btn-sm" id="btn-add-product" onclick="window.openAddProductModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add New Product
          </button>
        ` : ''}
      </div>
    </div>

    <div class="card">
      <!-- Search and Multi-parameter Filters -->
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              id="inv-search-input" 
              placeholder="Search by SKU, Product Name, Barcode..." 
              value="${currentFilter.search}"
              oninput="window.handleInventorySearch(this.value)"
            />
          </div>

          <select class="select-filter" id="inv-filter-cat" onchange="window.handleInventoryFilter('category', this.value)">
            <option value="ALL">All Categories</option>
            ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}" ${currentFilter.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>

          <select class="select-filter" id="inv-filter-loc" onchange="window.handleInventoryFilter('location', this.value)">
            <option value="ALL">All Locations</option>
            ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}" ${currentFilter.location === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>

          <select class="select-filter" id="inv-filter-stock" onchange="window.handleInventoryFilter('stockStatus', this.value)">
            <option value="ALL" ${currentFilter.stockStatus === 'ALL' ? 'selected' : ''}>All Stock Levels</option>
            <option value="IN STOCK" ${currentFilter.stockStatus === 'IN STOCK' ? 'selected' : ''}>IN STOCK</option>
            <option value="LOW STOCK" ${currentFilter.stockStatus === 'LOW STOCK' ? 'selected' : ''}>LOW STOCK</option>
            <option value="OUT OF STOCK" ${currentFilter.stockStatus === 'OUT OF STOCK' ? 'selected' : ''}>OUT OF STOCK</option>
          </select>

          <select class="select-filter" id="inv-filter-status" onchange="window.handleInventoryFilter('status', this.value)">
            <option value="ACTIVE" ${currentFilter.status === 'ACTIVE' ? 'selected' : ''}>Active Catalog</option>
            <option value="ARCHIVED" ${currentFilter.status === 'ARCHIVED' ? 'selected' : ''}>Archived Items</option>
            <option value="ALL" ${currentFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> of ${liveProducts.length} items
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable">SKU / Barcode</th>
              <th class="sortable">Product Name</th>
              <th>Category</th>
              <th>Location</th>
              <th style="text-align: right;">Current Stock</th>
              <th style="text-align: right;">Min / Max</th>
              <th style="text-align: right;">Cost Price</th>
              <th style="text-align: right;">Stock Value</th>
              <th style="text-align: center;">Stock Status</th>
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
                    <div class="empty-state-title">No matching products found</div>
                    <div class="empty-state-desc">Try clearing your search query or filter settings to view existing catalog items.</div>
                    <button class="btn btn-secondary btn-sm" onclick="window.resetInventoryFilters()">Reset Filters</button>
                  </div>
                </td>
              </tr>
            ` : filtered.map(item => {
              const stockVal = (item.currentStock * item.costPrice).toFixed(2);
              const isArchived = item.status === 'ARCHIVED';

              return `
                <tr style="${isArchived ? 'opacity: 0.6; background: #fafafa;' : ''}">
                  <td>
                    <div style="font-weight: 700; font-family: monospace; color: var(--primary);">${item.sku}</div>
                    <div style="font-size: 11px; color: var(--text-light); font-family: monospace;">${item.barcode || 'NO BARCODE'}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${item.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">${item.unit} • ${item.supplier || 'No Supplier'}</div>
                  </td>
                  <td>
                    <span class="badge badge-neutral">${item.category || 'General'}</span>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; display: flex; align-items: center; gap: 4px;">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: var(--text-muted); fill: none;"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ${item.location || item.locationId || 'Main Warehouse'}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 15px; font-weight: 700; color: ${item.currentStock === 0 ? 'var(--danger)' : item.currentStock <= item.minStock ? 'var(--warning-dark)' : 'var(--text-main)'};">
                      ${item.currentStock}
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;"> ${item.unit}</span>
                  </td>
                  <td style="text-align: right; color: var(--text-muted); font-size: 12px;">
                    ${item.minStock} / ${item.maxStock}
                  </td>
                  <td style="text-align: right; font-weight: 500;">
                    $${Number(item.costPrice).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${Number(stockVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${item.stockStatus === 'IN STOCK' ? 'badge-in-stock' : item.stockStatus === 'LOW STOCK' ? 'badge-low-stock' : 'badge-out-of-stock'}">
                      ${item.stockStatus}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Product Details" onclick="window.viewProductDetails('${item.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      ${canManage ? `
                        <button class="btn btn-secondary btn-sm" title="Edit Product" onclick="window.openEditProductModal('${item.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        ${auth.hasRole('ADMIN') && !isArchived ? `
                          <button class="btn btn-secondary btn-sm" title="Archive Product" onclick="window.archiveProductPrompt('${item.id}')" style="color: var(--danger);">
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
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

      <!-- Pagination Footer -->
      <div class="pagination-container">
        <div>Showing <strong>${filtered.length}</strong> items in catalog</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>«</button>
          <button class="page-btn active">1</button>
          <button class="page-btn" disabled>»</button>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Product Details Modal
// --------------------------------------------------------------------------
window.viewProductDetails = function(id) {
  const p = liveProducts.find(item => item.id === id);
  if (!p) return;

  const stockVal = (p.currentStock * p.costPrice).toFixed(2);
  const profitMargin = (p.sellingPrice - p.costPrice).toFixed(2);
  const marginPercent = p.costPrice > 0 ? ((profitMargin / p.costPrice) * 100).toFixed(1) : '0.0';
  const relatedTxns = SAMPLE_TRANSACTIONS.filter(t => t.productId === p.id || t.sku === p.sku);

  // Stock capacity percent
  const capacityPercent = p.maxStock > 0 ? Math.min(100, Math.round((p.currentStock / p.maxStock) * 100)) : 50;

  window.openModal({
    title: `Product Specifications: ${p.sku}`,
    body: `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <div>
            <div style="font-size: 19px; font-weight: 700; color: var(--text-main);">${p.name}</div>
            <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
              ${p.description || 'Standard catalog inventory item.'}
            </div>
          </div>
          <span class="badge ${p.stockStatus === 'IN STOCK' ? 'badge-in-stock' : p.stockStatus === 'LOW STOCK' ? 'badge-low-stock' : 'badge-out-of-stock'}">
            ${p.stockStatus}
          </span>
        </div>

        <!-- Inventory Balance & Threshold Bar -->
        <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span>Current Stock: <strong style="color: var(--primary);">${p.currentStock} ${p.unit}</strong></span>
            <span style="color: var(--text-muted);">Thresholds: Min ${p.minStock} / Max ${p.maxStock} ${p.unit}</span>
          </div>
          <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; position: relative;">
            <div style="width: ${capacityPercent}%; height: 100%; background: ${p.currentStock === 0 ? 'var(--danger)' : p.currentStock <= p.minStock ? 'var(--warning)' : 'var(--success)'}; border-radius: 5px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            <span>0 units</span>
            <span>Capacity Utilized: ${capacityPercent}%</span>
            <span>${p.maxStock} max</span>
          </div>
        </div>

        <!-- Transaction-Based Calculation Breakdown (Phase 12 Engine) -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 8px;">
            Transaction Ledger Formula: Current Stock = Opening + In − Out + AdjIn − AdjOut
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 8px; align-items: center; text-align: center; font-size: 12px;">
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--text-muted); font-size: 10px;">OPENING</div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${p.openingStock || 0}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--success); font-size: 10px;">+ STOCK IN</div>
              <div style="font-weight: 700; color: var(--success); font-size: 14px;">+${relatedTxns.filter(t => t.type === 'STOCK_IN').reduce((acc, t) => acc + (t.quantity || 0), 0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--danger); font-size: 10px;">− STOCK OUT</div>
              <div style="font-weight: 700; color: var(--danger); font-size: 14px;">-${relatedTxns.filter(t => t.type === 'STOCK_OUT').reduce((acc, t) => acc + (t.quantity || 0), 0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--primary); font-size: 10px;">+ ADJ IN</div>
              <div style="font-weight: 700; color: var(--primary); font-size: 14px;">+${relatedTxns.filter(t => t.type === 'ADJUSTMENT_IN').reduce((acc, t) => acc + (t.quantity || 0), 0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--warning); font-size: 10px;">− ADJ OUT</div>
              <div style="font-weight: 700; color: var(--warning); font-size: 14px;">-${relatedTxns.filter(t => t.type === 'ADJUSTMENT_OUT').reduce((acc, t) => acc + (t.quantity || 0), 0)}</div>
            </div>
            <div style="background: rgba(0, 87, 231, 0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--primary); text-align: right;">
              <div style="color: var(--primary); font-size: 10px; font-weight: 700;">CALCULATED BALANCE</div>
              <div style="font-weight: 800; color: var(--primary); font-size: 15px;">${p.currentStock} ${p.unit}</div>
            </div>
          </div>
        </div>

        <!-- Master Attributes Grid -->
        <div class="form-grid" style="font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Product ID:</strong> <span style="font-family: monospace;">${p.id}</span></div>
          <div><strong style="color: var(--text-muted);">Barcode:</strong> <span style="font-family: monospace;">${p.barcode || 'N/A'}</span></div>
          <div><strong style="color: var(--text-muted);">Category:</strong> ${p.category}</div>
          <div><strong style="color: var(--text-muted);">Storage Location:</strong> ${p.location || p.locationId}</div>
          <div><strong style="color: var(--text-muted);">Primary Supplier:</strong> ${p.supplier}</div>
          <div><strong style="color: var(--text-muted);">Unit of Measure:</strong> ${p.unit}</div>
          <div><strong style="color: var(--text-muted);">Procurement Cost:</strong> $${p.costPrice.toFixed(2)}</div>
          <div><strong style="color: var(--text-muted);">Selling Price:</strong> $${p.sellingPrice.toFixed(2)}</div>
          <div><strong style="color: var(--text-muted);">Gross Margin:</strong> <span style="color: var(--success); font-weight: 600;">+$${profitMargin} (${marginPercent}%)</span></div>
          <div><strong style="color: var(--text-muted);">Asset Valuation:</strong> <strong style="color: var(--primary);">$${Number(stockVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
        </div>

        <!-- Recent Movements for this SKU -->
        <div>
          <div style="font-size: 13.5px; font-weight: 700; margin-bottom: 8px;">Product Movement Ledger</div>
          <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <table class="data-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ref No</th>
                  <th>Type</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${relatedTxns.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No transaction records found for this product.</td></tr>
                ` : relatedTxns.map(t => `
                  <tr>
                    <td>${t.date}</td>
                    <td style="font-weight: 600;">${t.refNo}</td>
                    <td><span class="badge ${t.type.includes('IN') ? 'badge-in-stock' : 'badge-out-of-stock'}">${t.type}</span></td>
                    <td><strong>${t.type.includes('IN') ? '+' : '-'}${t.quantity}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    primaryText: 'Close',
    onPrimary: () => window.closeModal()
  });
};

// --------------------------------------------------------------------------
// Add Product Modal
// --------------------------------------------------------------------------
window.openAddProductModal = function() {
  const defaultSku = `PRD-SKU-${Math.floor(100 + Math.random() * 900)}`;

  window.openModal({
    title: 'Add New Master Catalog Product',
    body: `
      <form id="add-product-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewProduct();">
        <div class="form-group">
          <label class="form-label">SKU (Stock Keeping Unit) <span class="required-star">*</span></label>
          <input type="text" id="new-sku" class="form-input" value="${defaultSku}" placeholder="e.g. STA-A4P-02" required />
          <div class="form-hint">Must be globally unique</div>
        </div>
        <div class="form-group">
          <label class="form-label">Barcode / UPC</label>
          <input type="text" id="new-barcode" class="form-input" placeholder="880123456009" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Product Name <span class="required-star">*</span></label>
          <input type="text" id="new-name" class="form-input" placeholder="e.g. Spiral Bound Executive Notebook (A5, 200 Pages)" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description / Specifications</label>
          <textarea id="new-desc" class="form-textarea" rows="2" placeholder="Detailed product specifications, dimensions, color..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Category <span class="required-star">*</span></label>
          <select id="new-category" class="form-select">
            ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit of Measure <span class="required-star">*</span></label>
          <select id="new-unit" class="form-select">
            <option value="Piece">Piece</option>
            <option value="Box">Box</option>
            <option value="Ream">Ream</option>
            <option value="Bottle">Bottle</option>
            <option value="Bundle">Bundle</option>
            <option value="Cartridge">Cartridge</option>
            <option value="Pack">Pack</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Primary Supplier <span class="required-star">*</span></label>
          <select id="new-supplier" class="form-select">
            ${SAMPLE_SUPPLIERS.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Default Storage Location <span class="required-star">*</span></label>
          <select id="new-location" class="form-select">
            ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cost Price ($) <span class="required-star">*</span></label>
          <input type="number" step="0.01" min="0" id="new-cost" class="form-input" placeholder="0.00" oninput="window.updatePricePreview()" required />
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price ($)</label>
          <input type="number" step="0.01" min="0" id="new-price" class="form-input" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Stock Alert Threshold <span class="required-star">*</span></label>
          <input type="number" min="0" id="new-min" class="form-input" value="20" required />
          <div class="form-hint">Triggers Low Stock warning</div>
        </div>
        <div class="form-group">
          <label class="form-label">Maximum Warehouse Capacity</label>
          <input type="number" min="0" id="new-max" class="form-input" value="200" />
        </div>
        <div class="form-group">
          <label class="form-label">Opening Initial Stock</label>
          <input type="number" min="0" id="new-opening" class="form-input" value="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Product Image URL</label>
          <input type="url" id="new-image" class="form-input" placeholder="https://..." />
        </div>
      </form>
    `,
    primaryText: 'Save Product',
    onPrimary: () => window.submitNewProduct()
  });
};

window.updatePricePreview = function() {
  const cost = parseFloat(document.getElementById('new-cost')?.value || '0');
  const priceInput = document.getElementById('new-price');
  if (cost > 0 && priceInput && !priceInput.value) {
    priceInput.value = (cost * 1.4).toFixed(2);
  }
};

window.submitNewProduct = async function() {
  const sku = document.getElementById('new-sku')?.value.trim();
  const name = document.getElementById('new-name')?.value.trim();
  const cost = parseFloat(document.getElementById('new-cost')?.value || '0');
  const minStock = parseInt(document.getElementById('new-min')?.value || '10', 10);
  const maxStock = parseInt(document.getElementById('new-max')?.value || (minStock * 10), 10);

  if (!sku || !name) {
    window.showToast('Please fill all required fields (SKU, Name, Cost Price).', 'error');
    return;
  }

  if (maxStock < minStock) {
    window.showToast('Maximum stock capacity must be greater than or equal to Minimum stock.', 'error');
    return;
  }

  // Duplicate SKU Validation
  if (liveProducts.some(p => p.sku.toLowerCase() === sku.toLowerCase())) {
    window.showToast(`Error: SKU "${sku}" already exists in the catalog. SKU must be unique.`, 'error');
    return;
  }

  const openingStock = parseInt(document.getElementById('new-opening')?.value || '0', 10);
  const category = document.getElementById('new-category')?.value;
  const unit = document.getElementById('new-unit')?.value;
  const supplier = document.getElementById('new-supplier')?.value;
  const location = document.getElementById('new-location')?.value;
  const sellingPrice = parseFloat(document.getElementById('new-price')?.value || (cost * 1.4).toFixed(2));
  const desc = document.getElementById('new-desc')?.value.trim();
  const barcode = document.getElementById('new-barcode')?.value.trim();
  const image = document.getElementById('new-image')?.value.trim();

  let stockStatus = 'IN STOCK';
  if (openingStock === 0) stockStatus = 'OUT OF STOCK';
  else if (openingStock <= minStock) stockStatus = 'LOW STOCK';

  const newPrd = {
    id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    sku,
    barcode: barcode || '8801' + Math.floor(10000000 + Math.random() * 90000000),
    name,
    description: desc,
    category,
    unit,
    supplier,
    costPrice: cost,
    sellingPrice,
    minStock,
    maxStock,
    location,
    openingStock,
    currentStock: openingStock,
    stockStatus,
    imageUrl: image,
    status: 'ACTIVE'
  };

  // Live API Creation
  if (api.isConfigured()) {
    try {
      window.showToast('Creating product in Google Sheets...', 'info');
      await api.request('createProduct', {
        method: 'POST',
        data: newPrd,
        token: auth.getToken()
      });
    } catch (err) {
      console.warn('API creation failed, continuing in memory:', err);
    }
  }

  liveProducts.unshift(newPrd);
  SAMPLE_PRODUCTS.unshift(newPrd);

  // If opening balance > 0, log transaction
  if (openingStock > 0) {
    SAMPLE_TRANSACTIONS.unshift({
      id: `TXN-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'STOCK_IN',
      refNo: 'OPENING-BALANCE',
      sku,
      productName: name,
      quantity: openingStock,
      unitCost: cost,
      totalValue: openingStock * cost,
      location,
      supplier,
      user: auth.getUser()?.fullName || 'Admin'
    });
  }

  // Audit log
  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'CREATE_PRODUCT',
    module: 'Products',
    recordId: newPrd.id,
    description: `Created new master product [${sku}] ${name}`
  });

  window.closeModal();
  window.showToast(`Product "${name}" added to master catalog successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

// --------------------------------------------------------------------------
// Edit Product Modal
// --------------------------------------------------------------------------
window.openEditProductModal = function(id) {
  const p = liveProducts.find(item => item.id === id);
  if (!p) return;

  window.openModal({
    title: `Edit Master Product: ${p.sku}`,
    body: `
      <form id="edit-product-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditProduct('${p.id}');">
        <div class="form-group">
          <label class="form-label">SKU <span class="required-star">*</span></label>
          <input type="text" id="edit-sku" class="form-input" value="${p.sku}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Barcode</label>
          <input type="text" id="edit-barcode" class="form-input" value="${p.barcode || ''}" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Product Name <span class="required-star">*</span></label>
          <input type="text" id="edit-name" class="form-input" value="${p.name}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description</label>
          <textarea id="edit-desc" class="form-textarea" rows="2">${p.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="edit-category" class="form-select">
            ${SAMPLE_CATEGORIES.map(c => `<option value="${c.name}" ${p.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit</label>
          <input type="text" id="edit-unit" class="form-input" value="${p.unit}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Supplier</label>
          <select id="edit-supplier" class="form-select">
            ${SAMPLE_SUPPLIERS.map(s => `<option value="${s.name}" ${p.supplier === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Storage Location</label>
          <select id="edit-location" class="form-select">
            ${SAMPLE_LOCATIONS.map(l => `<option value="${l.name}" ${(p.location === l.name || p.locationId === l.name) ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cost Price ($) <span class="required-star">*</span></label>
          <input type="number" step="0.01" min="0" id="edit-cost" class="form-input" value="${p.costPrice}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price ($)</label>
          <input type="number" step="0.01" min="0" id="edit-price" class="form-input" value="${p.sellingPrice}" />
        </div>
        <div class="form-group">
          <label class="form-label">Min Stock Threshold</label>
          <input type="number" min="0" id="edit-min" class="form-input" value="${p.minStock}" />
        </div>
        <div class="form-group">
          <label class="form-label">Max Stock Capacity</label>
          <input type="number" min="0" id="edit-max" class="form-input" value="${p.maxStock}" />
        </div>
      </form>
    `,
    primaryText: 'Save Changes',
    onPrimary: () => window.submitEditProduct(p.id)
  });
};

window.submitEditProduct = async function(id) {
  const p = liveProducts.find(item => item.id === id);
  if (!p) return;

  const sku = document.getElementById('edit-sku')?.value.trim();
  const name = document.getElementById('edit-name')?.value.trim();
  const cost = parseFloat(document.getElementById('edit-cost')?.value || '0');

  if (!sku || !name) {
    window.showToast('SKU and Product Name cannot be empty.', 'error');
    return;
  }

  // Duplicate SKU check (excluding this product)
  if (liveProducts.some(item => item.id !== id && item.sku.toLowerCase() === sku.toLowerCase())) {
    window.showToast(`Error: SKU "${sku}" already belongs to another product.`, 'error');
    return;
  }

  p.sku = sku;
  p.name = name;
  p.barcode = document.getElementById('edit-barcode')?.value.trim();
  p.description = document.getElementById('edit-desc')?.value.trim();
  p.category = document.getElementById('edit-category')?.value;
  p.unit = document.getElementById('edit-unit')?.value;
  p.supplier = document.getElementById('edit-supplier')?.value;
  p.location = document.getElementById('edit-location')?.value;
  p.costPrice = cost;
  p.sellingPrice = parseFloat(document.getElementById('edit-price')?.value || (cost * 1.4).toFixed(2));
  p.minStock = parseInt(document.getElementById('edit-min')?.value || '10', 10);
  p.maxStock = parseInt(document.getElementById('edit-max')?.value || '100', 10);

  // Recalculate status
  if (p.currentStock === 0) p.stockStatus = 'OUT OF STOCK';
  else if (p.currentStock <= p.minStock) p.stockStatus = 'LOW STOCK';
  else p.stockStatus = 'IN STOCK';

  // Live API Update
  if (api.isConfigured()) {
    try {
      await api.request('updateProduct', {
        method: 'POST',
        data: { id, ...p },
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API update failed, updated in memory:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'UPDATE_PRODUCT',
    module: 'Products',
    recordId: id,
    description: `Updated catalog attributes for [${p.sku}] ${p.name}`
  });

  window.closeModal();
  window.showToast(`Product "${p.name}" updated successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

// --------------------------------------------------------------------------
// Archive Product Action
// --------------------------------------------------------------------------
window.archiveProductPrompt = function(id) {
  const p = liveProducts.find(item => item.id === id);
  if (!p) return;

  window.openModal({
    title: `Archive Product: ${p.sku}`,
    body: `
      <div>
        <div style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">
          Are you sure you want to archive "${p.name}"?
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">
          Archived products will be excluded from the active catalog and daily Stock In / Stock Out dropdowns, but historical transaction ledger records and audit logs will remain permanently intact.
        </p>
      </div>
    `,
    primaryText: 'Yes, Archive Product',
    onPrimary: async () => {
      p.status = 'ARCHIVED';

      if (api.isConfigured()) {
        try {
          await api.request('archiveProduct', {
            method: 'POST',
            data: { id },
            token: auth.getToken()
          });
        } catch (e) {
          console.warn('API archive failed, archived in memory:', e);
        }
      }

      SAMPLE_AUDIT_LOGS.unshift({
        id: `LOG-${Date.now().toString().slice(-4)}`,
        dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: auth.getUser()?.userId || 'USR-001',
        username: auth.getUser()?.username || 'admin',
        action: 'ARCHIVE_PRODUCT',
        module: 'Products',
        recordId: id,
        description: `Archived product [${p.sku}] ${p.name}`
      });

      window.closeModal();
      window.showToast(`Product "${p.name}" archived.`, 'info');

      const container = document.getElementById('view-content');
      if (container) container.innerHTML = renderInventory();
    }
  });
};

// --------------------------------------------------------------------------
// Global Filter & Helper Hooks
// --------------------------------------------------------------------------
window.handleInventorySearch = function(val) {
  currentFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

window.handleInventoryFilter = function(key, val) {
  currentFilter[key] = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

window.resetInventoryFilters = function() {
  currentFilter = { search: '', category: 'ALL', location: 'ALL', stockStatus: 'ALL', status: 'ACTIVE' };
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

window.refreshProductCatalog = async function() {
  window.showToast('Synchronizing catalog with Google Sheets...', 'info');
  await fetchCatalogData();
  window.showToast('Product catalog up-to-date.', 'success');
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

window.exportInventoryCSV = function() {
  const headers = ['Product ID', 'SKU', 'Barcode', 'Product Name', 'Category', 'Unit', 'Supplier', 'Cost Price', 'Selling Price', 'Current Stock', 'Stock Value', 'Status'];
  const rows = liveProducts.filter(p => p.status !== 'ARCHIVED').map(p => [
    p.id,
    p.sku,
    p.barcode || '',
    `"${p.name.replace(/"/g, '""')}"`,
    p.category,
    p.unit,
    `"${p.supplier || ''}"`,
    p.costPrice,
    p.sellingPrice,
    p.currentStock,
    (p.currentStock * p.costPrice).toFixed(2),
    p.stockStatus
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Product_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast('Product Catalog CSV downloaded.', 'success');
};

// --------------------------------------------------------------------------
// Phase 12 - Recalculate Stock Ledger Trigger
// --------------------------------------------------------------------------
window.recalculateStockLedger = async function() {
  const user = auth.getUser();
  if (!auth.hasRole('ADMIN', 'STOCK_MANAGER')) {
    window.showToast('Access restricted: Managerial permissions required to recalculate ledger.', 'error');
    return;
  }

  window.showToast('Synchronizing inventory ledger from transaction logs...', 'info');

  let updatedCount = 0;
  liveProducts.forEach(p => {
    const txns = SAMPLE_TRANSACTIONS.filter(t => t.productId === p.id || t.sku === p.sku);
    const inQty = txns.filter(t => t.type === 'STOCK_IN').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const outQty = txns.filter(t => t.type === 'STOCK_OUT').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const adjInQty = txns.filter(t => t.type === 'ADJUSTMENT_IN').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const adjOutQty = txns.filter(t => t.type === 'ADJUSTMENT_OUT').reduce((acc, t) => acc + (t.quantity || 0), 0);
    const opening = p.openingStock || 0;

    const recalculatedStock = Math.max(0, opening + inQty - outQty + adjInQty - adjOutQty);
    p.currentStock = recalculatedStock;

    if (p.currentStock === 0) p.stockStatus = 'OUT OF STOCK';
    else if (p.currentStock <= p.minStock) p.stockStatus = 'LOW STOCK';
    else p.stockStatus = 'IN STOCK';

    updatedCount++;
  });

  if (api.isConfigured()) {
    try {
      await api.request('recalculateStockLedger', {
        method: 'POST',
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API recalculateStockLedger failed:', e);
    }
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: user?.userId || 'USR-001',
    username: user?.username || 'admin',
    action: 'RECALCULATE_STOCK',
    module: 'Current Stock',
    recordId: 'ALL',
    description: `Recalculated transaction balances for ${updatedCount} master catalog items.`
  });

  window.showToast(`Ledger synchronized! ${updatedCount} items recalculated from transaction history.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderInventory();
};

