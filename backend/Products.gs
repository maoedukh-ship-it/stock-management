/**
 * Products.gs - Products & Categories Master Catalog Management
 */

function getProducts() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const products = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[18] === 'ARCHIVED') continue; // Skip archived items by default

    products.push({
      id: row[0],
      sku: row[1],
      barcode: row[2],
      name: row[3],
      description: row[4],
      categoryId: row[5],
      category: row[6],
      unit: row[7],
      supplierId: row[8],
      costPrice: Number(row[9]) || 0,
      sellingPrice: Number(row[10]) || 0,
      minStock: Number(row[11]) || 0,
      maxStock: Number(row[12]) || 0,
      locationId: row[13],
      openingStock: Number(row[14]) || 0,
      currentStock: Number(row[15]) || 0,
      stockStatus: row[16],
      imageUrl: row[17],
      status: row[18],
      createdBy: row[19],
      createdDate: row[20]
    });
  }

  return products;
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id || p.sku === id) || null;
}

function createProduct(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  if (!sheet) throw new Error('Products worksheet not found.');

  const sku = String(payload.sku || '').trim();
  const name = String(payload.name || payload.productName || '').trim();
  const costPrice = parseFloat(payload.costPrice || 0);

  if (!sku || !name) {
    throw new Error('SKU and Product Name are mandatory.');
  }

  if (costPrice < 0) {
    throw new Error('Cost price cannot be negative.');
  }

  // Prevent duplicate SKU
  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (String(existing[i][1]).trim().toLowerCase() === sku.toLowerCase()) {
      throw new Error(`SKU "${sku}" already exists in the catalog.`);
    }
  }

  const productId = 'PRD-' + Math.floor(1000 + Math.random() * 9000);
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const openingStock = parseInt(payload.openingStock || 0, 10);
  const minStock = parseInt(payload.minStock || 10, 10);
  const maxStock = parseInt(payload.maxStock || (minStock * 10), 10);
  const currentStock = openingStock;

  let stockStatus = 'IN STOCK';
  if (currentStock === 0) stockStatus = 'OUT OF STOCK';
  else if (currentStock <= minStock) stockStatus = 'LOW STOCK';

  const newRow = [
    productId,
    sku,
    payload.barcode || '',
    name,
    payload.description || '',
    payload.categoryId || '',
    payload.category || payload.categoryName || '',
    payload.unit || 'Unit',
    payload.supplierId || payload.supplier || '',
    costPrice,
    parseFloat(payload.sellingPrice || (costPrice * 1.4).toFixed(2)),
    minStock,
    maxStock,
    payload.locationId || payload.location || 'Main Warehouse',
    openingStock,
    currentStock,
    stockStatus,
    payload.imageUrl || '',
    'ACTIVE',
    session ? session.username : 'admin',
    now,
    session ? session.username : 'admin',
    now
  ];

  sheet.appendRow(newRow);

  // If opening stock > 0, log an opening stock movement
  if (openingStock > 0) {
    recordStockTransaction({
      type: 'STOCK_IN',
      refNo: 'OPENING-BALANCE',
      productId: productId,
      sku: sku,
      productName: name,
      quantity: openingStock,
      unitCost: costPrice,
      supplierId: payload.supplierId || '',
      locationId: payload.locationId || payload.location || 'Main Warehouse',
      notes: 'Initial opening stock balance'
    }, session);
  }

  recalculateCurrentStockLedger();
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'CREATE_PRODUCT', 'Products', productId, `Created product [${sku}] ${name}`);

  return { success: true, message: 'Product created successfully.', data: { productId, sku, name } };
}

