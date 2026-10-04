/**
 * Suppliers.gs - Supplier & Vendor Management Service
 */

function getSuppliers() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SUPPLIERS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const suppliers = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    suppliers.push({
      id: row[0],
      name: row[1],
      contactPerson: row[2],
      phone: row[3],
      email: row[4],
      address: row[5],
      notes: row[6],
      status: row[7],
      createdDate: row[8]
    });
  }

  return suppliers;
}

function createSupplier(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SUPPLIERS);
  const name = String(payload.name || payload.supplierName || '').trim();

  if (!name) throw new Error('Supplier name is required.');

  // Prevent duplicate supplier name
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === name.toLowerCase()) {
      throw new Error(`Supplier "${name}" is already registered.`);
    }
  }

  const supplierId = 'SUP-' + Math.floor(100 + Math.random() * 900);
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  sheet.appendRow([
    supplierId,
    name,
    payload.contactPerson || '',
    payload.phone || '',
    payload.email || '',
    payload.address || '',
    payload.notes || '',
    'ACTIVE',
    now,
    now
  ]);

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'CREATE_SUPPLIER', 'Suppliers', supplierId, `Registered supplier ${name}`);

  return { success: true, message: 'Supplier registered successfully.', data: { id: supplierId, name } };
}

function getSupplierById(id) {
  const suppliers = getSuppliers();
  return suppliers.find(s => s.id === id || s.name.toLowerCase() === id.toLowerCase()) || null;
}

function updateSupplier(id, payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SUPPLIERS);
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

  if (rowIndex === -1) throw new Error('Supplier not found.');

  const newName = String(payload.name || payload.supplierName || oldName).trim();
  if (!newName) throw new Error('Supplier name cannot be empty.');

  // Check duplicate supplier name among other suppliers
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== id && String(data[i][1]).trim().toLowerCase() === newName.toLowerCase()) {
      throw new Error(`Another supplier is already registered as "${newName}".`);
    }
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  sheet.getRange(rowIndex, 2).setValue(newName);
  if (payload.contactPerson !== undefined) sheet.getRange(rowIndex, 3).setValue(payload.contactPerson);
  if (payload.phone !== undefined) sheet.getRange(rowIndex, 4).setValue(payload.phone);
  if (payload.email !== undefined) sheet.getRange(rowIndex, 5).setValue(payload.email);
  if (payload.address !== undefined) sheet.getRange(rowIndex, 6).setValue(payload.address);
  if (payload.notes !== undefined) sheet.getRange(rowIndex, 7).setValue(payload.notes);
  if (payload.status !== undefined) sheet.getRange(rowIndex, 8).setValue(payload.status);
  sheet.getRange(rowIndex, 10).setValue(now);

  // If supplier was renamed, update corresponding products supplier references
  if (oldName !== newName) {
    const prodSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (prodSheet) {
      const prodData = prodSheet.getDataRange().getValues();
      for (let j = 1; j < prodData.length; j++) {
        if (prodData[j][8] === oldName || prodData[j][8] === id) {
          prodSheet.getRange(j + 1, 9).setValue(newName);
        }
      }
    }
  }

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_SUPPLIER', 'Suppliers', id, `Updated supplier profile ${oldName} -> ${newName}`);

  return { success: true, message: 'Supplier updated successfully.' };
}

function toggleSupplierStatus(id, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SUPPLIERS);
  if (!sheet) throw new Error('Suppliers sheet not found.');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const currentStatus = data[i][7];
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

      sheet.getRange(i + 1, 8).setValue(newStatus);
      sheet.getRange(i + 1, 10).setValue(now);

      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'TOGGLE_SUPPLIER_STATUS', 'Suppliers', id, `Changed supplier ${data[i][1]} status to ${newStatus}`);
      return { success: true, message: `Supplier status changed to ${newStatus}.`, newStatus };
    }
  }

  throw new Error('Supplier not found.');
}

