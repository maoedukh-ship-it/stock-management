/**
 * Config.gs - Master System & Database Configuration
 * Google Spreadsheet ID: 1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM
 */

const CONFIG = {
  SPREADSHEET_ID: '1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM',
  SPREADSHEET_NAME: 'Stock_Management_Database',
  
  SHEETS: {
    USERS: 'Users',
    PRODUCTS: 'Products',
    CATEGORIES: 'Categories',
    SUPPLIERS: 'Suppliers',
    LOCATIONS: 'Locations',
    STOCK_TRANSACTIONS: 'Stock_Transactions',
    CURRENT_STOCK: 'Current_Stock',
    STOCK_ADJUSTMENTS: 'Stock_Adjustments',
    AUDIT_LOG: 'Audit_Log',
    SETTINGS: 'Settings'
  },

  ROLES: {
    ADMIN: 'ADMIN',
    STOCK_MANAGER: 'STOCK_MANAGER',
    VIEWER: 'VIEWER'
  },

  PASSWORD_SALT: 'Apex_SMS_Secure_Salt_2026'
};

/**
 * Returns active spreadsheet or opens via configured SPREADSHEET_ID
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Standalone fallback
  }
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}
