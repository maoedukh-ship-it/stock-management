/**
 * Stock Management System - Realistic UI Sample Data
 * Grounded in prompt specifications for Phase 1 visual development
 */

export const SAMPLE_USERS = [
  {
    userId: 'USR-001',
    username: 'admin',
    fullName: 'Alex Thorne',
    email: 'admin@company.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2026-10-03 14:22',
    createdDate: '2026-01-15'
  },
  {
    userId: 'USR-002',
    username: 'manager',
    fullName: 'Sarah Chen',
    email: 'manager@company.com',
    role: 'STOCK_MANAGER',
    status: 'ACTIVE',
    lastLogin: '2026-10-03 11:05',
    createdDate: '2026-02-01'
  },
  {
    userId: 'USR-003',
    username: 'viewer',
    fullName: 'David Kim',
    email: 'viewer@company.com',
    role: 'VIEWER',
    status: 'ACTIVE',
    lastLogin: '2026-10-02 09:40',
    createdDate: '2026-03-10'
  }
];

export const SAMPLE_CATEGORIES = [
  { id: 'CAT-001', name: 'Stationery', description: 'Office paper, pens, notebooks, and clips', status: 'ACTIVE', itemCount: 420 },
  { id: 'CAT-002', name: 'Cleaning Supplies', description: 'Disinfectants, detergents, mops, sanitizers', status: 'ACTIVE', itemCount: 180 },
  { id: 'CAT-003', name: 'Packaging', description: 'Boxes, bubble wrap, tape, cartons', status: 'ACTIVE', itemCount: 215 },
  { id: 'CAT-004', name: 'IT Equipment', description: 'Toners, cables, keyboards, mice, adapters', status: 'ACTIVE', itemCount: 310 },
  { id: 'CAT-005', name: 'Office Supplies', description: 'Binders, desk organizers, staplers', status: 'ACTIVE', itemCount: 123 }
];

export const SAMPLE_SUPPLIERS = [
  {
    id: 'SUP-001',
    name: 'ABC Trading',
    contactPerson: 'Robert Miller',
    phone: '+1 (555) 234-5678',
    email: 'sales@abctrading.com',
    address: '450 Industrial Parkway, Suite 100, Chicago, IL',
    status: 'ACTIVE'
  },
  {
    id: 'SUP-002',
    name: 'Office Supply Co.',
    contactPerson: 'Elena Rostova',
    phone: '+1 (555) 876-5432',
    email: 'orders@officesupplyco.com',
    address: '88 Commerce Blvd, Dallas, TX',
    status: 'ACTIVE'
  },
  {
    id: 'SUP-003',
    name: 'Global Stationery',
    contactPerson: 'Michael Chang',
    phone: '+1 (555) 998-1122',
    email: 'contact@globalstationery.com',
    address: '12 Logistics Way, Seattle, WA',
    status: 'ACTIVE'
  }
];

export const SAMPLE_LOCATIONS = [
  {
    id: 'LOC-001',
    name: 'Main Warehouse',
    type: 'Central Storage',
    address: 'Building A, Logistics Center, West Gate',
    manager: 'Sarah Chen',
    status: 'ACTIVE',
    itemCount: 850
  },
  {
    id: 'LOC-002',
    name: 'Head Office',
    type: 'Corporate Store',
    address: 'Floor 4, Financial Tower, Suite 402',
    manager: 'Alex Thorne',
    status: 'ACTIVE',
    itemCount: 210
  },
  {
    id: 'LOC-003',
    name: 'Store 01',
    type: 'Retail Outlet',
    address: 'Shop 14, Downtown Plaza Mall',
    manager: 'James Wilson',
    status: 'ACTIVE',
    itemCount: 188
  }
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'PRD-1001',
    sku: 'STA-A4P-01',
    barcode: '880123456001',
    name: 'A4 Copier Paper (80gsm, 500 Sheets)',
    category: 'Stationery',
    categoryId: 'CAT-001',
    unit: 'Ream',
    supplier: 'ABC Trading',
    supplierId: 'SUP-001',
    costPrice: 4.50,
    sellingPrice: 6.99,
    minStock: 50,
    maxStock: 500,
    location: 'Main Warehouse',
    locationId: 'LOC-001',
    openingStock: 200,
    currentStock: 340,
    stockStatus: 'IN STOCK',
    status: 'ACTIVE'
  },
  {
    id: 'PRD-1002',
    sku: 'STA-PEN-02',
    barcode: '880123456002',
    name: 'Ballpoint Pen 0.7mm (Box of 50)',
    category: 'Stationery',
    categoryId: 'CAT-001',
    unit: 'Box',
    supplier: 'Global Stationery',
    supplierId: 'SUP-003',
    costPrice: 8.20,
    sellingPrice: 12.50,
    minStock: 25,
    maxStock: 200,
    location: 'Store 01',
    locationId: 'LOC-003',
    openingStock: 40,
    currentStock: 18,
    stockStatus: 'LOW STOCK',
    status: 'ACTIVE'
  },
  {
    id: 'PRD-1003',
    sku: 'IT-TON-03',
    barcode: '880123456003',
    name: 'LaserJet Printer Toner Cartridge (Black)',
    category: 'IT Equipment',
    categoryId: 'CAT-004',
    unit: 'Cartridge',
    supplier: 'Office Supply Co.',
    supplierId: 'SUP-002',
    costPrice: 45.00,
    sellingPrice: 68.00,
    minStock: 10,
    maxStock: 50,
    location: 'Head Office',
    locationId: 'LOC-002',
    openingStock: 15,
    currentStock: 0,
    stockStatus: 'OUT OF STOCK',
    status: 'ACTIVE'
  },
  {
    id: 'PRD-1004',
    sku: 'CLN-LIQ-04',
    barcode: '880123456004',
    name: 'Commercial Surface Disinfectant Liquid 5L',
    category: 'Cleaning Supplies',
    categoryId: 'CAT-002',
    unit: 'Bottle',
    supplier: 'ABC Trading',
    supplierId: 'SUP-001',
    costPrice: 14.50,
    sellingPrice: 22.00,
    minStock: 20,
    maxStock: 100,
    location: 'Main Warehouse',
    locationId: 'LOC-001',
    openingStock: 60,
    currentStock: 85,
    stockStatus: 'IN STOCK',
    status: 'ACTIVE'
  },
  {
    id: 'PRD-1005',
    sku: 'PCK-BOX-05',
    barcode: '880123456005',
    name: 'Heavy Duty Corrugated Carton (Pack of 25)',
    category: 'Packaging',
    categoryId: 'CAT-003',
    unit: 'Bundle',
    supplier: 'Office Supply Co.',
    supplierId: 'SUP-002',
    costPrice: 18.00,
    sellingPrice: 26.50,
    minStock: 30,
    maxStock: 300,
    location: 'Main Warehouse',
    locationId: 'LOC-001',
    openingStock: 120,
    currentStock: 22,
    stockStatus: 'LOW STOCK',
    status: 'ACTIVE'
  },
  {
    id: 'PRD-1006',
    sku: 'IT-MOU-06',
    barcode: '880123456006',
    name: 'Ergonomic Wireless Optical Mouse',
    category: 'IT Equipment',
    categoryId: 'CAT-004',
    unit: 'Piece',
    supplier: 'Office Supply Co.',
    supplierId: 'SUP-002',
    costPrice: 11.50,
    sellingPrice: 19.99,
    minStock: 15,
    maxStock: 150,
    location: 'Store 01',
    locationId: 'LOC-003',
    openingStock: 50,
    currentStock: 64,
    stockStatus: 'IN STOCK',
    status: 'ACTIVE'
  }
];

