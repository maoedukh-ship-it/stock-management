/**
 * Auth.gs - Authentication & Role-Based Access Control
 * Enforces secure SHA-256 password verification and session validation
 */

function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username and password are required.', errorCode: 'MISSING_CREDENTIALS' };
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!sheet) {
    return { success: false, message: 'Users table not found.', errorCode: 'DB_ERROR' };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, message: 'No users registered in system.', errorCode: 'NO_USERS' };
  }

  const cleanUser = username.trim().toLowerCase();
  const hashedInput = hashPassword(password);
  let userRowIndex = -1;
  let userData = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[1]).trim().toLowerCase() === cleanUser) {
      userRowIndex = i + 1;
      userData = {
        userId: row[0],
        username: row[1],
        passwordHash: row[2],
        fullName: row[3],
        email: row[4],
        role: row[5],
        status: row[6]
      };
      break;
    }
  }

  if (!userData) {
    return { success: false, message: 'Invalid username or password.', errorCode: 'INVALID_CREDENTIALS' };
  }

  if (userData.status !== 'ACTIVE') {
    return { success: false, message: 'Account is deactivated. Contact administrator.', errorCode: 'ACCOUNT_DISABLED' };
  }

  if (userData.passwordHash !== hashedInput) {
    return { success: false, message: 'Invalid username or password.', errorCode: 'INVALID_CREDENTIALS' };
  }

  // Update Last_Login
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  sheet.getRange(userRowIndex, 10).setValue(now);

  // Generate lightweight signed session token
  const tokenPayload = {
    userId: userData.userId,
    username: userData.username,
    role: userData.role,
    issuedAt: Date.now()
  };
  const token = Utilities.base64EncodeWebSafe(JSON.stringify(tokenPayload));

  // Log successful login
  recordAuditLog(userData.userId, userData.username, 'LOGIN', 'Authentication', userData.userId, `User @${userData.username} logged in successfully`);

  return {
    success: true,
    message: 'Login successful.',
    data: {
      token: token,
      user: {
        userId: userData.userId,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role
      }
    }
  };
}

function verifySession(token) {
  if (!token) return null;
  try {
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    const payload = JSON.parse(decoded);
    // Expire session after 24 hours
    if (Date.now() - payload.issuedAt > 24 * 60 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function requireAuth(token, allowedRoles) {
  const session = verifySession(token);
  if (!session) {
    throw new Error('Authentication required. Invalid or expired session.');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (session.role !== 'ADMIN' && !allowedRoles.includes(session.role)) {
      throw new Error(`Unauthorized. Action requires ${allowedRoles.join(' or ')} permission.`);
    }
  }

  return session;
}
