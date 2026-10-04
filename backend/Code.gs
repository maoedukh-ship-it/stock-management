/**
 * Code.gs - Google Apps Script Web API Gateway
 * Stock Management System - Phase 3 Backend Architecture
 * 
 * Handles incoming HTTP GET & POST REST-like requests from the frontend
 * Returns standardized JSON envelopes with CORS headers
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

    const params = e && e.parameter ? e.parameter : {};

    // Parse POST payload
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        body = {};
      }
    }

    // Support nested payload ({ data: ... }) or flat payload
    const payload = (body && body.data && typeof body.data === 'object' && !body.sku && !body.username) ? body.data : body;
    const action = String(params.action || body.action || payload.action || '').trim();
    const token = params.token || body.token || payload.token || null;
    const session = token ? verifySession(token) : null;

    let result = null;

    // Action Dispatcher
    switch (action) {
      case 'ping':
        result = { success: true, message: 'Stock Management API online.', timestamp: new Date().toISOString() };
        break;

      // Auth
      case 'login':
        result = loginUser(body.username || params.username, body.password || params.password);
        break;

      // Dashboard
      case 'getDashboard':
        result = { success: true, data: getDashboardData() };
        break;

      // Products & Categories
      case 'getProducts':
        result = { success: true, data: getProducts() };
        break;
      case 'getProduct':
        result = { success: true, data: getProductById(params.id || payload.id || body.id) };
        break;
      case 'createProduct':
        result = createProduct(payload, session);
        break;
      case 'updateProduct':
        result = updateProduct(payload.id || params.id || body.id, payload, session);
        break;
      case 'archiveProduct':
        result = archiveProduct(payload.id || params.id || body.id, session);
        break;
      case 'getCategories':
        result = { success: true, data: getCategories() };
        break;
      case 'createCategory':
        result = createCategory(payload, session);
        break;
      case 'updateCategory':
        result = updateCategory(payload.id || params.id || body.id, payload, session);
        break;
      case 'toggleCategoryStatus':
        result = toggleCategoryStatus(payload.id || params.id || body.id, session);
        break;

      // Suppliers & Locations
      case 'getSuppliers':
        result = { success: true, data: getSuppliers() };
        break;
      case 'getSupplier':
        result = { success: true, data: getSupplierById(params.id || payload.id || body.id) };
        break;
      case 'createSupplier':
        result = createSupplier(payload, session);
        break;
      case 'updateSupplier':
        result = updateSupplier(payload.id || params.id || body.id, payload, session);
        break;
      case 'toggleSupplierStatus':
        result = toggleSupplierStatus(payload.id || params.id || body.id, session);
        break;
      case 'getLocations':
        result = { success: true, data: getLocations() };
        break;
      case 'getLocation':
        result = { success: true, data: getLocationById(params.id || payload.id || body.id) };
        break;
      case 'createLocation':
        result = createLocation(payload, session);
        break;
      case 'updateLocation':
        result = updateLocation(payload.id || params.id || body.id, payload, session);
        break;
      case 'toggleLocationStatus':
        result = toggleLocationStatus(payload.id || params.id || body.id, session);
        break;

      // Inventory & Ledger
      case 'createStockIn':
        result = createStockIn(payload, session);
        break;
      case 'createStockOut':
        result = createStockOut(payload, session);
        break;
      case 'createStockAdjustment':
        result = createStockAdjustment(payload, session);
        break;
      case 'getAdjustments':
        result = { success: true, data: getAdjustments() };
        break;
      case 'recalculateStockLedger':
        result = recalculateCurrentStockLedger(session);
        break;
      case 'getCurrentStock':
        result = { success: true, data: getCurrentStock() };
        break;
      case 'getLowStock':
        result = { success: true, data: getLowStock() };
        break;
      case 'getOutOfStock':
        result = { success: true, data: getOutOfStock() };
        break;
      case 'getTransactions':
        result = { success: true, data: getTransactions(params) };
        break;

      // Reports
      case 'getReports':
        result = { success: true, data: getReports(params.type || payload.type || body.type, params) };
        break;

      // User Management
      case 'getUsers':
        result = { success: true, data: getUsers(session) };
        break;
      case 'createUser':
        result = createUser(payload, session);
        break;
      case 'updateUser':
        result = updateUser(payload.userId || params.userId || body.userId, payload, session);
        break;
      case 'deactivateUser':
        result = deactivateUser(payload.userId || params.userId || body.userId, session);
        break;
      case 'resetUserPassword':
        result = resetUserPassword(payload.userId || params.userId || body.userId, payload.newPassword || body.newPassword, session);
        break;

      // Settings & Audit Logs
      case 'getSettings':
        result = { success: true, data: getSettings() };
        break;
      case 'updateSettings':
        result = updateSettings(body, session);
        break;
      case 'getAuditLogs':
        result = { success: true, data: getAuditLogs(params.limit ? parseInt(params.limit, 10) : 200, params) };
        break;

      default:
        if (!action) {
          result = {
            success: true,
            status: 'ONLINE',
            message: 'Stock Management System Web API is online and operational.',
            database: 'Connected to Stock_Management_Database',
            timestamp: new Date().toISOString()
          };
        } else {
          result = {
            success: false,
            message: `Unknown or unsupported API action: "${action}".`,
            errorCode: 'INVALID_ACTION'
          };
        }
        break;
    }

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message || error.toString(),
      errorCode: 'EXECUTION_ERROR'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