export const SAMPLE_TRANSACTIONS = [
  {
    id: 'TXN-20261003-01',
    date: '2026-10-03 14:15',
    type: 'STOCK_IN',
    refNo: 'PO-98421',
    sku: 'STA-A4P-01',
    productName: 'A4 Copier Paper (80gsm, 500 Sheets)',
    quantity: 50,
    unitCost: 4.50,
    totalValue: 225.00,
    location: 'Main Warehouse',
    supplier: 'ABC Trading',
    user: 'Sarah Chen'
  },
  {
    id: 'TXN-20261003-02',
    date: '2026-10-03 13:40',
    type: 'STOCK_OUT',
    refNo: 'REQ-4402',
    sku: 'CLN-LIQ-04',
    productName: 'Commercial Surface Disinfectant Liquid 5L',
    quantity: 5,
    unitCost: 14.50,
    totalValue: 72.50,
    location: 'Main Warehouse',
    supplier: '-',
    user: 'Alex Thorne'
  },
  {
    id: 'TXN-20261003-03',
    date: '2026-10-03 10:20',
    type: 'ADJUSTMENT_OUT',
    refNo: 'ADJ-1029',
    sku: 'IT-TON-03',
    productName: 'LaserJet Printer Toner Cartridge (Black)',
    quantity: 2,
    unitCost: 45.00,
    totalValue: 90.00,
    location: 'Head Office',
    supplier: '-',
    user: 'Sarah Chen'
  },
  {
    id: 'TXN-20261002-04',
    date: '2026-10-02 16:30',
    type: 'STOCK_IN',
    refNo: 'PO-98418',
    sku: 'PCK-BOX-05',
    productName: 'Heavy Duty Corrugated Carton (Pack of 25)',
    quantity: 40,
    unitCost: 18.00,
    totalValue: 720.00,
    location: 'Main Warehouse',
    supplier: 'Office Supply Co.',
    user: 'Sarah Chen'
  }
];

export const SAMPLE_AUDIT_LOGS = [
  {
    id: 'LOG-8891',
    dateTime: '2026-10-03 14:15:32',
    userId: 'USR-002',
    username: 'manager',
    action: 'STOCK_IN',
    module: 'Stock In',
    recordId: 'TXN-20261003-01',
    description: 'Received 50 units of A4 Copier Paper (PO-98421)'
  },
  {
    id: 'LOG-8890',
    dateTime: '2026-10-03 13:40:11',
    userId: 'USR-001',
    username: 'admin',
    action: 'STOCK_OUT',
    module: 'Stock Out',
    recordId: 'TXN-20261003-02',
    description: 'Dispatched 5 units of Disinfectant Liquid for Ops'
  },
  {
    id: 'LOG-8889',
    dateTime: '2026-10-03 10:20:45',
    userId: 'USR-002',
    username: 'manager',
    action: 'STOCK_ADJUSTMENT',
    module: 'Stock Adjustment',
    recordId: 'ADJ-1029',
    description: 'Count variance reconciliation: -2 units Toner Cartridge'
  },
  {
    id: 'LOG-8888',
    dateTime: '2026-10-03 08:30:00',
    userId: 'USR-001',
    username: 'admin',
    action: 'LOGIN',
    module: 'Authentication',
    recordId: 'USR-001',
    description: 'Admin user logged in successfully from Chrome/Win'
  }
];

export const SAMPLE_SETTINGS = {
  companyName: 'Apex Logistics & Supply Enterprise',
  logoUrl: '/assets/logo.svg',
  address: '100 North Pier Terminal, Suite 500, Chicago, IL 60601',
  phone: '+1 (555) 789-0123',
  email: 'inventory@apexsupply.com',
  defaultMinStock: 20,
  defaultLocation: 'Main Warehouse',
  currency: 'USD ($)',
  language: 'English'
};