function updateProduct(id, payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error('Product not found.');

  // Validate duplicate SKU if changing SKU
  const newSku = String(payload.sku || '').trim();
  if (newSku) {
    for (let i = 1; i < data.length; i++) {
      if (i + 1 !== rowIndex && String(data[i][1]).trim().toLowerCase() === newSku.toLowerCase()) {
        throw new Error(`SKU "${newSku}" already belongs to another product.`);
      }
    }
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  if (payload.name) sheet.getRange(rowIndex, 4).setValue(payload.name);
  if (payload.sku) sheet.getRange(rowIndex, 2).setValue(payload.sku);
  if (payload.costPrice !== undefined) sheet.getRange(rowIndex, 10).setValue(payload.costPrice);
  if (payload.sellingPrice !== undefined) sheet.getRange(rowIndex, 11).setValue(payload.sellingPrice);
  if (payload.minStock !== undefined) sheet.getRange(rowIndex, 12).setValue(payload.minStock);
  if (payload.maxStock !== undefined) sheet.getRange(rowIndex, 13).setValue(payload.maxStock);
  sheet.getRange(rowIndex, 22).setValue(session ? session.username : 'system');
  sheet.getRange(rowIndex, 23).setValue(now);

  recalculateCurrentStockLedger();
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_PRODUCT', 'Products', id, `Updated product details for ${id}`);

  return { success: true, message: 'Product updated successfully.' };
}

function archiveProduct(id, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 19).setValue('ARCHIVED');
      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'ARCHIVE_PRODUCT', 'Products', id, `Archived product ID ${id}`);
      return { success: true, message: 'Product archived successfully.' };
    }
  }

  throw new Error('Product not found.');
}

function getCategories() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const cats = [];
  for (let i = 1; i < data.length; i++) {
    cats.push({
      id: data[i][0],
      name: data[i][1],
      description: data[i][2],
      status: data[i][3]
    });
  }
  return cats;
}

function createCategory(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  const name = String(payload.name || payload.categoryName || '').trim();

  if (!name) throw new Error('Category name is required.');

  // Prevent duplicate category name
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === name.toLowerCase()) {
      throw new Error(`Category "${name}" already exists.`);
    }
  }

  const catId = 'CAT-' + Math.floor(100 + Math.random() * 900);
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  sheet.appendRow([catId, name, payload.description || '', 'ACTIVE', now, now]);
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'CREATE_CATEGORY', 'Categories', catId, `Created category ${name}`);

  return { success: true, message: 'Category created successfully.', data: { id: catId, name } };
}

function updateCategory(id, payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  if (!sheet) throw new Error('Categories sheet not found.');

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  let oldName = '';

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      rowIndex = i + 1;
      oldName = data[i][1];
      break;
    }
  }

  if (rowIndex === -1) throw new Error('Category not found.');

  const newName = String(payload.name || payload.categoryName || oldName).trim();
  if (!newName) throw new Error('Category name cannot be empty.');

  // Check duplicate name
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== id && String(data[i][1]).trim().toLowerCase() === newName.toLowerCase()) {
      throw new Error(`Another category is already named "${newName}".`);
    }
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  sheet.getRange(rowIndex, 2).setValue(newName);
  if (payload.description !== undefined) sheet.getRange(rowIndex, 3).setValue(payload.description);
  if (payload.status !== undefined) sheet.getRange(rowIndex, 4).setValue(payload.status);
  sheet.getRange(rowIndex, 6).setValue(now);

  // If category was renamed, update corresponding products category name in Products sheet
  if (oldName !== newName) {
    const prodSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (prodSheet) {
      const prodData = prodSheet.getDataRange().getValues();
      for (let j = 1; j < prodData.length; j++) {
        if (prodData[j][6] === oldName || prodData[j][5] === id) {
          prodSheet.getRange(j + 1, 7).setValue(newName);
        }
      }
    }
  }

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_CATEGORY', 'Categories', id, `Updated category ${oldName} to ${newName}`);

  return { success: true, message: 'Category updated successfully.' };
}

function toggleCategoryStatus(id, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  if (!sheet) throw new Error('Categories sheet not found.');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const currentStatus = data[i][3];
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
      
      sheet.getRange(i + 1, 4).setValue(newStatus);
      sheet.getRange(i + 1, 6).setValue(now);

      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'TOGGLE_CATEGORY_STATUS', 'Categories', id, `Changed category ${data[i][1]} status to ${newStatus}`);
      return { success: true, message: `Category status updated to ${newStatus}.`, newStatus: newStatus };
    }
  }

  throw new Error('Category not found.');
}

