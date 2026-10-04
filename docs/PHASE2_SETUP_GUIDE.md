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

### Step 2: Paste the Unified Master Script
In the Apps Script editor:
1. Replace whatever is in `Code.gs` with the entire contents from:
   👉 **[`backend/UNIFIED_BACKEND_SUITE.gs`](file:///d:/Learning%20Code_2026/Stock%20Management%20Project/backend/UNIFIED_BACKEND_SUITE.gs)**
   *(This single master file contains all 10 schemas, authentication, inventory math engine, suppliers, locations, reporting, and CORS-enabled Web API gateway).*
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

### Step 4: Deploy as a Web App API
1. In the top right of Apps Script, click **Deploy** → **New deployment**.
2. Beside *"Select type"*, click the **⚙ Gear icon** and select **Web app**.
3. Configure the settings:
   - **Description**: `Apex Stock Management API v1.0`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Critical: allows your frontend to connect)*
4. Click **Deploy**.
5. Copy the generated **Web app URL** (it ends in `/exec`).

---

### Step 5: Connect Your Live Website
1. Open your live website: **[https://maoedukh-ship-it.github.io/stock-management/](https://maoedukh-ship-it.github.io/stock-management/)**
2. In the top header bar, click the **🟡 Demo Mode** status badge (or go to **Settings → Localization & Language**).
3. Paste your Web App URL into the **Google Apps Script Web App URL** input.
4. Click **Test Ping** to verify connectivity.
5. Click **Save & Synchronize**!
   Your site will switch to **`🟢 Google Sheets Live`** and all data will synchronize directly with your spreadsheet!
