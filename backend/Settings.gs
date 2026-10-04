/**
 * Settings.gs - System & Inventory Business Rules Configuration
 */

function getSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};

  const settings = {};
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const val = data[i][1];
    settings[key] = val;
  }
  return settings;
}

function updateSettings(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) throw new Error('Settings worksheet not found.');

  const data = sheet.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  Object.keys(payload).forEach(key => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(payload[key]);
        sheet.getRange(i + 1, 5).setValue(session ? session.username : 'admin');
        sheet.getRange(i + 1, 6).setValue(now);
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([key, payload[key], 'General', '', session ? session.username : 'admin', now]);
    }
  });

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_SETTINGS', 'Settings', 'SYSTEM', 'Updated system configuration parameters');

  return { success: true, message: 'Settings saved successfully.' };
}
