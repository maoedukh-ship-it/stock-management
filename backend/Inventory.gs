/**
 * Inventory.gs - Core Inventory Calculations & Stock Movements Engine
 * Enforces transaction-based recalculation:
 * Current Stock = Opening Stock + Stock In - Stock Out + Adjustment In - Adjustment Out
 */

function createStockIn(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const txSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);

  const productId = payload.productId || payload.id;
  const quantity = parseInt(payload.quantity || 0, 10);
  const unitCost = parseFloat(payload.unitCost || 0);
  const refNo = String(payload.refNo || payload.referenceNo || '').trim();

  if (!productId || quantity <= 0 || unitCost < 0 || !refNo) {
    throw new Error('Invalid Stock In parameters. Quantity must be greater than zero.');
  }

  // Find product
  const prdData = prdSheet.getDataRange().getValues();
  let prdRowIndex = -1;
  let product = null;

  for (let i = 1; i < prdData.length; i++) {
    if (prdData[i][0] === productId || prdData[i][1] === productId) {
      prdRowIndex = i + 1;
      product = {
        id: prdData[i][0],
        sku: prdData[i][1],
        name: prdData[i][3],
        minStock: Number(prdData[i][11]) || 0,
        currentStock: Number(prdData[i][15]) || 0,
        location: prdData[i][13]
      };
      break;
    }
  }

  if (!product) throw new Error('Product not found in master catalog.');

  // Create Transaction Record
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const dateTag = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyyMMdd');
  const txnId = `TXN-${dateTag}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalVal = quantity * unitCost;

  txSheet.appendRow([
    txnId,
    payload.date || now,
    'STOCK_IN',
    refNo,
    product.id,
    product.sku,
    product.name,
    quantity,
    unitCost,
    totalVal,
    payload.supplierId || payload.supplier || '',
    payload.locationId || payload.location || product.location,
    payload.department || 'Procurement',
    payload.reason || 'Supplier Purchase Receipt',
    session ? session.username : 'admin',
    now,
    payload.notes || ''
  ]);

  // Recalculate Product Stock
  const newCurrentStock = product.currentStock + quantity;
  let newStatus = 'IN STOCK';
  if (newCurrentStock <= product.minStock) newStatus = 'LOW STOCK';

  prdSheet.getRange(prdRowIndex, 16).setValue(newCurrentStock);
  prdSheet.getRange(prdRowIndex, 17).setValue(newStatus);
  prdSheet.getRange(prdRowIndex, 22).setValue(session ? session.username : 'system');
  prdSheet.getRange(prdRowIndex, 23).setValue(now);

  // Recalculate Current Stock Sheet & Audit Log
  recalculateCurrentStockLedger();
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'STOCK_IN', 'Stock In', txnId, `Received ${quantity} units of [${product.sku}] ${product.name} (Ref: ${refNo})`);

  return {
    success: true,
    message: 'Stock In recorded successfully.',
    data: { txnId, newCurrentStock, stockStatus: newStatus }
  };
}

function createStockOut(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const txSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);

  const productId = payload.productId || payload.id;
  const quantity = parseInt(payload.quantity || 0, 10);
  const refNo = String(payload.refNo || payload.referenceNo || '').trim();

  if (!productId || quantity <= 0 || !refNo) {
    throw new Error('Invalid Stock Out request. Quantity must be greater than zero.');
  }

  // Find product
  const prdData = prdSheet.getDataRange().getValues();
  let prdRowIndex = -1;
  let product = null;

  for (let i = 1; i < prdData.length; i++) {
    if (prdData[i][0] === productId || prdData[i][1] === productId) {
      prdRowIndex = i + 1;
      product = {
        id: prdData[i][0],
        sku: prdData[i][1],
        name: prdData[i][3],
        costPrice: Number(prdData[i][9]) || 0,
        minStock: Number(prdData[i][11]) || 0,
        currentStock: Number(prdData[i][15]) || 0,
        unit: prdData[i][7],
        location: prdData[i][13]
      };
      break;
    }
  }

  if (!product) throw new Error('Product not found in master catalog.');

  // Strict Anti-Negative Stock Guardrail
  if (quantity > product.currentStock) {
    throw new Error(`Insufficient stock. Available quantity: ${product.currentStock} ${product.unit}`);
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const dateTag = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyyMMdd');
  const txnId = `TXN-${dateTag}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalVal = quantity * product.costPrice;

  txSheet.appendRow([
    txnId,
    payload.date || now,
    'STOCK_OUT',
    refNo,
    product.id,
    product.sku,
    product.name,
    quantity,
    product.costPrice,
    totalVal,
    '',
    payload.locationId || payload.location || product.location,
    payload.department || 'Operations',
    payload.reason || 'Requisition Dispatch',
    session ? session.username : 'admin',
    now,
    payload.notes || ''
  ]);

  // Recalculate Balance
  const newCurrentStock = product.currentStock - quantity;
  let newStatus = 'IN STOCK';
  if (newCurrentStock === 0) newStatus = 'OUT OF STOCK';
  else if (newCurrentStock <= product.minStock) newStatus = 'LOW STOCK';

  prdSheet.getRange(prdRowIndex, 16).setValue(newCurrentStock);
  prdSheet.getRange(prdRowIndex, 17).setValue(newStatus);
  prdSheet.getRange(prdRowIndex, 22).setValue(session ? session.username : 'system');
  prdSheet.getRange(prdRowIndex, 23).setValue(now);

  recalculateCurrentStockLedger();
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'STOCK_OUT', 'Stock Out', txnId, `Dispatched ${quantity} units of [${product.sku}] ${product.name} (Ref: ${refNo})`);

  return {
    success: true,
    message: 'Stock Out recorded successfully.',
    data: { txnId, newCurrentStock, stockStatus: newStatus }
  };
}

