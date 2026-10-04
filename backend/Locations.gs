/**
 * Locations.gs - Warehouse & Storage Location Service
 * Stock Management System - Phase 8 Master Data Architecture
 */

function getLocations() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOCATIONS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const locs = [];
  for (let i = 1; i < data.length; i++) {
    locs.push({
      id: data[i][0],
      name: data[i][1],
      type: data[i][2],
      address: data[i][3],
      manager: data[i][4],
      status: data[i][5],
      createdDate: data[i][6],
      updatedDate: data[i][7]
    });
  }
  return locs;
}

function getLocationById(id) {
  const locs = getLocations();
  return locs.find(l => l.id === id || l.name.toLowerCase() === id.toLowerCase()) || null;
}

function createLocation(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOCATIONS);
  if (!sheet) throw new Error('Locations sheet not found.');

  const name = String(payload.name || payload.locationName || '').trim();
  if (!name) throw new Error('Location name is required.');

  // Prevent duplicate location name
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === name.toLowerCase()) {
      throw new Error(`Location "${name}" already exists in the system.`);
    }
  }

  const locId = 'LOC-' + Math.floor(100 + Math.random() * 900);
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  sheet.appendRow([
    locId,
    name,
    payload.type || 'Central Storage',
    payload.address || '',
    payload.manager || '',
    'ACTIVE',
    now,
    now
  ]);

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'CREATE_LOCATION', 'Locations', locId, `Added location ${name} (${payload.type || 'Warehouse'})`);

  return { success: true, message: 'Location created successfully.', data: { id: locId, name } };
}

function updateLocation(id, payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOCATIONS);
  if (!sheet) throw new Error('Locations sheet not found.');

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

  if (rowIndex === -1) throw new Error('Location not found.');

  const newName = String(payload.name || payload.locationName || oldName).trim();
  if (!newName) throw new Error('Location name cannot be empty.');

  // Prevent duplicate name with other locations
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== id && String(data[i][1]).trim().toLowerCase() === newName.toLowerCase()) {
      throw new Error(`Another location is already named "${newName}".`);
    }
  }

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  sheet.getRange(rowIndex, 2).setValue(newName);
  if (payload.type !== undefined) sheet.getRange(rowIndex, 3).setValue(payload.type);
  if (payload.address !== undefined) sheet.getRange(rowIndex, 4).setValue(payload.address);
  if (payload.manager !== undefined) sheet.getRange(rowIndex, 5).setValue(payload.manager);
  if (payload.status !== undefined) sheet.getRange(rowIndex, 6).setValue(payload.status);
  sheet.getRange(rowIndex, 8).setValue(now);

  // If location renamed, cascade to products and current stock
  if (oldName !== newName) {
    const prodSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (prodSheet) {
      const prodData = prodSheet.getDataRange().getValues();
      for (let j = 1; j < prodData.length; j++) {
        if (prodData[j][13] === oldName || prodData[j][13] === id) {
          prodSheet.getRange(j + 1, 14).setValue(newName);
        }
      }
    }

    const stockSheet = ss.getSheetByName(CONFIG.SHEETS.CURRENT_STOCK);
    if (stockSheet) {
      const stockData = stockSheet.getDataRange().getValues();
      for (let k = 1; k < stockData.length; k++) {
        if (stockData[k][3] === oldName || stockData[k][3] === id) {
          stockSheet.getRange(k + 1, 4).setValue(newName);
        }
      }
    }
  }

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_LOCATION', 'Locations', id, `Updated location ${oldName} -> ${newName}`);

  return { success: true, message: 'Location updated successfully.' };
}

function toggleLocationStatus(id, session) {
  requireAuth(session ? session.token : null, ['ADMIN', 'STOCK_MANAGER']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOCATIONS);
  if (!sheet) throw new Error('Locations sheet not found.');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const currentStatus = data[i][5];
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

      sheet.getRange(i + 1, 6).setValue(newStatus);
      sheet.getRange(i + 1, 8).setValue(now);

      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'TOGGLE_LOCATION_STATUS', 'Locations', id, `Changed location ${data[i][1]} status to ${newStatus}`);
      return { success: true, message: `Location status changed to ${newStatus}.`, newStatus };
    }
  }

  throw new Error('Location not found.');
}
