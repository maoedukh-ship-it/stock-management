import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, SAMPLE_AUDIT_LOGS } from '../sampleData.js';
import { auth } from './auth.js';
import { api } from '../apiClient.js';

let categoryFilter = {
  search: '',
  status: 'ALL'
};

export function renderCategories() {
  const canManage = auth.hasRole('ADMIN', 'STOCK_MANAGER');

  // Compute live product counts per category
  const counts = {};
  SAMPLE_PRODUCTS.forEach(p => {
    if (p.status !== 'ARCHIVED') {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  });

  const filtered = SAMPLE_CATEGORIES.filter(c => {
    const matchesSearch = !categoryFilter.search ||
      c.name.toLowerCase().includes(categoryFilter.search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(categoryFilter.search.toLowerCase())) ||
      c.id.toLowerCase().includes(categoryFilter.search.toLowerCase());

    const matchesStatus = categoryFilter.status === 'ALL' || c.status === categoryFilter.status;
    return matchesSearch && matchesStatus;
  });

  const totalActive = SAMPLE_CATEGORIES.filter(c => c.status === 'ACTIVE').length;

  return `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Product Categories Management</h1>
        <p>Organize inventory catalog into functional classifications, departments, and accounting groups.</p>
      </div>
      <div class="page-actions">
        ${canManage ? `
          <button class="btn btn-primary btn-sm" onclick="window.openAddCategoryModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Category
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Category KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Categories</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </div>
        </div>
        <div class="kpi-value">${SAMPLE_CATEGORIES.length}</div>
        <div class="kpi-footer">Primary classification groups</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Categories</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${totalActive}</div>
        <div class="kpi-footer">Available for catalog assignment</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog SKUs Mapped</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${SAMPLE_PRODUCTS.length}</div>
        <div class="kpi-footer">100% categorially classified</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search category by name or description..." 
              value="${categoryFilter.search}" 
              oninput="window.handleCategorySearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleCategoryStatusFilter(this.value)">
            <option value="ALL" ${categoryFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="ACTIVE" ${categoryFilter.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${categoryFilter.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${filtered.length}</strong> categories
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Category Name</th>
              <th>Description / Scope</th>
              <th style="text-align: right;">Associated Products</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching categories found</div>
                    <div class="empty-state-desc">Try clearing your search query or add a new product category.</div>
                  </div>
                </td>
              </tr>
            ` : filtered.map(cat => {
              const itemCount = counts[cat.name] || 0;
              return `
                <tr>
                  <td style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 13px;">
                    ${cat.id}
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${cat.name}</div>
                  </td>
                  <td style="font-size: 13px; color: var(--text-secondary); max-width: 320px;">
                    ${cat.description || 'No description provided.'}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewCategoryProducts('${cat.name}')" title="Filter catalog by this category">
                      <strong>${itemCount}</strong> items
                    </button>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${cat.status === 'ACTIVE' ? 'badge-in-stock' : 'badge-neutral'}">
                      ${cat.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      ${canManage ? `
                        <button class="btn btn-secondary btn-sm" title="Edit Category" onclick="window.openEditCategoryModal('${cat.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleCategoryStatus('${cat.id}')">
                          ${cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      ` : `
                        <span style="font-size: 12px; color: var(--text-light);">View Only</span>
                      `}
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
// Category Action Handlers & Modals
// --------------------------------------------------------------------------
window.handleCategorySearch = function(val) {
  categoryFilter.search = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderCategories();
};

window.handleCategoryStatusFilter = function(val) {
  categoryFilter.status = val;
  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderCategories();
};

window.viewCategoryProducts = function(catName) {
  window.router.navigate('inventory');
  setTimeout(() => {
    window.handleInventoryFilter('category', catName);
  }, 50);
};

window.openAddCategoryModal = function() {
  window.openModal({
    title: 'Add New Product Category',
    body: `
      <form id="add-category-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewCategory();">
        <div class="form-group col-span-2">
          <label class="form-label">Category Name <span class="required-star">*</span></label>
          <input type="text" id="cat-new-name" class="form-input" placeholder="e.g. Electrical & Lighting" required />
          <div class="form-hint">Must be unique across all active categories</div>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description / Scope of Items</label>
          <textarea id="cat-new-desc" class="form-textarea" rows="3" placeholder="Explain the range of products classified under this category..."></textarea>
        </div>
      </form>
    `,
    primaryText: 'Save Category',
    onPrimary: () => window.submitNewCategory()
  });
};

window.submitNewCategory = async function() {
  const name = document.getElementById('cat-new-name')?.value.trim();
  const desc = document.getElementById('cat-new-desc')?.value.trim();

  if (!name) {
    window.showToast('Category name is required.', 'error');
    return;
  }

  // Prevent duplicate category names
  if (SAMPLE_CATEGORIES.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    window.showToast(`Error: Category "${name}" already exists. Category names must be unique.`, 'error');
    return;
  }

  const newCat = {
    id: `CAT-${Math.floor(100 + Math.random() * 900)}`,
    name,
    description: desc,
    status: 'ACTIVE'
  };

  // Live API Call if configured
  if (api.isConfigured()) {
    try {
      window.showToast('Registering category in Google Sheets...', 'info');
      await api.request('createCategory', {
        method: 'POST',
        data: newCat,
        token: auth.getToken()
      });
    } catch (e) {
      console.warn('API category creation failed, continuing in memory:', e);
    }
  }

  SAMPLE_CATEGORIES.push(newCat);

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'CREATE_CATEGORY',
    module: 'Categories',
    recordId: newCat.id,
    description: `Created product category "${name}"`
  });

  window.closeModal();
  window.showToast(`Category "${name}" created successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderCategories();
};

window.openEditCategoryModal = function(id) {
  const cat = SAMPLE_CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  window.openModal({
    title: `Edit Category: ${cat.name}`,
    body: `
      <form id="edit-category-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditCategory('${cat.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Category Name <span class="required-star">*</span></label>
          <input type="text" id="cat-edit-name" class="form-input" value="${cat.name}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description</label>
          <textarea id="cat-edit-desc" class="form-textarea" rows="3">${cat.description || ''}</textarea>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Status</label>
          <select id="cat-edit-status" class="form-select">
            <option value="ACTIVE" ${cat.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
            <option value="INACTIVE" ${cat.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,
    primaryText: 'Update Category',
    onPrimary: () => window.submitEditCategory(cat.id)
  });
};

window.submitEditCategory = function(id) {
  const cat = SAMPLE_CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  const newName = document.getElementById('cat-edit-name')?.value.trim();
  const newDesc = document.getElementById('cat-edit-desc')?.value.trim();
  const newStatus = document.getElementById('cat-edit-status')?.value;

  if (!newName) {
    window.showToast('Category name cannot be empty.', 'error');
    return;
  }

  // Duplicate name check against other categories
  if (SAMPLE_CATEGORIES.some(c => c.id !== id && c.name.toLowerCase() === newName.toLowerCase())) {
    window.showToast(`Error: Another category is already named "${newName}".`, 'error');
    return;
  }

  const oldName = cat.name;
  cat.name = newName;
  cat.description = newDesc;
  cat.status = newStatus;

  // Propagate name change to products if renamed
  if (oldName !== newName) {
    SAMPLE_PRODUCTS.forEach(p => {
      if (p.category === oldName) p.category = newName;
    });
  }

  SAMPLE_AUDIT_LOGS.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: auth.getUser()?.userId || 'USR-001',
    username: auth.getUser()?.username || 'admin',
    action: 'UPDATE_CATEGORY',
    module: 'Categories',
    recordId: id,
    description: `Updated category "${oldName}" -> "${newName}"`
  });

  window.closeModal();
  window.showToast(`Category "${newName}" updated successfully.`, 'success');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderCategories();
};

window.toggleCategoryStatus = function(id) {
  const cat = SAMPLE_CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  cat.status = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  window.showToast(`Category "${cat.name}" status set to ${cat.status}.`, 'info');

  const container = document.getElementById('view-content');
  if (container) container.innerHTML = renderCategories();
};