function createStockAdjustment(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const txSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);
  const adjSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_ADJUSTMENTS);

  const productId = payload.productId || payload.id;
  const physicalQty = parseInt(payload.physicalQuantity, 10);
  const reason = String(payload.reason || '').trim();
  const refNo = String(payload.refNo || payload.referenceNo || '').trim();

  if (!productId || isNaN(physicalQty) || !reason || !refNo) {
    throw new Error('Product, verified physical quantity, reason, and reference number are mandatory.');
  }

  const prdData = prdSheet.getDataRange().getValues();
  let prdRowIndex = -1;
  let product = null;

  for (let i = 1; i < prdData.length; i++) {
    if (prdData[i][0] === productId || prdData[i][1] === productId) {
      prdRowIndex = i + 1;
      product = {
        id: prdData[i][0],
        sku: prdData[i][1],
        name: prdData[i][3],
        costPrice: Number(prdData[i][9]) || 0,
        minStock: Number(prdData[i][11]) || 0,
        systemStock: Number(prdData[i][15]) || 0,
        unit: prdData[i][7],
        location: prdData[i][13]
      };
      break;
    }
  }

  if (!product) throw new Error('Product not found.');

  const difference = physicalQty - product.systemStock;
  if (difference === 0) {
    return { success: true, message: 'Physical count matches system balance. No variance to post.' };
  }

  const txnType = difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
  const absQty = Math.abs(difference);
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd');
  const dateTag = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyyMMdd');
  const txnId = `TXN-${dateTag}-${Math.floor(1000 + Math.random() * 9000)}`;
  const adjId = `ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Save Adjustment Record
  adjSheet.appendRow([
    adjId,
    txnId,
    payload.date || today,
    refNo,
    product.id,
    product.systemStock,
    physicalQty,
    difference,
    txnType,
    reason,
    payload.locationId || payload.location || product.location,
    session ? session.username : 'admin',
    now,
    payload.notes || ''
  ]);

  // 2. Save Transaction Record
  txSheet.appendRow([
    txnId,
    payload.date || now,
    txnType,
    refNo,
    product.id,
    product.sku,
    product.name,
    absQty,
    product.costPrice,
    absQty * product.costPrice,
    '',
    payload.locationId || payload.location || product.location,
    'Inventory Control',
    reason,
    session ? session.username : 'admin',
    now,
    payload.notes || ''
  ]);

  // 3. Update Product Row
  let newStatus = 'IN STOCK';
  if (physicalQty === 0) newStatus = 'OUT OF STOCK';
  else if (physicalQty <= product.minStock) newStatus = 'LOW STOCK';

  prdSheet.getRange(prdRowIndex, 16).setValue(physicalQty);
  prdSheet.getRange(prdRowIndex, 17).setValue(newStatus);
  prdSheet.getRange(prdRowIndex, 22).setValue(session ? session.username : 'system');
  prdSheet.getRange(prdRowIndex, 23).setValue(now);

  recalculateCurrentStockLedger();
  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'STOCK_ADJUSTMENT', 'Stock Adjustment', adjId, `Reconciled ${product.name} from ${product.systemStock} to ${physicalQty} (${difference > 0 ? '+' : ''}${difference})`);

  return {
    success: true,
    message: 'Stock adjustment posted successfully.',
    data: { adjId, txnId, newCurrentStock: physicalQty, difference }
  };
}

function getTransactions(filters) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const txns = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    txns.push({
      id: row[0],
      date: row[1],
      type: row[2],
      refNo: row[3],
      productId: row[4],
      sku: row[5],
      productName: row[6],
      quantity: Number(row[7]) || 0,
      unitCost: Number(row[8]) || 0,
      totalValue: Number(row[9]) || 0,
      supplier: row[10],
      location: row[11],
      department: row[12],
      reason: row[13],
      user: row[14],
      createdDate: row[15],
      notes: row[16]
    });
  }

  return txns;
}

function getCurrentStock() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CURRENT_STOCK);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const stock = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    stock.push({
      productId: row[0],
      sku: row[1],
      name: row[2],
      locationId: row[3],
      currentStock: Number(row[4]) || 0,
      unitCost: Number(row[5]) || 0,
      totalValue: Number(row[6]) || 0,
      lastMovementDate: row[7],
      stockStatus: row[8]
    });
  }
  return stock;
}

function getLowStock() {
  return getCurrentStock().filter(s => s.stockStatus === 'LOW STOCK');
}

function getOutOfStock() {
  return getCurrentStock().filter(s => s.stockStatus === 'OUT OF STOCK');
}

function getAdjustments() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_ADJUSTMENTS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const adjs = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    adjs.push({
      id: row[0],
      transactionId: row[1],
      date: row[2],
      refNo: row[3],
      productId: row[4],
      systemStock: Number(row[5]) || 0,
      physicalStock: Number(row[6]) || 0,
      difference: Number(row[7]) || 0,
      type: row[8],
      reason: row[9],
      location: row[10],
      approvedBy: row[11],
      createdDate: row[12],
      notes: row[13]
    });
  }
  return adjs;
}

/**
 * Phase 12 - Transaction-Based Current Stock Calculation Engine
 * Formula: Current Stock = Opening Stock + Stock In - Stock Out + Adjustment In - Adjustment Out
 */
function recalculateCurrentStockLedger(session) {
  const ss = getSpreadsheet();
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const txSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);
  const curStockSheet = ss.getSheetByName(CONFIG.SHEETS.CURRENT_STOCK);

  if (!prdSheet || !curStockSheet) return { success: false, message: 'Required database worksheets missing.' };

  const prdData = prdSheet.getDataRange().getValues();
  if (prdData.length <= 1) return { success: true, count: 0, message: 'Master catalog is empty.' };

  // 1. Aggregate movements from Stock_Transactions
  const movements = {};
  if (txSheet && txSheet.getLastRow() > 1) {
    const txData = txSheet.getDataRange().getValues();
    for (let i = 1; i < txData.length; i++) {
      const row = txData[i];
      const pId = String(row[4] || '');
      const type = String(row[2] || '');
      const qty = Number(row[7]) || 0;
      const date = row[1];

      if (!pId) continue;
      if (!movements[pId]) {
        movements[pId] = { in: 0, out: 0, adjIn: 0, adjOut: 0, lastDate: date };
      }
      if (type === 'STOCK_IN') movements[pId].in += qty;
      else if (type === 'STOCK_OUT') movements[pId].out += qty;
      else if (type === 'ADJUSTMENT_IN') movements[pId].adjIn += qty;
      else if (type === 'ADJUSTMENT_OUT') movements[pId].adjOut += qty;

      if (date && (!movements[pId].lastDate || date > movements[pId].lastDate)) {
        movements[pId].lastDate = date;
      }
    }
  }

  const curStockRows = [];
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  // 2. Iterate each product and compute exact balance
  for (let i = 1; i < prdData.length; i++) {
    const p = prdData[i];
    const pId = String(p[0]);
    const sku = p[1];
    const name = p[3];
    const unitCost = Number(p[9]) || 0;
    const minStock = Number(p[11]) || 0;
    const locId = p[13];
    const openingStock = Number(p[14]) || 0;

    const m = movements[pId] || { in: 0, out: 0, adjIn: 0, adjOut: 0, lastDate: now };
    const currentStock = Math.max(0, openingStock + m.in - m.out + m.adjIn - m.adjOut);
    const totalVal = currentStock * unitCost;

    let status = 'IN STOCK';
    if (currentStock === 0) status = 'OUT OF STOCK';
    else if (currentStock <= minStock) status = 'LOW STOCK';

    // Update Products row: Column 16 (Current_Stock), Column 17 (Stock_Status), Column 23 (Updated_Date)
    prdSheet.getRange(i + 1, 16).setValue(currentStock);
    prdSheet.getRange(i + 1, 17).setValue(status);
    prdSheet.getRange(i + 1, 23).setValue(now);

    curStockRows.push([
      pId,
      sku,
      name,
      locId,
      currentStock,
      unitCost,
      totalVal,
      m.lastDate || now,
      status
    ]);
  }

  // 3. Populate Current_Stock worksheet
  if (curStockSheet.getLastRow() > 1) {
    curStockSheet.getRange(2, 1, curStockSheet.getLastRow() - 1, 9).clearContent();
  }

  if (curStockRows.length > 0) {
    curStockSheet.getRange(2, 1, curStockRows.length, curStockRows[0].length).setValues(curStockRows);
    curStockSheet.getRange(2, 5, curStockRows.length, 1).setNumberFormat('#,##0');
    curStockSheet.getRange(2, 6, curStockRows.length, 2).setNumberFormat('$#,##0.00');
  }

  recordAuditLog(session ? session.userId : '', session ? session.username : 'system', 'RECALCULATE_STOCK', 'Current Stock', 'ALL', `Recalculated transaction balances for ${curStockRows.length} catalog items`);

  return { success: true, count: curStockRows.length, message: `Successfully synchronized ${curStockRows.length} catalog items.` };
}


