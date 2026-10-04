/**
 * Reports.gs - Analytical Reporting & Executive Dashboard Aggregator
 */

function getDashboardData() {
  const products = getProducts();
  const txns = getTransactions();
  const categories = getCategories();
  const locations = getLocations();

  const activeProducts = products.filter(p => p.status !== 'ARCHIVED');
  let totalProducts = activeProducts.length;
  let totalCurrentStock = 0;
  let totalInventoryValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let healthyStockCount = 0;

  const categoryMap = {};
  categories.forEach(c => { 
    categoryMap[c.name] = { name: c.name, units: 0, count: 0, value: 0 }; 
  });

  const locationMap = {};
  locations.forEach(l => {
    locationMap[l.name] = { name: l.name, units: 0, count: 0, value: 0 };
  });

  activeProducts.forEach(p => {
    const stock = Number(p.currentStock) || 0;
    const cost = Number(p.costPrice) || 0;
    const selling = Number(p.sellingPrice) || 0;

    totalCurrentStock += stock;
    const itemVal = stock * cost;
    totalInventoryValue += itemVal;
    totalRetailValue += (stock * selling);

    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= p.minStock) {
      lowStockCount++;
    } else {
      healthyStockCount++;
    }

    // Category mapping
    const catKey = p.category || 'Uncategorized';
    if (!categoryMap[catKey]) {
      categoryMap[catKey] = { name: catKey, units: 0, count: 0, value: 0 };
    }
    categoryMap[catKey].units += stock;
    categoryMap[catKey].count += 1;
    categoryMap[catKey].value += itemVal;

    // Location mapping
    const locKey = p.location || p.locationId || 'Main Warehouse';
    if (!locationMap[locKey]) {
      locationMap[locKey] = { name: locKey, units: 0, count: 0, value: 0 };
    }
    locationMap[locKey].units += stock;
    locationMap[locKey].count += 1;
    locationMap[locKey].value += itemVal;
  });

  // Category distribution with percentage share
  const categoryDistribution = Object.values(categoryMap)
    .filter(c => c.count > 0 || c.units > 0)
    .map(c => ({
      name: c.name,
      units: c.units,
      count: c.count,
      value: Number(c.value.toFixed(2)),
      percentage: totalCurrentStock > 0 ? Number(((c.units / totalCurrentStock) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.units - a.units);

  // Time calculations
  const tz = Session.getScriptTimeZone() || 'GMT+7';
  const now = new Date();
  const todayStr = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const currentMonthStr = Utilities.formatDate(now, tz, 'yyyy-MM');

  let stockInTodayQty = 0;
  let stockInTodayVal = 0;
  let stockOutTodayQty = 0;
  let stockOutTodayVal = 0;

  let stockInMonthQty = 0;
  let stockInMonthVal = 0;
  let stockOutMonthQty = 0;
  let stockOutMonthVal = 0;

  txns.forEach(t => {
    const rawDate = String(t.date || '');
    const txDateStr = rawDate.slice(0, 10);
    const txMonthStr = rawDate.slice(0, 7);
    const qty = Number(t.quantity) || 0;
    const val = Number(t.totalValue) || 0;

    if (txDateStr === todayStr) {
      if (t.type === 'STOCK_IN') {
        stockInTodayQty += qty;
        stockInTodayVal += val;
      } else if (t.type === 'STOCK_OUT') {
        stockOutTodayQty += qty;
        stockOutTodayVal += val;
      }
    }

    if (txMonthStr === currentMonthStr) {
      if (t.type === 'STOCK_IN') {
        stockInMonthQty += qty;
        stockInMonthVal += val;
      } else if (t.type === 'STOCK_OUT') {
        stockOutMonthQty += qty;
        stockOutMonthVal += val;
      }
    }
  });

  // Calculate 7-Day movement trend
  const last7DaysTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dStr = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
    const label = Utilities.formatDate(d, tz, 'MMM dd');

    let inQty = 0;
    let outQty = 0;

    txns.forEach(t => {
      const txDateStr = String(t.date || '').slice(0, 10);
      if (txDateStr === dStr) {
        if (t.type === 'STOCK_IN') inQty += (Number(t.quantity) || 0);
        else if (t.type === 'STOCK_OUT') outQty += (Number(t.quantity) || 0);
      }
    });

    last7DaysTrend.push({
      dateStr: dStr,
      label: label,
      inQty: inQty,
      outQty: outQty
    });
  }

  // Low stock alerts sorted by critical ratio (current / min)
  const lowStockAlerts = activeProducts
    .filter(p => p.currentStock <= p.minStock)
    .sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock !== 0) return -1;
      if (b.currentStock === 0 && a.currentStock !== 0) return 1;
      const ratioA = a.minStock > 0 ? (a.currentStock / a.minStock) : 0;
      const ratioB = b.minStock > 0 ? (b.currentStock / b.minStock) : 0;
      return ratioA - ratioB;
    });

  const unrealizedProfit = totalRetailValue - totalInventoryValue;
  const profitMargin = totalRetailValue > 0 ? ((unrealizedProfit / totalRetailValue) * 100) : 0;

  return {
    kpis: {
      totalProducts,
      totalCatalogCount: products.length,
      totalCurrentStock,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalRetailValue: Number(totalRetailValue.toFixed(2)),
      unrealizedProfit: Number(unrealizedProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(1)),
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
      stockInToday: { quantity: stockInTodayQty, value: Number(stockInTodayVal.toFixed(2)) },
      stockOutToday: { quantity: stockOutTodayQty, value: Number(stockOutTodayVal.toFixed(2)) },
      stockInThisMonth: { quantity: stockInMonthQty, value: Number(stockInMonthVal.toFixed(2)) },
      stockOutThisMonth: { quantity: stockOutMonthQty, value: Number(stockOutMonthVal.toFixed(2)) }
    },
    categoryDistribution,
    last7DaysTrend,
    lowStockAlerts,
    recentTransactions: txns.slice(0, 10)
  };
}

