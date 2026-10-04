# Stock Management System (SMS)
## Enterprise Multi-tier Inventory Platform

A modern, responsive, corporate-grade Stock Management System engineered for small-to-medium businesses.

### Architecture
- **Frontend UI Layer**: HTML5, Vanilla CSS3 (Custom Design System with Inter typography), Modular ES6 JavaScript
- **Backend API Layer**: Google Apps Script (REST JSON Service via `doGet`/`doPost`)
- **Primary Database**: Single Google Spreadsheet (`Stock_Management_Database`)
- **Document & Asset Storage**: Google Drive
- **Version Control**: Git & GitHub

### Corporate Color System
- Primary: `#0057E7` (Action buttons, brand elements, active states)
- Success: `#22C55E` (In stock badges, positive trends, receipts)
- Warning: `#F59E0B` (Low stock warnings, pending counts)
- Danger: `#EF4444` (Out of stock, negative variance, dispatches)
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Main Text: `#1E293B`

### Phase 1 Deliverables
- [x] Complete project folder structure (`/frontend`, `/backend`, `/docs`)
- [x] Corporate UI Shell with Sidebar, Top Navigation, and Responsive Mobile Drawer
- [x] Standalone & In-App Authentication Shell with Show/Hide password toggle
- [x] Executive Dashboard with 7 KPI metrics, SVG trend charts, and ledger cards
- [x] Comprehensive Inventory Ledger with search, multi-filters, and CSV export
- [x] Interactive Stock In module with auto-total calculation banner
- [x] Stock Out module with strict Anti-Negative Inventory availability validation
- [x] Stock Adjustment module with auto discrepancy calculation (+/- delta)
- [x] Supplier Directory with contact cards and activation toggles
- [x] Storage Locations module
- [x] 9 Business Report types with CSV generation & Print capability
- [x] Role-Based Access Control (Admin, Stock Manager, Viewer) User Manager
- [x] Immutable Activity Audit Log stream
- [x] Settings module with bilingual (English / Khmer) localization readiness
