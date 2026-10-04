/**
 * Users.gs - User Administration & Security Privilege Controls
 * Strictly Admin-Only Operations
 */

function getUsers(session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    users.push({
      userId: row[0],
      username: row[1],
      fullName: row[3],
      email: row[4],
      role: row[5],
      status: row[6],
      createdDate: row[7],
      lastLogin: row[9]
    });
  }
  return users;
}

function createUser(payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const username = String(payload.username || '').trim().toLowerCase();
  const password = String(payload.password || '').trim();
  const fullName = String(payload.fullName || '').trim();
  const role = payload.role || 'VIEWER';

  if (!username || !password || !fullName) {
    throw new Error('Username, password, and full name are required.');
  }

  // Prevent duplicate username
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === username) {
      throw new Error(`Username "@${username}" is already taken.`);
    }
  }

  const userId = 'USR-' + (data.length).toString().padStart(3, '0');
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const hashed = hashPassword(password);

  sheet.appendRow([
    userId,
    username,
    hashed,
    fullName,
    payload.email || '',
    role,
    'ACTIVE',
    now,
    now,
    'Never'
  ]);

  recordAuditLog(session ? session.userId : '', session ? session.username : '', 'CREATE_USER', 'Users', userId, `Created user account @${username} with role ${role}`);

  return { success: true, message: `User @${username} created successfully.`, data: { userId, username, role } };
}

function deactivateUser(userId, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      if (data[i][1] === 'admin') {
        throw new Error('Cannot deactivate primary master Admin account.');
      }
      const newStatus = data[i][6] === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      sheet.getRange(i + 1, 7).setValue(newStatus);
      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_USER_STATUS', 'Users', userId, `Set user ${userId} status to ${newStatus}`);
      return { success: true, message: `User status updated to ${newStatus}.` };
    }
  }

  throw new Error('User not found.');
}

function resetUserPassword(userId, newPassword, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const hashed = hashPassword(newPassword);
      sheet.getRange(i + 1, 3).setValue(hashed);
      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'RESET_PASSWORD', 'Users', userId, `Admin reset password for user ${userId}`);
      return { success: true, message: 'User password reset successfully.' };
    }
  }

  throw new Error('User not found.');
}

function updateUser(userId, payload, session) {
  requireAuth(session ? session.token : null, ['ADMIN']);

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const username = data[i][1];
      const fullName = payload.fullName !== undefined ? String(payload.fullName).trim() : data[i][3];
      const email = payload.email !== undefined ? String(payload.email).trim() : data[i][4];
      let role = payload.role !== undefined ? payload.role : data[i][5];
      let status = payload.status !== undefined ? payload.status : data[i][6];

      // Protect master admin account from deactivation or role change
      if (username === 'admin') {
        role = 'ADMIN';
        status = 'ACTIVE';
      }

      sheet.getRange(i + 1, 4).setValue(fullName);
      sheet.getRange(i + 1, 5).setValue(email);
      sheet.getRange(i + 1, 6).setValue(role);
      sheet.getRange(i + 1, 7).setValue(status);
      sheet.getRange(i + 1, 9).setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss'));

      recordAuditLog(session ? session.userId : '', session ? session.username : '', 'UPDATE_USER', 'Users', userId, `Updated user @${username} profile and role to ${role}`);
      return { success: true, message: `User @${username} updated successfully.` };
    }
  }

  throw new Error('User not found.');
}
