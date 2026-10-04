/**
 * DatabaseSetup.gs - Google Sheets Database Schema Initializer
 * Stock Management System - Phase 2
 * 
 * Target Google Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM/edit
 */

// 1. Precise Schemas as defined in System Architecture
const DB_SCHEMAS = {
  Users: [
    'User_ID', 'Username', 'Password_Hash', 'Full_Name', 'Email',
    'Role', 'Status', 'Created_Date', 'Updated_Date', 'Last_Login'
  ],
  Products: [
    'Product_ID', 'SKU', 'Barcode', 'Product_Name', 'Description',
    'Category_ID', 'Category_Name', 'Unit', 'Supplier_ID', 'Cost_Price',
    'Selling_Price', 'Minimum_Stock', 'Maximum_Stock', 'Location_ID',
    'Opening_Stock', 'Current_Stock', 'Stock_Status', 'Image_URL',
    'Status', 'Created_By', 'Created_Date', 'Updated_By', 'Updated_Date'
  ],
  Categories: [
    'Category_ID', 'Category_Name', 'Description', 'Status', 'Created_Date', 'Updated_Date'
  ],
  Suppliers: [
    'Supplier_ID', 'Supplier_Name', 'Contact_Person', 'Phone', 'Email',
    'Address', 'Notes', 'Status', 'Created_Date', 'Updated_Date'
  ],
  Locations: [
    'Location_ID', 'Location_Name', 'Location_Type', 'Address',
    'Manager', 'Status', 'Created_Date', 'Updated_Date'
  ],
  Stock_Transactions: [
    'Transaction_ID', 'Transaction_Date', 'Transaction_Type', 'Reference_No',
    'Product_ID', 'SKU', 'Product_Name', 'Quantity', 'Unit_Cost',
    'Total_Value', 'Supplier_ID', 'Location_ID', 'Department',
    'Reason', 'Created_By', 'Created_Date', 'Notes'
  ],
  Current_Stock: [
    'Product_ID', 'SKU', 'Product_Name', 'Location_ID', 'Current_Stock',
    'Unit_Cost', 'Total_Value', 'Last_Movement_Date', 'Stock_Status'
  ],
  Stock_Adjustments: [
    'Adjustment_ID', 'Transaction_ID', 'Audit_Date', 'Reference_No',
    'Product_ID', 'System_Quantity', 'Physical_Quantity', 'Difference',
    'Adjustment_Type', 'Reason', 'Location_ID', 'Approved_By',
    'Created_Date', 'Notes'
  ],
  Audit_Log: [
    'Log_ID', 'Date_Time', 'User_ID', 'Username', 'Action',
    'Module', 'Record_ID', 'Description'
  ],
  Settings: [
    'Setting_Key', 'Setting_Value', 'Category', 'Description',
    'Updated_By', 'Updated_Date'
  ]
};

/**
 * Creates custom menu when spreadsheet is opened
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📦 Stock Management')
    .addItem('🚀 1. Setup All 10 Sheets & Columns', 'setupStockManagementDatabase')
    .addItem('📥 2. Load Sample Data & Admin User', 'loadSampleData')
    .addSeparator()
    .addItem('🔄 Recalculate Current Stock Ledger', 'recalculateCurrentStockLedger')
    .addToUi();
}

/**
 * Main Setup Function: Builds all 10 required worksheets with formatted headers
 */
function setupStockManagementDatabase() {
  const ss = getSpreadsheet();
  
  // Rename spreadsheet to official title
  try {
    ss.rename(CONFIG.SPREADSHEET_NAME);
  } catch (e) {
    Logger.log('Spreadsheet rename info: ' + e);
  }

  Logger.log('Starting Stock Management Database Initialization...');

  const existingSheets = ss.getSheets().map(s => s.getName());
  const sheetNames = Object.keys(DB_SCHEMAS);

  sheetNames.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    const headers = DB_SCHEMAS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`Created worksheet: ${sheetName}`);
    } else {
      Logger.log(`Worksheet exists: ${sheetName}`);
    }

    // Set Header Columns
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Apply Professional Corporate Styling
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0057E7')
               .setFontColor('#FFFFFF')
               .setFontWeight('bold')
               .setFontFamily('Arial')
               .setFontSize(10)
               .setVerticalAlignment('middle')
               .setHorizontalAlignment('center')
               .setWrap(false);

    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    // Auto-fit column widths
    for (let c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
      if (sheet.getColumnWidth(c) < 120) {
        sheet.setColumnWidth(c, 130);
      }
    }
  });

  // Remove default 'Sheet1' if all other sheets exist
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
      Logger.log('Removed empty default sheet.');
    } catch (e) {
      Logger.log('Could not remove default sheet: ' + e);
    }
  }

  Logger.log('Database initialization completed successfully!');
  try {
    SpreadsheetApp.getUi().alert('Success', 'Stock Management Database structure created with all 10 worksheets and headers.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
}

/**
 * SHA-256 Password Hash Generator
 */
function hashPassword(plainText) {
  const salted = plainText + CONFIG.PASSWORD_SALT;
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salted, Utilities.Charset.UTF_8);
  let hashStr = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let hex = byteVal.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hashStr += hex;
  }
  return hashStr;
}

