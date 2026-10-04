# Google Apps Script Web App API Documentation

## Base Endpoint
```http
POST / GET https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action={ACTION}
```

The Google Apps Script backend functions as a serverless REST-like JSON API over Google Sheets.

---

## 1. Response Standard Envelope

### Success Response
```json
{
  "success": true,
  "message": "Stock In recorded successfully.",
  "data": {
    "txnId": "TXN-20261003-9124",
    "newCurrentStock": 390,
    "stockStatus": "IN STOCK"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Insufficient stock. Available quantity: 18 Ream",
  "errorCode": "EXECUTION_ERROR"
}
```

---

## 2. Authentication & Session

### `POST ?action=login`
* **Payload**:
  ```json
  { "username": "admin", "password": "yourPassword" }
  ```
* **Response**: Returns Base64-signed session token with user profile and assigned role (`ADMIN`, `STOCK_MANAGER`, or `VIEWER`).

---

## 3. Dashboard & Analytical Endpoints

### `GET ?action=getDashboard`
Returns calculated KPIs:
* Total Products count
* Current Stock units sum
* Inventory Valuation (FIFO product cost sum)
* Low Stock count
* Out of Stock count
* Stock In Today (Units & Dollar value)
* Stock Out Today (Units & Dollar value)
* Category distribution mapping
* Recent transactions list

---

## 4. Master Product Catalog

### `GET ?action=getProducts`
Returns all non-archived products from `Products` worksheet.

### `GET ?action=getProduct&id={id}`
Returns details for a specific product by `Product_ID` or `SKU`.

### `POST ?action=createProduct`
* **Protected**: `ADMIN`, `STOCK_MANAGER`
* **Checks**: Duplicate SKU validation, cost price non-negative, category validation.
* **Recalculates**: `Current_Stock` sheet balance.

### `POST ?action=archiveProduct`
* **Protected**: `ADMIN` only.

---

## 5. Inventory Transactions & Movements

### `POST ?action=createStockIn`
* **Protected**: `ADMIN`, `STOCK_MANAGER`
* **Payload**:
  ```json
  {
    "productId": "PRD-1001",
    "quantity": 50,
    "unitCost": 4.50,
    "refNo": "PO-98425",
    "supplier": "ABC Trading",
    "location": "Main Warehouse",
    "notes": "Incoming delivery"
  }
  ```
* **Action**: Inserts immutable transaction into `Stock_Transactions`, recalculates product `Current_Stock` and `Stock_Status`, records `Audit_Log`.

### `POST ?action=createStockOut`
* **Protected**: `ADMIN`, `STOCK_MANAGER`
* **Payload**:
  ```json
  {
    "productId": "PRD-1004",
    "quantity": 5,
    "refNo": "REQ-5510",
    "department": "Operations",
    "reason": "Internal Office Consumption",
    "notes": "Monthly issue"
  }
  ```
* **Critical Guard**: Throws error if `quantity > availableStock`.

### `POST ?action=createStockAdjustment`
* **Payload**:
  ```json
  {
    "productId": "PRD-1003",
    "physicalQuantity": 12,
    "refNo": "ADJ-2001",
    "reason": "Annual Stock Take Audit"
  }
  ```
* **Action**: Calculates variance delta (`physical - system`), posts `ADJUSTMENT_IN` or `ADJUSTMENT_OUT` to both `Stock_Adjustments` and `Stock_Transactions`, and updates master stock balance.

---

## 6. Reports

### `GET ?action=getReports&type={TYPE}`
Supported Types:
* `CURRENT_INVENTORY`
* `STOCK_IN`
* `STOCK_OUT`
* `LOW_STOCK`
* `OUT_OF_STOCK`
* `VALUATION_REPORT`

---

## 7. User Administration (Admin Only)

* `GET ?action=getUsers`: Lists registered operators
* `POST ?action=createUser`: Registers user with SHA-256 hashed password
* `POST ?action=deactivateUser`: Toggles operator active/inactive status
* `POST ?action=resetUserPassword`: Issues new password hash
