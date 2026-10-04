# Phase 2: Google Sheets Database Setup Guide

**Target Google Spreadsheet**:
[Stock_Management_Database](https://docs.google.com/spreadsheets/d/1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM/edit)  
**Spreadsheet ID**: `1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM`

---

## Quick 2-Minute Setup Instructions

Follow these simple steps to generate all 10 worksheets, corporate headers, column formatting, and initial sample data directly in your Google Spreadsheet:

### Step 1: Open Apps Script in Your Spreadsheet
1. Open your Google Sheet in your web browser:
   👉 **[https://docs.google.com/spreadsheets/d/1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM/edit](https://docs.google.com/spreadsheets/d/1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM/edit)**
2. In the top Google Sheets menu, click **Extensions** → **Apps Script**.
3. A new tab will open titled **Apps Script - Untitled project**. Rename the project to:
   `Stock_Management_System_API`

---

### Step 2: Paste the Database Setup Scripts
In the Apps Script editor:
1. Replace whatever is in `Code.gs` (or create new files) with the contents from:
   * **[`backend/Config.gs`](file:///d:/Learning%20Code_2026/Stock%20Management%20Project/backend/Config.gs)**
   * **[`backend/DatabaseSetup.gs`](file:///d:/Learning%20Code_2026/Stock%20Management%20Project/backend/DatabaseSetup.gs)**
   *(Or simply copy the combined single-script block provided in your chat window below).*
2. Click the **💾 Save project** icon (or press `Ctrl + S`).

---

### Step 3: Run the Database Initializer
In the Apps Script editor toolbar:
1. Locate the function dropdown (where it says `myFunction` or `onOpen`).
2. Select **`setupStockManagementDatabase`**.
3. Click the **▶ Run** button.
4. If prompted with *"Authorization Required"*, click **Review permissions** → Choose your Google Account → Click **Advanced** → Click **Go to Stock_Management_System_API (unsafe)** → Click **Allow**.
5. Once the execution completes:
   Select function **`loadSampleData`** from the dropdown and click **▶ Run**.

---

### Step 4: Verify Your Google Spreadsheet
Return to your Google Sheet tab. You will now see:
1. Spreadsheet renamed to **`Stock_Management_Database`**.
2. **All 10 Worksheets** created with corporate royal blue headers (`#0057E7`) and frozen row 1:
   - 📑 **`Users`**
   - 📑 **`Products`**
   - 📑 **`Categories`**
   - 📑 **`Suppliers`**
   - 📑 **`Locations`**
   - 📑 **`Stock_Transactions`**
   - 📑 **`Current_Stock`**
   - 📑 **`Stock_Adjustments`**
   - 📑 **`Audit_Log`**
   - 📑 **`Settings`**
3. A custom menu in your Google Sheets top bar:
   **`📦 Stock Management`** with 1-click tools:
   - 🚀 *1. Setup All 10 Sheets & Columns*
   - 📥 *2. Load Sample Data & Admin User*
   - 🔄 *Recalculate Current Stock Ledger*
