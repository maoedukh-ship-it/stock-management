# Database Structure: Stock_Management_Database

The application uses a single Google Spreadsheet titled **Stock_Management_Database** with 10 structured worksheets acting as the single source of truth.

## 1. Users
| Column Name | Type | Description |
|---|---|---|
| User_ID | String | Unique identifier (e.g. USR-001) |
| Username | String | Unique login handle |
| Password_Hash | String | SHA-256 / PBKDF2 hashed password |
| Full_Name | String | Display name |
| Email | String | Work email |
| Role | Enum | ADMIN, STOCK_MANAGER, VIEWER |
| Status | Enum | ACTIVE, INACTIVE |
| Created_Date | DateTime | Creation timestamp |
| Updated_Date | DateTime | Last update timestamp |
| Last_Login | DateTime | Previous session timestamp |

## 2. Products
| Column Name | Type | Description |
|---|---|---|
| Product_ID | String | Auto-generated ID (PRD-XXXX) |
| SKU | String | Unique Stock Keeping Unit |
| Barcode | String | Universal barcode / EAN |
| Product_Name | String | Full item description |
| Description | String | Detailed technical specs |
| Category_ID | String | Foreign key to Categories |
| Category_Name | String | Category label |
| Unit | String | Ream, Box, Piece, Bottle, Cartridge |
| Supplier_ID | String | Foreign key to Suppliers |
| Cost_Price | Decimal | Inbound procurement cost |
| Selling_Price | Decimal | Retail / Outbound price |
| Minimum_Stock | Integer | Low-stock threshold |
| Maximum_Stock | Integer | Overstock capacity |
| Location_ID | String | Foreign key to Locations |
| Opening_Stock | Integer | Initial ledger balance |
| Current_Stock | Integer | Calculated balance |
| Stock_Status | Enum | IN STOCK, LOW STOCK, OUT OF STOCK |
| Image_URL | String | Google Drive asset link |
| Status | Enum | ACTIVE, INACTIVE, ARCHIVED |
| Created_By | String | Operator ID |
| Created_Date | DateTime | Timestamp |
| Updated_By | String | Operator ID |
| Updated_Date | DateTime | Timestamp |

## 3. Categories
Category_ID, Category_Name, Description, Status, Created_Date, Updated_Date

## 4. Suppliers
Supplier_ID, Supplier_Name, Contact_Person, Phone, Email, Address, Notes, Status, Created_Date, Updated_Date

## 5. Locations
Location_ID, Location_Name, Location_Type, Address, Manager, Status, Created_Date, Updated_Date

## 6. Stock_Transactions
Transaction_ID, Transaction_Date, Transaction_Type (STOCK_IN, STOCK_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT), Reference_No, Product_ID, SKU, Product_Name, Quantity, Unit_Cost, Total_Value, Supplier_ID, Location_ID, Department, Reason, Created_By, Created_Date, Notes

## 7. Current_Stock
Product_ID, SKU, Product_Name, Location_ID, Current_Stock, Unit_Cost, Total_Value, Last_Movement_Date, Stock_Status

## 8. Stock_Adjustments
Adjustment_ID, Transaction_ID, Audit_Date, Reference_No, Product_ID, System_Quantity, Physical_Quantity, Difference, Adjustment_Type, Reason, Location_ID, Approved_By, Created_Date, Notes

## 9. Audit_Log
Log_ID, Date_Time, User_ID, Username, Action, Module, Record_ID, Description

## 10. Settings
Setting_Key, Setting_Value, Category, Description, Updated_By, Updated_Date