function getReports(reportType, filters) {
  const type = reportType || 'VALUATION_REPORT';
  const products = getProducts().filter(p => p.status !== 'ARCHIVED');
  const txns = getTransactions();
  const suppliers = getSuppliers();
  const f = filters || {};

  // 1. Inventory Valuation Report
  if (type === 'VALUATION_REPORT' || type === 'CURRENT_INVENTORY') {
    let list = products;
    if (f.category && f.category !== 'ALL') {
      list = list.filter(p => p.category === f.category);
    }
    if (f.location && f.location !== 'ALL') {
      list = list.filter(p => p.location === f.location || p.locationId === f.location);
    }
    if (f.stockStatus && f.stockStatus !== 'ALL') {
      list = list.filter(p => p.stockStatus === f.stockStatus);
    }

    let totalUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;

    const items = list.map(p => {
      const stock = Number(p.currentStock) || 0;
      const cost = Number(p.costPrice) || 0;
      const selling = Number(p.sellingPrice) || 0;
      const costVal = stock * cost;
      const retailVal = stock * selling;
      const profit = retailVal - costVal;
      const marginPct = retailVal > 0 ? (profit / retailVal) * 100 : 0;

      totalUnits += stock;
      totalCostValuation += costVal;
      totalRetailValuation += retailVal;

      return {
        id: p.id,
        sku: p.sku,
        barcode: p.barcode || '',
        name: p.name,
        category: p.category,
        location: p.location || p.locationId || 'Main Warehouse',
        currentStock: stock,
        unit: p.unit || 'Piece',
        costPrice: cost,
        sellingPrice: selling,
        costValuation: Number(costVal.toFixed(2)),
        retailValuation: Number(retailVal.toFixed(2)),
        unrealizedProfit: Number(profit.toFixed(2)),
        marginPct: Number(marginPct.toFixed(1)),
        stockStatus: p.stockStatus
      };
    });

    const netProfit = totalRetailValuation - totalCostValuation;
    const avgMarginPct = totalRetailValuation > 0 ? (netProfit / totalRetailValuation) * 100 : 0;

    return {
      reportType: 'VALUATION_REPORT',
      summary: {
        totalProducts: items.length,
        totalUnits,
        totalCostValuation: Number(totalCostValuation.toFixed(2)),
        totalRetailValuation: Number(totalRetailValuation.toFixed(2)),
        unrealizedProfit: Number(netProfit.toFixed(2)),
        avgMarginPct: Number(avgMarginPct.toFixed(1))
      },
      items
    };
  }

  // 2. Stock Movement Ledger Report
  if (type === 'MOVEMENT_LEDGER' || type === 'STOCK_MOVEMENT' || type === 'STOCK_IN' || type === 'STOCK_OUT') {
    let list = txns;

    if (type === 'STOCK_IN') {
      list = list.filter(t => t.type === 'STOCK_IN');
    } else if (type === 'STOCK_OUT') {
      list = list.filter(t => t.type === 'STOCK_OUT');
    } else if (f.txnType && f.txnType !== 'ALL') {
      list = list.filter(t => t.type === f.txnType);
    }

    if (f.dateFrom) {
      list = list.filter(t => String(t.date || '').slice(0, 10) >= f.dateFrom);
    }
    if (f.dateTo) {
      list = list.filter(t => String(t.date || '').slice(0, 10) <= f.dateTo);
    }
    if (f.location && f.location !== 'ALL') {
      list = list.filter(t => t.location === f.location);
    }

    let inUnits = 0;
    let inVal = 0;
    let outUnits = 0;
    let outVal = 0;

    const items = list.map(t => {
      const q = Number(t.quantity) || 0;
      const v = Number(t.totalValue || (q * (t.unitCost || 0))) || 0;

      if (t.type === 'STOCK_IN' || t.type === 'ADJUSTMENT_IN') {
        inUnits += q;
        inVal += v;
      } else {
        outUnits += q;
        outVal += v;
      }

      return {
        id: t.id,
        refNo: t.refNo,
        date: t.date,
        type: t.type,
        sku: t.sku || '',
        productName: t.productName,
        quantity: q,
        unitCost: Number(t.unitCost || 0),
        totalValue: Number(v.toFixed(2)),
        location: t.location || 'Main Warehouse',
        counterparty: t.supplier || t.destination || t.recipient || 'Internal',
        user: t.user || 'System',
        notes: t.notes || ''
      };
    });

    return {
      reportType: 'MOVEMENT_LEDGER',
      summary: {
        totalMovements: items.length,
        inUnits,
        inValue: Number(inVal.toFixed(2)),
        outUnits,
        outValue: Number(outVal.toFixed(2)),
        netUnitsDelta: inUnits - outUnits
      },
      items
    };
  }

  // 3. Low Stock & Replenishment Reorder Report
  if (type === 'REORDER_REPORT' || type === 'LOW_STOCK' || type === 'OUT_OF_STOCK') {
    let list = products.filter(p => p.currentStock <= p.minStock);

    if (type === 'OUT_OF_STOCK') {
      list = list.filter(p => p.currentStock === 0);
    } else if (f.urgency === 'DEPLETED') {
      list = list.filter(p => p.currentStock === 0);
    }

    if (f.category && f.category !== 'ALL') {
      list = list.filter(p => p.category === f.category);
    }

    // Sort: completely out of stock first, then lowest ratio
    list.sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock !== 0) return -1;
      if (b.currentStock === 0 && a.currentStock !== 0) return 1;
      const ratioA = a.minStock > 0 ? (a.currentStock / a.minStock) : 0;
      const ratioB = b.minStock > 0 ? (b.currentStock / b.minStock) : 0;
      return ratioA - ratioB;
    });

    let depletedCount = 0;
    let lowCount = 0;
    let totalCapitalRequired = 0;

    const items = list.map(p => {
      const stock = Number(p.currentStock) || 0;
      const minS = Number(p.minStock) || 0;
      const maxS = Number(p.maxStock) || (minS * 3);
      const cost = Number(p.costPrice) || 0;

      const deficit = Math.max(0, minS - stock);
      const recommendedQty = Math.max(deficit, maxS - stock);
      const estimatedCost = recommendedQty * cost;

      if (stock === 0) depletedCount++;
      else lowCount++;

      totalCapitalRequired += estimatedCost;

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        supplier: p.supplier || 'Unassigned',
        location: p.location || 'Main Warehouse',
        currentStock: stock,
        minStock: minS,
        maxStock: maxS,
        unit: p.unit || 'Piece',
        deficit,
        recommendedQty,
        costPrice: cost,
        estimatedCost: Number(estimatedCost.toFixed(2)),
        stockStatus: p.stockStatus
      };
    });

    return {
      reportType: 'REORDER_REPORT',
      summary: {
        totalCriticalItems: items.length,
        depletedCount,
        lowCount,
        totalCapitalRequired: Number(totalCapitalRequired.toFixed(2))
      },
      items
    };
  }

  // 4. Supplier Procurement & Performance Report
  if (type === 'SUPPLIER_REPORT') {
    const inboundTxns = txns.filter(t => t.type === 'STOCK_IN');
    let totalProcurementSpend = 0;
    let totalInboundVolume = 0;

    const items = suppliers.map(s => {
      const vendorTxns = inboundTxns.filter(t => t.supplier === s.name);
      const vendorProducts = products.filter(p => p.supplier === s.name);

      let vendorUnits = 0;
      let vendorSpend = 0;
      let lastDate = '-';

      vendorTxns.forEach(t => {
        const q = Number(t.quantity) || 0;
        const v = Number(t.totalValue || (q * (t.unitCost || 0))) || 0;
        vendorUnits += q;
        vendorSpend += v;
        if (!lastDate || String(t.date) > lastDate) {
          lastDate = String(t.date).slice(0, 10);
        }
      });

      totalProcurementSpend += vendorSpend;
      totalInboundVolume += vendorUnits;

      const avgPO = vendorTxns.length > 0 ? (vendorSpend / vendorTxns.length) : 0;

      return {
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson || '-',
        phone: s.phone || '-',
        email: s.email || '-',
        status: s.status || 'ACTIVE',
        activeLines: vendorProducts.length,
        totalShipments: vendorTxns.length,
        totalUnits: vendorUnits,
        totalSpend: Number(vendorSpend.toFixed(2)),
        avgOrderValue: Number(avgPO.toFixed(2)),
        lastDeliveryDate: lastDate
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      reportType: 'SUPPLIER_REPORT',
      summary: {
        totalSuppliers: items.length,
        totalProcurementSpend: Number(totalProcurementSpend.toFixed(2)),
        totalInboundVolume,
        totalShipments: inboundTxns.length
      },
      items
    };
  }

  // Fallback
  return {
    reportType: 'CURRENT_INVENTORY',
    summary: { count: products.length },
    items: products
  };
}
