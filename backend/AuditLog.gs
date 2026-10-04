/**
 * AuditLog.gs - Immutable Activity Logging Engine
 * Captures all critical operations: LOGIN, STOCK_IN, STOCK_OUT, ADJUSTMENT, etc.
 */

function recordAuditLog(userId, username, action, moduleName, recordId, description) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
    if (!sheet) return;

    const logId = 'LOG-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      logId,
      now,
      userId || 'SYSTEM',
      username || 'system',
      action,
      moduleName,
      recordId || '-',
      description || ''
    ]);
  } catch (err) {
    Logger.log('Audit log recording error: ' + err.toString());
  }
}

function getAuditLogs(limit, filters) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const f = filters || {};
  const logs = [];
  const max = limit || 500;

  // Retrieve in reverse chronological order
  for (let i = data.length - 1; i >= 1 && logs.length < max; i--) {
    const row = data[i];
    const logItem = {
      id: row[0],
      dateTime: row[1],
      userId: row[2],
      username: row[3],
      action: row[4],
      module: row[5],
      recordId: row[6],
      description: row[7]
    };

    if (f.module && f.module !== 'ALL' && logItem.module !== f.module) continue;
    if (f.username && f.username !== 'ALL' && logItem.username !== f.username) continue;
    if (f.action && f.action !== 'ALL' && logItem.action !== f.action) continue;
    if (f.dateFrom && String(logItem.dateTime).slice(0, 10) < f.dateFrom) continue;
    if (f.dateTo && String(logItem.dateTime).slice(0, 10) > f.dateTo) continue;
    if (f.search) {
      const term = String(f.search).toLowerCase();
      const match = String(logItem.description).toLowerCase().includes(term) ||
                    String(logItem.action).toLowerCase().includes(term) ||
                    String(logItem.username).toLowerCase().includes(term) ||
                    String(logItem.recordId).toLowerCase().includes(term);
      if (!match) continue;
    }

    logs.push(logItem);
  }

  return logs;
}