/**
 * Populates initial sample data, categories, locations, suppliers, products, and admin accounts
 */
function loadSampleData() {
  const ss = getSpreadsheet();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd');

  // 1. Initial Users
  const usersSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    const sampleUsers = [
      ['USR-001', 'admin', hashPassword('admin123'), 'Alex Thorne', 'admin@company.com', 'ADMIN', 'ACTIVE', now, now, now],
      ['USR-002', 'manager', hashPassword('mgr123'), 'Sarah Chen', 'manager@company.com', 'STOCK_MANAGER', 'ACTIVE', now, now, now],
      ['USR-003', 'viewer', hashPassword('view123'), 'David Kim', 'viewer@company.com', 'VIEWER', 'ACTIVE', now, now, now]
    ];
    usersSheet.getRange(2, 1, sampleUsers.length, sampleUsers[0].length).setValues(sampleUsers);
  }

  // 2. Categories
  const catSheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  if (catSheet && catSheet.getLastRow() <= 1) {
    const sampleCats = [
      ['CAT-001', 'Stationery', 'Office paper, pens, notebooks, and clips', 'ACTIVE', now, now],
      ['CAT-002', 'Cleaning Supplies', 'Disinfectants, detergents, mops, sanitizers', 'ACTIVE', now, now],
      ['CAT-003', 'Packaging', 'Boxes, bubble wrap, tape, cartons', 'ACTIVE', now, now],
      ['CAT-004', 'IT Equipment', 'Toners, cables, keyboards, mice, adapters', 'ACTIVE', now, now],
      ['CAT-005', 'Office Supplies', 'Binders, desk organizers, staplers', 'ACTIVE', now, now]
    ];
    catSheet.getRange(2, 1, sampleCats.length, sampleCats[0].length).setValues(sampleCats);
  }

  // 3. Suppliers
  const supSheet = ss.getSheetByName(CONFIG.SHEETS.SUPPLIERS);
  if (supSheet && supSheet.getLastRow() <= 1) {
    const sampleSuppliers = [
      ['SUP-001', 'ABC Trading', 'Robert Miller', '+1 (555) 234-5678', 'sales@abctrading.com', '450 Industrial Parkway, Suite 100, Chicago, IL', 'Authorized stationery & bulk importer', 'ACTIVE', now, now],
      ['SUP-002', 'Office Supply Co.', 'Elena Rostova', '+1 (555) 876-5432', 'orders@officesupplyco.com', '88 Commerce Blvd, Dallas, TX', 'Wholesale IT hardware & office tech', 'ACTIVE', now, now],
      ['SUP-003', 'Global Stationery', 'Michael Chang', '+1 (555) 998-1122', 'contact@globalstationery.com', '12 Logistics Way, Seattle, WA', 'Direct paper mill distributor', 'ACTIVE', now, now]
    ];
    supSheet.getRange(2, 1, sampleSuppliers.length, sampleSuppliers[0].length).setValues(sampleSuppliers);
  }

  // 4. Locations
  const locSheet = ss.getSheetByName(CONFIG.SHEETS.LOCATIONS);
  if (locSheet && locSheet.getLastRow() <= 1) {
    const sampleLocations = [
      ['LOC-001', 'Main Warehouse', 'Central Storage', 'Building A, Logistics Center, West Gate', 'Sarah Chen', 'ACTIVE', now, now],
      ['LOC-002', 'Head Office', 'Corporate Store', 'Floor 4, Financial Tower, Suite 402', 'Alex Thorne', 'ACTIVE', now, now],
      ['LOC-003', 'Store 01', 'Retail Outlet', 'Shop 14, Downtown Plaza Mall', 'James Wilson', 'ACTIVE', now, now]
    ];
    locSheet.getRange(2, 1, sampleLocations.length, sampleLocations[0].length).setValues(sampleLocations);
  }

  // 5. Products
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  if (prdSheet && prdSheet.getLastRow() <= 1) {
    const sampleProducts = [
      ['PRD-1001', 'STA-A4P-01', '880123456001', 'A4 Copier Paper (80gsm, 500 Sheets)', 'Premium multipurpose white paper', 'CAT-001', 'Stationery', 'Ream', 'SUP-001', 4.50, 6.99, 50, 500, 'LOC-001', 200, 340, 'IN STOCK', '', 'ACTIVE', 'USR-001', now, 'USR-001', now],
      ['PRD-1002', 'STA-PEN-02', '880123456002', 'Ballpoint Pen 0.7mm (Box of 50)', 'Smooth blue ink roller pens', 'CAT-001', 'Stationery', 'Box', 'SUP-003', 8.20, 12.50, 25, 200, 'LOC-003', 40, 18, 'LOW STOCK', '', 'ACTIVE', 'USR-001', now, 'USR-001', now],
      ['PRD-1003', 'IT-TON-03', '880123456003', 'LaserJet Printer Toner Cartridge (Black)', 'High-yield toner cartridge 3000 pages', 'CAT-004', 'IT Equipment', 'Cartridge', 'SUP-002', 45.00, 68.00, 10, 50, 'LOC-002', 15, 0, 'OUT OF STOCK', '', 'ACTIVE', 'USR-001', now, 'USR-001', now],
      ['PRD-1004', 'CLN-LIQ-04', '880123456004', 'Commercial Surface Disinfectant Liquid 5L', 'Multi-surface sanitizing concentrate', 'CAT-002', 'Cleaning Supplies', 'Bottle', 'SUP-001', 14.50, 22.00, 20, 100, 'LOC-001', 60, 85, 'IN STOCK', '', 'ACTIVE', 'USR-001', now, 'USR-001', now],
      ['PRD-1005', 'PCK-BOX-05', '880123456005', 'Heavy Duty Corrugated Carton (Pack of 25)', 'Double-wall shipping boxes 16x12x12', 'CAT-003', 'Packaging', 'Bundle', 'SUP-002', 18.00, 26.50, 30, 300, 'LOC-001', 120, 22, 'LOW STOCK', '', 'ACTIVE', 'USR-001', now, 'USR-001', now]
    ];
    prdSheet.getRange(2, 1, sampleProducts.length, sampleProducts[0].length).setValues(sampleProducts);

    // Number formats for currency and quantities
    prdSheet.getRange(2, 10, sampleProducts.length, 2).setNumberFormat('$#,##0.00');
    prdSheet.getRange(2, 12, sampleProducts.length, 5).setNumberFormat('#,##0');
  }

  // 6. Stock Transactions (Initial movements)
  const txSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_TRANSACTIONS);
  if (txSheet && txSheet.getLastRow() <= 1) {
    const sampleTxns = [
      ['TXN-20261003-01', now, 'STOCK_IN', 'PO-98421', 'PRD-1001', 'STA-A4P-01', 'A4 Copier Paper (80gsm, 500 Sheets)', 50, 4.50, 225.00, 'SUP-001', 'LOC-001', 'Procurement', 'Purchase Order', 'USR-002', now, 'Received at Central Dock'],
      ['TXN-20261003-02', now, 'STOCK_OUT', 'REQ-4402', 'PRD-1004', 'CLN-LIQ-04', 'Commercial Surface Disinfectant Liquid 5L', 5, 14.50, 72.50, 'SUP-001', 'LOC-001', 'Operations', 'Internal Consumption', 'USR-001', now, 'Facility sanitization supplies'],
      ['TXN-20261003-03', now, 'ADJUSTMENT_OUT', 'ADJ-1029', 'PRD-1003', 'IT-TON-03', 'LaserJet Printer Toner Cartridge (Black)', 2, 45.00, 90.00, 'SUP-002', 'LOC-002', 'IT Support', 'Physical Count Variance', 'USR-002', now, 'Audit reconciliation']
    ];
    txSheet.getRange(2, 1, sampleTxns.length, sampleTxns[0].length).setValues(sampleTxns);
    txSheet.getRange(2, 8, sampleTxns.length, 1).setNumberFormat('#,##0');
    txSheet.getRange(2, 9, sampleTxns.length, 2).setNumberFormat('$#,##0.00');
  }

  // 7. Stock Adjustments Log
  const adjSheet = ss.getSheetByName(CONFIG.SHEETS.STOCK_ADJUSTMENTS);
  if (adjSheet && adjSheet.getLastRow() <= 1) {
    const sampleAdj = [
      ['ADJ-1029', 'TXN-20261003-03', today, 'ADJ-1029', 'PRD-1003', 2, 0, -2, 'ADJUSTMENT_OUT', 'Physical Count Variance', 'LOC-002', 'Alex Thorne', now, 'Annual reconciliation verified']
    ];
    adjSheet.getRange(2, 1, sampleAdj.length, sampleAdj[0].length).setValues(sampleAdj);
  }

  // 8. Settings
  const setSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (setSheet && setSheet.getLastRow() <= 1) {
    const sampleSettings = [
      ['COMPANY_NAME', 'Apex Logistics & Supply Enterprise', 'Company Information', 'Official legal business entity name', 'USR-001', now],
      ['COMPANY_ADDRESS', '100 North Pier Terminal, Suite 500, Chicago, IL 60601', 'Company Information', 'Corporate physical headquarters address', 'USR-001', now],
      ['COMPANY_PHONE', '+1 (555) 789-0123', 'Company Information', 'Primary operations telephone', 'USR-001', now],
      ['COMPANY_EMAIL', 'inventory@apexsupply.com', 'Company Information', 'Inbound inventory dispatch email', 'USR-001', now],
      ['DEFAULT_MIN_STOCK', '20', 'Inventory Settings', 'Default minimum threshold for low stock alert', 'USR-001', now],
      ['DEFAULT_LOCATION', 'LOC-001', 'Inventory Settings', 'Default storage warehouse for intake', 'USR-001', now],
      ['CURRENCY', 'USD ($)', 'Inventory Settings', 'Standard financial valuation currency', 'USR-001', now],
      ['LANGUAGE', 'English', 'System Settings', 'Primary language (English / Khmer)', 'USR-001', now]
    ];
    setSheet.getRange(2, 1, sampleSettings.length, sampleSettings[0].length).setValues(sampleSettings);
  }

  // 9. Audit Log
  const auditSheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
  if (auditSheet && auditSheet.getLastRow() <= 1) {
    const sampleAudit = [
      ['LOG-0001', now, 'USR-001', 'admin', 'INITIALIZE_DATABASE', 'System Setup', 'Stock_Management_Database', 'Database created with 10 worksheets and master schemas'],
      ['LOG-0002', now, 'USR-001', 'admin', 'LOAD_SAMPLE_DATA', 'Data Seeder', 'Initial Seed', 'Initial products, categories, suppliers, locations, and users loaded']
    ];
    auditSheet.getRange(2, 1, sampleAudit.length, sampleAudit[0].length).setValues(sampleAudit);
  }

  // 10. Recalculate Current Stock Sheet
  recalculateCurrentStockLedger();

  Logger.log('Sample data loaded successfully!');
  try {
    SpreadsheetApp.getUi().alert('Success', 'Sample data loaded successfully with Admin, Products, Suppliers, and Settings!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
}

/**
 * Recalculates Current_Stock worksheet from Products and Transactions
 */
function recalculateCurrentStockLedger() {
  const ss = getSpreadsheet();
  const prdSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
  const curStockSheet = ss.getSheetByName(CONFIG.SHEETS.CURRENT_STOCK);

  if (!prdSheet || !curStockSheet) return;

  const prdData = prdSheet.getDataRange().getValues();
  if (prdData.length <= 1) return;

  const rows = [];
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  for (let i = 1; i < prdData.length; i++) {
    const p = prdData[i];
    const prdId = p[0];
    const sku = p[1];
    const name = p[3];
    const locId = p[13];
    const currentStock = Number(p[15]) || 0;
    const unitCost = Number(p[9]) || 0;
    const totalVal = currentStock * unitCost;
    const status = p[16];

    rows.push([prdId, sku, name, locId, currentStock, unitCost, totalVal, now, status]);
  }

  // Clear existing data rows in Current_Stock
  if (curStockSheet.getLastRow() > 1) {
    curStockSheet.getRange(2, 1, curStockSheet.getLastRow() - 1, DB_SCHEMAS.Current_Stock.length).clearContent();
  }

  if (rows.length > 0) {
    curStockSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    curStockSheet.getRange(2, 5, rows.length, 1).setNumberFormat('#,##0');
    curStockSheet.getRange(2, 6, rows.length, 2).setNumberFormat('$#,##0.00');
  }
}
