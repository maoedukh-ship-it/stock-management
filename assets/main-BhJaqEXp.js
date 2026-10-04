import{S as T,a as N,b as S,c as v,d as H,e as E,f as _,g as P,h as q,i as nt}from"./auth-BdQeZcvJ.js";let ut=!1;function It(){const o=T.filter(m=>m.status!=="ARCHIVED"),t=N;let e=o.length,n=T.length,a=0,i=0,l=0,r=0,s=0,d=0;o.forEach(m=>{const k=Number(m.currentStock)||0,V=Number(m.costPrice)||0,G=Number(m.sellingPrice)||0;a+=k,i+=k*V,l+=k*G,k===0?s++:k<=m.minStock?r++:d++});const c=l-i,p=l>0?c/l*100:0,u=new Date().toISOString().slice(0,10),w=new Date().toISOString().slice(0,7);let x=0,f=0,h=0,b=0,I=0,L=0,$=0,z=0;t.forEach(m=>{const k=String(m.date||"").slice(0,10),V=String(m.date||"").slice(0,7),G=Number(m.quantity)||0,X=Number(m.totalValue||G*(m.unitCost||m.unitPrice||0))||0;k===u&&(m.type==="STOCK_IN"?(x+=G,f+=X):m.type==="STOCK_OUT"&&(h+=G,b+=X)),V===w&&(m.type==="STOCK_IN"?(I+=G,L+=X):m.type==="STOCK_OUT"&&($+=G,z+=X))});const U=new Date,O=[],y=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];for(let m=6;m>=0;m--){const k=new Date(U.getTime()-m*24*60*60*1e3),V=k.toISOString().slice(0,10),G=`${y[k.getMonth()]} ${String(k.getDate()).padStart(2,"0")}`;let X=0,st=0;t.forEach(pt=>{String(pt.date||"").slice(0,10)===V&&(pt.type==="STOCK_IN"?X+=Number(pt.quantity)||0:pt.type==="STOCK_OUT"&&(st+=Number(pt.quantity)||0))}),O.push({dateStr:V,label:G,inQty:X,outQty:st,net:X-st})}const C={};H.forEach(m=>{C[m.name]={name:m.name,units:0,count:0,value:0}}),o.forEach(m=>{const k=m.category||"Uncategorized";C[k]||(C[k]={name:k,units:0,count:0,value:0});const V=Number(m.currentStock)||0;C[k].units+=V,C[k].count+=1,C[k].value+=V*(Number(m.costPrice)||0)});const D=Object.values(C).filter(m=>m.count>0||m.units>0).map(m=>({...m,percentage:a>0?Number((m.units/a*100).toFixed(1)):0})).sort((m,k)=>k.units-m.units),K={};E.forEach(m=>{K[m.name]={name:m.name,type:m.type,units:0,count:0,value:0}}),o.forEach(m=>{const k=m.location||m.locationId||"Main Warehouse";K[k]||(K[k]={name:k,type:"Storage",units:0,count:0,value:0});const V=Number(m.currentStock)||0;K[k].units+=V,K[k].count+=1,K[k].value+=V*(Number(m.costPrice)||0)});const et=Object.values(K).filter(m=>m.count>0||m.units>0).map(m=>({...m,percentage:a>0?Number((m.units/a*100).toFixed(1)):0})).sort((m,k)=>k.units-m.units),ot=o.filter(m=>m.currentStock<=m.minStock).sort((m,k)=>{if(m.currentStock===0&&k.currentStock!==0)return-1;if(k.currentStock===0&&m.currentStock!==0)return 1;const V=m.minStock>0?m.currentStock/m.minStock:0,G=k.minStock>0?k.currentStock/k.minStock:0;return V-G});return{kpis:{totalProducts:e,totalCatalogCount:n,totalCurrentStock:a,totalInventoryValue:i,totalRetailValue:l,grossProfit:c,marginPct:p,lowStockCount:r,outOfStockCount:s,healthyStockCount:d,stockInToday:{quantity:x,value:f},stockOutToday:{quantity:h,value:b},stockInMonth:{quantity:I,value:L},stockOutMonth:{quantity:$,value:z}},last7Days:O,categoryDistribution:D,locationDistribution:et,lowStockItems:ot,recentTransactions:t.slice(0,8)}}function Et(o){const t=Math.max(...o.map(y=>y.inQty),0),e=Math.max(...o.map(y=>y.outQty),0),n=Math.max(t,e,50),a=Math.ceil(n/50)*50,i=Math.round(a/2),l=Math.round(a/4),r=Math.round(a*.75),s=620,d=210,c=45,p=25,u=25,w=35,x=s-c-p,f=d-u-w,h=y=>u+f-y/a*f,b=y=>c+y*(x/(o.length-1)),I=o.map((y,C)=>({x:b(C),y:h(y.inQty),inQty:y.inQty,outQty:y.outQty,label:y.label,dateStr:y.dateStr})),L=I.map((y,C)=>`${C===0?"M":"L"} ${y.x} ${y.y}`).join(" "),$=`${L} L ${I[I.length-1].x} ${u+f} L ${I[0].x} ${u+f} Z`,z=14,U=o.reduce((y,C)=>y+C.inQty,0),O=o.reduce((y,C)=>y+C.outQty,0);return`
    <div style="width: 100%; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; color: var(--text-muted);">
        <div>
          7-Day Movement: 
          <strong style="color: var(--primary);">+${U} In</strong> / 
          <strong style="color: var(--danger);">-${O} Out</strong> 
          <span style="margin-left: 6px; font-weight: 600; color: ${U>=O?"var(--success)":"var(--warning)"};">
            (Net: ${U>=O?"+":""}${U-O} units)
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: var(--primary); border-radius: 50%;"></span>
            <span>Inbound Receipts</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; background: var(--danger); border-radius: 2px;"></span>
            <span>Outbound Dispatches</span>
          </div>
        </div>
      </div>

      <div style="height: 220px; width: 100%;">
        <svg viewBox="0 0 ${s} ${d}" style="width: 100%; height: 100%; overflow: visible;" id="dashboard-movement-svg">
          <defs>
            <linearGradient id="dashBlueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0057E7" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#0057E7" stop-opacity="0.01"/>
            </linearGradient>
            <filter id="chartDropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0057E7" flood-opacity="0.2"/>
            </filter>
          </defs>

          <!-- Grid Lines -->
          <line x1="${c}" y1="${h(a)}" x2="${s-p}" y2="${h(a)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${c}" y1="${h(r)}" x2="${s-p}" y2="${h(r)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${c}" y1="${h(i)}" x2="${s-p}" y2="${h(i)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${c}" y1="${h(l)}" x2="${s-p}" y2="${h(l)}" stroke="#E2E8F0" stroke-dasharray="3,3"/>
          <line x1="${c}" y1="${u+f}" x2="${s-p}" y2="${u+f}" stroke="#CBD5E1"/>

          <!-- Y Axis Labels -->
          <text x="${c-8}" y="${h(a)+4}" font-size="10" fill="#94A3B8" text-anchor="end">${a}</text>
          <text x="${c-8}" y="${h(i)+4}" font-size="10" fill="#94A3B8" text-anchor="end">${i}</text>
          <text x="${c-8}" y="${u+f+4}" font-size="10" fill="#94A3B8" text-anchor="end">0</text>

          <!-- Stock Out Bars (Offset slightly to the left) -->
          ${o.map((y,C)=>{const D=y.outQty/a*f,K=b(C)-z/2,et=u+f-D;return`
              <g class="chart-bar-group" data-date="${y.label}" data-out="${y.outQty}" data-in="${y.inQty}">
                <rect 
                  x="${K}" 
                  y="${et}" 
                  width="${z}" 
                  height="${Math.max(D,y.outQty>0?3:0)}" 
                  rx="3" 
                  fill="#EF4444" 
                  opacity="0.82"
                  style="transition: opacity 0.2s;"
                >
                  <title>${y.label}: Dispatched ${y.outQty} units</title>
                </rect>
              </g>
            `}).join("")}

          <!-- Stock In Gradient Area & Stroke Line -->
          <path d="${$}" fill="url(#dashBlueArea)"/>
          <path d="${L}" fill="none" stroke="#0057E7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#chartDropShadow)"/>

          <!-- Data Points & Day Labels -->
          ${I.map(y=>`
            <!-- X Axis Label -->
            <text x="${y.x}" y="${u+f+18}" font-size="10.5" fill="#64748B" text-anchor="middle" font-weight="500">
              ${y.label}
            </text>

            <!-- Stock In Circle -->
            <circle cx="${y.x}" cy="${y.y}" r="4" fill="#0057E7" stroke="#FFFFFF" stroke-width="2" style="cursor: pointer;">
              <title>${y.label}: Received ${y.inQty} units</title>
            </circle>

            ${y.inQty>0?`
              <text x="${y.x}" y="${y.y-8}" font-size="9" fill="#0057E7" text-anchor="middle" font-weight="600">
                ${y.inQty}
              </text>
            `:""}
          `).join("")}
        </svg>
      </div>
    </div>
  `}function yt(){v.getUser();const o=v.hasRole("ADMIN","STOCK_MANAGER"),t=It(),e=t.kpis,n=["#0057E7","#0284C7","#F59E0B","#22C55E","#8B5CF6","#EC4899","#64748B"];return`
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>Executive Inventory Dashboard</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 13 Active</span>
        </div>
        <p>Real-time corporate overview of stock balance, valuation, and transaction movement.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" id="btn-refresh-dashboard" onclick="window.refreshDashboardData()" title="Synchronize latest inventory metrics">
          <svg viewBox="0 0 24 24" id="refresh-icon" style="${ut?"animation: spin 1s linear infinite;":""}"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          ${ut?"Syncing...":"Refresh Data"}
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.exportDashboardSummaryCSV()" title="Export executive overview to CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Summary
        </button>
        ${o?`
          <button class="btn btn-secondary btn-sm" onclick="window.recalculateStockLedger()" title="Recalculate ledger equations">
            <svg viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Sync Ledger
          </button>
        `:""}
        <button class="btn btn-primary btn-sm" onclick="window.router.navigate('stock-in')">
          <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          New Stock In
        </button>
      </div>
    </div>

    <!-- 7 KPI Statistics Cards Row with Interactive Drill-Down Navigation -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));">
      
      <!-- 1. Total Products -->
      <div class="kpi-card kpi-blue" onclick="window.router.navigate('inventory')" style="cursor: pointer;" title="View all catalog items in Inventory">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog Products</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e.totalProducts.toLocaleString()}</div>
        <div class="kpi-footer">
          <span class="kpi-trend positive">${e.healthyStockCount} in stock</span> • ${e.totalCatalogCount} total
        </div>
      </div>

      <!-- 2. Total Current Stock -->
      <div class="kpi-card kpi-cyan" onclick="window.router.navigate('inventory')" style="cursor: pointer;" title="View Inventory Balances">
        <div class="kpi-card-header">
          <span class="kpi-title">Current Stock</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e.totalCurrentStock.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Across ${t.locationDistribution.length} facilities</div>
      </div>

      <!-- 3. Total Inventory Value (FIFO Cost) -->
      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Inventory Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">$${e.totalInventoryValue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div class="kpi-footer">
          <span class="kpi-trend positive">${e.marginPct.toFixed(1)}% margin</span> (Retail: $${e.totalRetailValue.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})})
        </div>
      </div>

      <!-- 4. Low Stock Items -->
      <div class="kpi-card kpi-amber" onclick="window.drillDownStockStatus('LOW STOCK')" style="cursor: pointer;" title="Filter Inventory to Low Stock items">
        <div class="kpi-card-header">
          <span class="kpi-title">Low Stock Items</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--warning-dark);">${e.lowStockCount}</div>
        <div class="kpi-footer">
          <span class="kpi-trend warning">Reorder required</span>
        </div>
      </div>

      <!-- 5. Out of Stock Items -->
      <div class="kpi-card kpi-red" onclick="window.drillDownStockStatus('OUT OF STOCK')" style="cursor: pointer;" title="Filter Inventory to Out of Stock items">
        <div class="kpi-card-header">
          <span class="kpi-title">Out of Stock</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--danger);">${e.outOfStockCount}</div>
        <div class="kpi-footer">
          <span class="kpi-trend negative">Critical depletion</span>
        </div>
      </div>

      <!-- 6. Stock In Today -->
      <div class="kpi-card kpi-green" onclick="window.router.navigate('stock-in')" style="cursor: pointer;" title="View Inbound Receipts">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock In Today</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e.stockInToday.quantity.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Valued at <strong>$${e.stockInToday.value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
      </div>

      <!-- 7. Stock Out Today -->
      <div class="kpi-card kpi-blue" onclick="window.router.navigate('stock-out')" style="cursor: pointer;" title="View Outbound Dispatches">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Out Today</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e.stockOutToday.quantity.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
        <div class="kpi-footer">Valued at <strong>$${e.stockOutToday.value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
      </div>

    </div>

    <!-- Charts Row: 7-Day In vs Out Trend & Category Breakdown -->
    <div class="dashboard-grid-2">
      <!-- Stock Movement Composite Trend Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" stroke-width="2"/></svg>
            Stock Movement (7-Day In vs Out Trend)
          </div>
          <span class="badge badge-primary">Units / Day</span>
        </div>
        <div class="card-body">
          ${Et(t.last7Days)}
        </div>
      </div>

      <!-- Stock by Category Distribution -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" stroke="currentColor" stroke-width="2"/><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" stroke="currentColor" stroke-width="2"/></svg>
            Stock by Category
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('categories')">View All</button>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${t.categoryDistribution.slice(0,5).map((a,i)=>{const l=n[i%n.length];return`
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px;">
                    <span style="font-weight: 600; color: var(--text-main);">${a.name}</span>
                    <span style="color: var(--text-muted); font-size: 12px;">
                      <strong>${a.units.toLocaleString()}</strong> units (${a.percentage}%) • $${a.value.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}
                    </span>
                  </div>
                  <div style="height: 8px; background: var(--surface-alt); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${Math.max(a.percentage,2)}%; height: 100%; background: ${l}; border-radius: 4px; transition: width 0.5s ease;"></div>
                  </div>
                </div>
              `}).join("")}

            ${t.categoryDistribution.length===0?`
              <div style="text-align: center; color: var(--text-muted); padding: 20px 0;">No category data available</div>
            `:""}
          </div>
        </div>
      </div>
    </div>

    <!-- Facility Warehouse Distribution Bar -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" stroke-width="2"/></svg>
          Warehouse & Storage Facilities Balance
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('locations')">Manage Facilities</button>
      </div>
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${t.locationDistribution.map((a,i)=>`
            <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${a.name}</span>
                <span class="badge badge-neutral" style="font-size: 11px;">${a.type}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
                <span>${a.count} catalog items</span>
                <span><strong>${a.units.toLocaleString()}</strong> units (${a.percentage}%)</span>
              </div>
              <div style="height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${Math.max(a.percentage,3)}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; text-align: right;">
                Valuation: <strong style="color: var(--text-main);">$${a.value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Tables Row: Low Stock Alerts & Recent Ledger -->
    <div class="dashboard-grid-equal">
      
      <!-- Low Stock & Depletion Warnings -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--warning);" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>
            Low Stock & Depletion Warnings
          </div>
          <span class="badge ${t.lowStockItems.length>0?"badge-low-stock":"badge-in-stock"}">
            ${t.lowStockItems.length} Critical Items
          </span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Current</th>
                <th>Min</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${t.lowStockItems.length===0?`
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                      <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: var(--success); fill: none; stroke-width: 2;"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <strong style="color: var(--text-main);">All Inventory Adequately Stocked</strong>
                      <span style="font-size: 12px;">No products are currently below their minimum threshold limits.</span>
                    </div>
                  </td>
                </tr>
              `:t.lowStockItems.slice(0,6).map(a=>`
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${a.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${a.sku} • ${a.category}</div>
                  </td>
                  <td>
                    <strong style="color: ${a.currentStock===0?"var(--danger)":"var(--warning-dark)"};">
                      ${a.currentStock}
                    </strong> 
                    <span style="font-size: 11px; color: var(--text-muted);">${a.unit}</span>
                  </td>
                  <td style="color: var(--text-muted); font-size: 12px;">${a.minStock}</td>
                  <td>
                    <span class="badge ${a.currentStock===0?"badge-out-of-stock":"badge-low-stock"}">
                      ${a.stockStatus}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm" onclick="window.reorderLowStockItem('${a.id}')" title="Initiate Stock In for ${a.sku}">
                      Reorder
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${t.lowStockItems.length>6?`
          <div style="padding: 10px 16px; background: var(--surface-alt); border-top: 1px solid var(--border); text-align: center; font-size: 12px;">
            <a href="javascript:void(0)" onclick="window.drillDownStockStatus('LOW STOCK')" style="font-weight: 600;">
              View all ${t.lowStockItems.length} replenishment alerts in catalog →
            </a>
          </div>
        `:""}
      </div>

      <!-- Recent Stock Transactions Ledger -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2"/></svg>
            Recent Stock Transactions
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('reports')">Reports</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ref / Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${t.recentTransactions.length===0?`
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No transactions recorded yet.</td></tr>
              `:t.recentTransactions.map(a=>{const i=a.type==="STOCK_IN"||a.type==="ADJUSTMENT_IN";return`
                  <tr>
                    <td>
                      <div style="font-weight: 600; font-size: 12.5px;">${a.refNo}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${a.date}</div>
                    </td>
                    <td>
                      <span class="badge ${a.type==="STOCK_IN"?"badge-in-stock":a.type==="STOCK_OUT"?"badge-out-of-stock":"badge-low-stock"}" style="font-size: 10.5px;">
                        ${a.type.replace("_"," ")}
                      </span>
                    </td>
                    <td>
                      <div style="font-size: 12.5px; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${a.productName}">
                        ${a.productName}
                      </div>
                      <div style="font-size: 10.5px; color: var(--text-muted);">${a.sku||""}</div>
                    </td>
                    <td>
                      <strong style="color: ${i?"var(--success-text)":"var(--danger-text)"};">
                        ${i?"+":"-"}${a.quantity}
                      </strong>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="window.viewDashboardTxnDetails('${a.id}')" title="View Transaction Voucher">
                        View
                      </button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
        <div style="padding: 10px 16px; background: var(--surface-alt); border-top: 1px solid var(--border); text-align: center; font-size: 12px;">
          <a href="javascript:void(0)" onclick="window.router.navigate('inventory')" style="font-weight: 600;">
            View Master Product Catalog & Ledgers →
          </a>
        </div>
      </div>

    </div>
  `}window.drillDownStockStatus=function(o){window.router.navigate("inventory"),setTimeout(()=>{var e;(e=window.handleInventoryFilter)==null||e.call(window,"stockStatus",o);const t=document.getElementById("filter-stock");t&&(t.value=o)},60)};window.reorderLowStockItem=function(o){window.router.navigate("stock-in"),setTimeout(()=>{var e,n;const t=document.getElementById("in-product");if(t){t.value=o,(e=window.handleStockInProductChange)==null||e.call(window,o);const a=document.getElementById("in-qty");if(a){const i=T.find(l=>l.id===o);if(i){const l=Math.max(10,(i.maxStock||i.minStock*2)-i.currentStock);a.value=l,(n=window.updateStockInCalc)==null||n.call(window)}a.focus()}}window.showToast("Product pre-selected for purchase intake.","info")},100)};window.viewDashboardTxnDetails=function(o){const t=N.find(n=>n.id===o);if(!t)return;const e=t.type==="STOCK_IN"||t.type==="ADJUSTMENT_IN";window.openModal({title:`Transaction Voucher: ${t.refNo}`,body:`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Transaction Ref</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">${t.refNo}</div>
          </div>
          <div>
            <span class="badge ${t.type==="STOCK_IN"?"badge-in-stock":t.type==="STOCK_OUT"?"badge-out-of-stock":"badge-low-stock"}">
              ${t.type.replace("_"," ")}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Timestamp:</strong> <div>${t.date}</div></div>
          <div><strong style="color: var(--text-muted);">Operator:</strong> <div>${t.user||"System"}</div></div>
          <div><strong style="color: var(--text-muted);">Product SKU:</strong> <code>${t.sku||"-"}</code></div>
          <div><strong style="color: var(--text-muted);">Movement Qty:</strong> <div style="font-size: 15px; font-weight: 700; color: ${e?"var(--success-text)":"var(--danger-text)"};">${e?"+":"-"}${t.quantity}</div></div>
          <div><strong style="color: var(--text-muted);">Unit Price:</strong> <div>$${(t.unitCost||t.unitPrice||0).toFixed(2)}</div></div>
          <div><strong style="color: var(--text-muted);">Total Valuation:</strong> <div><strong>$${(t.totalValue||t.quantity*(t.unitCost||0)).toFixed(2)}</strong></div></div>
          <div><strong style="color: var(--text-muted);">Facility:</strong> <div>${t.location||"Central Warehouse"}</div></div>
          <div><strong style="color: var(--text-muted);">Counterparty:</strong> <div>${t.supplier||t.destination||t.recipient||"Internal"}</div></div>
        </div>

        ${t.notes?`
          <div style="padding: 10px 12px; background: var(--surface-alt); border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 12px;">
            <strong style="color: var(--text-muted); display: block; margin-bottom: 2px;">Operation Notes:</strong>
            ${t.notes}
          </div>
        `:""}
      </div>
    `,primaryText:"Close Voucher",onPrimary:()=>window.closeModal()})};window.refreshDashboardData=async function(){if(ut)return;ut=!0;const o=document.getElementById("btn-refresh-dashboard"),t=document.getElementById("refresh-icon");o&&(o.disabled=!0),t&&(t.style.animation="spin 1s linear infinite");try{S.isConfigured()&&await S.getDashboard();const e=document.getElementById("view-content");e&&(e.innerHTML=yt()),window.showToast("Executive Dashboard synchronized successfully.","success")}catch(e){console.warn("Dashboard sync note:",e);const n=document.getElementById("view-content");n&&(n.innerHTML=yt()),window.showToast("Dashboard metrics refreshed from local transaction balances.","info")}finally{ut=!1}};window.exportDashboardSummaryCSV=function(){const o=It(),t=o.kpis,e=new Date().toISOString().slice(0,10),a="data:text/csv;charset=utf-8,"+[["Executive Inventory Dashboard Summary",`Generated: ${e}`],[],["--- KEY PERFORMANCE INDICATORS ---"],["Metric","Value"],["Total Catalog Products",t.totalProducts],["Total Physical Units in Stock",t.totalCurrentStock],["Total Inventory Valuation (Cost)",`$${t.totalInventoryValue.toFixed(2)}`],["Total Retail Valuation",`$${t.totalRetailValue.toFixed(2)}`],["Unrealized Gross Margin",`$${t.grossProfit.toFixed(2)} (${t.marginPct.toFixed(1)}%)`],["Healthy In-Stock Items",t.healthyStockCount],["Low Stock Warnings",t.lowStockCount],["Out of Stock Items",t.outOfStockCount],["Stock In Today (Units / Valuation)",`${t.stockInToday.quantity} units / $${t.stockInToday.value.toFixed(2)}`],["Stock Out Today (Units / Valuation)",`${t.stockOutToday.quantity} units / $${t.stockOutToday.value.toFixed(2)}`],[],["--- STOCK DISTRIBUTION BY CATEGORY ---"],["Category","Units in Stock","Product Count","Valuation ($)","Stock Share (%)"],...o.categoryDistribution.map(r=>[`"${r.name}"`,r.units,r.count,r.value.toFixed(2),`${r.percentage}%`]),[],["--- CRITICAL REPLENISHMENT WARNINGS ---"],["SKU","Product Name","Category","Current Stock","Min Threshold","Deficit","Status"],...o.lowStockItems.map(r=>[r.sku,`"${r.name.replace(/"/g,'""')}"`,r.category,r.currentStock,r.minStock,Math.max(0,r.minStock-r.currentStock),r.stockStatus])].map(r=>r.join(",")).join(`
`),i=encodeURI(a),l=document.createElement("a");l.setAttribute("href",i),l.setAttribute("download",`Executive_Stock_Summary_${e}.csv`),document.body.appendChild(l),l.click(),document.body.removeChild(l),window.showToast("Executive Dashboard Summary downloaded.","success")};let A={search:"",category:"ALL",location:"ALL",stockStatus:"ALL",status:"ACTIVE"},Y=[...T],Tt=!1;async function Mt(){if(S.isConfigured())try{Tt=!0;const o=await S.getProducts();o&&o.success&&Array.isArray(o.data)&&(Y=o.data)}catch(o){console.warn("Could not load live products from Google Sheets, using local state:",o)}finally{Tt=!1}}function tt(){v.getUser();const o=v.hasRole("ADMIN","STOCK_MANAGER"),t=Y.filter(e=>{if(A.status!=="ALL"&&(A.status==="ARCHIVED"&&e.status!=="ARCHIVED"||A.status==="ACTIVE"&&e.status==="ARCHIVED"))return!1;const n=!A.search||e.name.toLowerCase().includes(A.search.toLowerCase())||e.sku.toLowerCase().includes(A.search.toLowerCase())||e.supplier&&e.supplier.toLowerCase().includes(A.search.toLowerCase())||e.barcode&&e.barcode.includes(A.search),a=A.category==="ALL"||e.category===A.category,i=A.location==="ALL"||e.location===A.location||e.locationId===A.location,l=A.stockStatus==="ALL"||e.stockStatus===A.stockStatus;return n&&a&&i&&l});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Product Master Catalog & Inventory</h1>
        <p>Manage product specifications, pricing, stock levels, thresholds, and suppliers.</p>
      </div>
      <div class="page-actions">
        ${o?`
          <button class="btn btn-secondary btn-sm" onclick="window.recalculateStockLedger()" title="Recalculate current stock from opening balance and all transaction records">
            <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Recalculate Ledger
          </button>
        `:""}
        <button class="btn btn-secondary btn-sm" onclick="window.refreshProductCatalog()">
          <svg viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Sync
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.exportInventoryCSV()">
          <svg viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export CSV
        </button>
        ${o?`
          <button class="btn btn-primary btn-sm" id="btn-add-product" onclick="window.openAddProductModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add New Product
          </button>
        `:""}
      </div>
    </div>

    <div class="card">
      <!-- Search and Multi-parameter Filters -->
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              id="inv-search-input" 
              placeholder="Search by SKU, Product Name, Barcode..." 
              value="${A.search}"
              oninput="window.handleInventorySearch(this.value)"
            />
          </div>

          <select class="select-filter" id="inv-filter-cat" onchange="window.handleInventoryFilter('category', this.value)">
            <option value="ALL">All Categories</option>
            ${H.map(e=>`<option value="${e.name}" ${A.category===e.name?"selected":""}>${e.name}</option>`).join("")}
          </select>

          <select class="select-filter" id="inv-filter-loc" onchange="window.handleInventoryFilter('location', this.value)">
            <option value="ALL">All Locations</option>
            ${E.map(e=>`<option value="${e.name}" ${A.location===e.name?"selected":""}>${e.name}</option>`).join("")}
          </select>

          <select class="select-filter" id="inv-filter-stock" onchange="window.handleInventoryFilter('stockStatus', this.value)">
            <option value="ALL" ${A.stockStatus==="ALL"?"selected":""}>All Stock Levels</option>
            <option value="IN STOCK" ${A.stockStatus==="IN STOCK"?"selected":""}>IN STOCK</option>
            <option value="LOW STOCK" ${A.stockStatus==="LOW STOCK"?"selected":""}>LOW STOCK</option>
            <option value="OUT OF STOCK" ${A.stockStatus==="OUT OF STOCK"?"selected":""}>OUT OF STOCK</option>
          </select>

          <select class="select-filter" id="inv-filter-status" onchange="window.handleInventoryFilter('status', this.value)">
            <option value="ACTIVE" ${A.status==="ACTIVE"?"selected":""}>Active Catalog</option>
            <option value="ARCHIVED" ${A.status==="ARCHIVED"?"selected":""}>Archived Items</option>
            <option value="ALL" ${A.status==="ALL"?"selected":""}>All Statuses</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${t.length}</strong> of ${Y.length} items
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable">SKU / Barcode</th>
              <th class="sortable">Product Name</th>
              <th>Category</th>
              <th>Location</th>
              <th style="text-align: right;">Current Stock</th>
              <th style="text-align: right;">Min / Max</th>
              <th style="text-align: right;">Cost Price</th>
              <th style="text-align: right;">Stock Value</th>
              <th style="text-align: center;">Stock Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${t.length===0?`
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching products found</div>
                    <div class="empty-state-desc">Try clearing your search query or filter settings to view existing catalog items.</div>
                    <button class="btn btn-secondary btn-sm" onclick="window.resetInventoryFilters()">Reset Filters</button>
                  </div>
                </td>
              </tr>
            `:t.map(e=>{const n=(e.currentStock*e.costPrice).toFixed(2),a=e.status==="ARCHIVED";return`
                <tr style="${a?"opacity: 0.6; background: #fafafa;":""}">
                  <td>
                    <div style="font-weight: 700; font-family: monospace; color: var(--primary);">${e.sku}</div>
                    <div style="font-size: 11px; color: var(--text-light); font-family: monospace;">${e.barcode||"NO BARCODE"}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${e.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">${e.unit} • ${e.supplier||"No Supplier"}</div>
                  </td>
                  <td>
                    <span class="badge badge-neutral">${e.category||"General"}</span>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; display: flex; align-items: center; gap: 4px;">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: var(--text-muted); fill: none;"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ${e.location||e.locationId||"Main Warehouse"}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 15px; font-weight: 700; color: ${e.currentStock===0?"var(--danger)":e.currentStock<=e.minStock?"var(--warning-dark)":"var(--text-main)"};">
                      ${e.currentStock}
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;"> ${e.unit}</span>
                  </td>
                  <td style="text-align: right; color: var(--text-muted); font-size: 12px;">
                    ${e.minStock} / ${e.maxStock}
                  </td>
                  <td style="text-align: right; font-weight: 500;">
                    $${Number(e.costPrice).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${Number(n).toLocaleString("en-US",{minimumFractionDigits:2})}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${e.stockStatus==="IN STOCK"?"badge-in-stock":e.stockStatus==="LOW STOCK"?"badge-low-stock":"badge-out-of-stock"}">
                      ${e.stockStatus}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Product Details" onclick="window.viewProductDetails('${e.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      ${o?`
                        <button class="btn btn-secondary btn-sm" title="Edit Product" onclick="window.openEditProductModal('${e.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        ${v.hasRole("ADMIN")&&!a?`
                          <button class="btn btn-secondary btn-sm" title="Archive Product" onclick="window.archiveProductPrompt('${e.id}')" style="color: var(--danger);">
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                          </button>
                        `:""}
                      `:""}
                    </div>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="pagination-container">
        <div>Showing <strong>${t.length}</strong> items in catalog</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>«</button>
          <button class="page-btn active">1</button>
          <button class="page-btn" disabled>»</button>
        </div>
      </div>
    </div>
  `}window.viewProductDetails=function(o){const t=Y.find(r=>r.id===o);if(!t)return;const e=(t.currentStock*t.costPrice).toFixed(2),n=(t.sellingPrice-t.costPrice).toFixed(2),a=t.costPrice>0?(n/t.costPrice*100).toFixed(1):"0.0",i=N.filter(r=>r.productId===t.id||r.sku===t.sku),l=t.maxStock>0?Math.min(100,Math.round(t.currentStock/t.maxStock*100)):50;window.openModal({title:`Product Specifications: ${t.sku}`,body:`
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <div>
            <div style="font-size: 19px; font-weight: 700; color: var(--text-main);">${t.name}</div>
            <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
              ${t.description||"Standard catalog inventory item."}
            </div>
          </div>
          <span class="badge ${t.stockStatus==="IN STOCK"?"badge-in-stock":t.stockStatus==="LOW STOCK"?"badge-low-stock":"badge-out-of-stock"}">
            ${t.stockStatus}
          </span>
        </div>

        <!-- Inventory Balance & Threshold Bar -->
        <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span>Current Stock: <strong style="color: var(--primary);">${t.currentStock} ${t.unit}</strong></span>
            <span style="color: var(--text-muted);">Thresholds: Min ${t.minStock} / Max ${t.maxStock} ${t.unit}</span>
          </div>
          <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; position: relative;">
            <div style="width: ${l}%; height: 100%; background: ${t.currentStock===0?"var(--danger)":t.currentStock<=t.minStock?"var(--warning)":"var(--success)"}; border-radius: 5px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            <span>0 units</span>
            <span>Capacity Utilized: ${l}%</span>
            <span>${t.maxStock} max</span>
          </div>
        </div>

        <!-- Transaction-Based Calculation Breakdown (Phase 12 Engine) -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 8px;">
            Transaction Ledger Formula: Current Stock = Opening + In − Out + AdjIn − AdjOut
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 8px; align-items: center; text-align: center; font-size: 12px;">
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--text-muted); font-size: 10px;">OPENING</div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.openingStock||0}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--success); font-size: 10px;">+ STOCK IN</div>
              <div style="font-weight: 700; color: var(--success); font-size: 14px;">+${i.filter(r=>r.type==="STOCK_IN").reduce((r,s)=>r+(s.quantity||0),0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--danger); font-size: 10px;">− STOCK OUT</div>
              <div style="font-weight: 700; color: var(--danger); font-size: 14px;">-${i.filter(r=>r.type==="STOCK_OUT").reduce((r,s)=>r+(s.quantity||0),0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--primary); font-size: 10px;">+ ADJ IN</div>
              <div style="font-weight: 700; color: var(--primary); font-size: 14px;">+${i.filter(r=>r.type==="ADJUSTMENT_IN").reduce((r,s)=>r+(s.quantity||0),0)}</div>
            </div>
            <div style="background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div style="color: var(--warning); font-size: 10px;">− ADJ OUT</div>
              <div style="font-weight: 700; color: var(--warning); font-size: 14px;">-${i.filter(r=>r.type==="ADJUSTMENT_OUT").reduce((r,s)=>r+(s.quantity||0),0)}</div>
            </div>
            <div style="background: rgba(0, 87, 231, 0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--primary); text-align: right;">
              <div style="color: var(--primary); font-size: 10px; font-weight: 700;">CALCULATED BALANCE</div>
              <div style="font-weight: 800; color: var(--primary); font-size: 15px;">${t.currentStock} ${t.unit}</div>
            </div>
          </div>
        </div>

        <!-- Master Attributes Grid -->
        <div class="form-grid" style="font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Product ID:</strong> <span style="font-family: monospace;">${t.id}</span></div>
          <div><strong style="color: var(--text-muted);">Barcode:</strong> <span style="font-family: monospace;">${t.barcode||"N/A"}</span></div>
          <div><strong style="color: var(--text-muted);">Category:</strong> ${t.category}</div>
          <div><strong style="color: var(--text-muted);">Storage Location:</strong> ${t.location||t.locationId}</div>
          <div><strong style="color: var(--text-muted);">Primary Supplier:</strong> ${t.supplier}</div>
          <div><strong style="color: var(--text-muted);">Unit of Measure:</strong> ${t.unit}</div>
          <div><strong style="color: var(--text-muted);">Procurement Cost:</strong> $${t.costPrice.toFixed(2)}</div>
          <div><strong style="color: var(--text-muted);">Selling Price:</strong> $${t.sellingPrice.toFixed(2)}</div>
          <div><strong style="color: var(--text-muted);">Gross Margin:</strong> <span style="color: var(--success); font-weight: 600;">+$${n} (${a}%)</span></div>
          <div><strong style="color: var(--text-muted);">Asset Valuation:</strong> <strong style="color: var(--primary);">$${Number(e).toLocaleString("en-US",{minimumFractionDigits:2})}</strong></div>
        </div>

        <!-- Recent Movements for this SKU -->
        <div>
          <div style="font-size: 13.5px; font-weight: 700; margin-bottom: 8px;">Product Movement Ledger</div>
          <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <table class="data-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ref No</th>
                  <th>Type</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${i.length===0?`
                  <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No transaction records found for this product.</td></tr>
                `:i.map(r=>`
                  <tr>
                    <td>${r.date}</td>
                    <td style="font-weight: 600;">${r.refNo}</td>
                    <td><span class="badge ${r.type.includes("IN")?"badge-in-stock":"badge-out-of-stock"}">${r.type}</span></td>
                    <td><strong>${r.type.includes("IN")?"+":"-"}${r.quantity}</strong></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,primaryText:"Close",onPrimary:()=>window.closeModal()})};window.openAddProductModal=function(){const o=`PRD-SKU-${Math.floor(100+Math.random()*900)}`;window.openModal({title:"Add New Master Catalog Product",body:`
      <form id="add-product-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewProduct();">
        <div class="form-group">
          <label class="form-label">SKU (Stock Keeping Unit) <span class="required-star">*</span></label>
          <input type="text" id="new-sku" class="form-input" value="${o}" placeholder="e.g. STA-A4P-02" required />
          <div class="form-hint">Must be globally unique</div>
        </div>
        <div class="form-group">
          <label class="form-label">Barcode / UPC</label>
          <input type="text" id="new-barcode" class="form-input" placeholder="880123456009" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Product Name <span class="required-star">*</span></label>
          <input type="text" id="new-name" class="form-input" placeholder="e.g. Spiral Bound Executive Notebook (A5, 200 Pages)" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description / Specifications</label>
          <textarea id="new-desc" class="form-textarea" rows="2" placeholder="Detailed product specifications, dimensions, color..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Category <span class="required-star">*</span></label>
          <select id="new-category" class="form-select">
            ${H.map(t=>`<option value="${t.name}">${t.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit of Measure <span class="required-star">*</span></label>
          <select id="new-unit" class="form-select">
            <option value="Piece">Piece</option>
            <option value="Box">Box</option>
            <option value="Ream">Ream</option>
            <option value="Bottle">Bottle</option>
            <option value="Bundle">Bundle</option>
            <option value="Cartridge">Cartridge</option>
            <option value="Pack">Pack</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Primary Supplier <span class="required-star">*</span></label>
          <select id="new-supplier" class="form-select">
            ${_.map(t=>`<option value="${t.name}">${t.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Default Storage Location <span class="required-star">*</span></label>
          <select id="new-location" class="form-select">
            ${E.map(t=>`<option value="${t.name}">${t.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cost Price ($) <span class="required-star">*</span></label>
          <input type="number" step="0.01" min="0" id="new-cost" class="form-input" placeholder="0.00" oninput="window.updatePricePreview()" required />
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price ($)</label>
          <input type="number" step="0.01" min="0" id="new-price" class="form-input" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Stock Alert Threshold <span class="required-star">*</span></label>
          <input type="number" min="0" id="new-min" class="form-input" value="20" required />
          <div class="form-hint">Triggers Low Stock warning</div>
        </div>
        <div class="form-group">
          <label class="form-label">Maximum Warehouse Capacity</label>
          <input type="number" min="0" id="new-max" class="form-input" value="200" />
        </div>
        <div class="form-group">
          <label class="form-label">Opening Initial Stock</label>
          <input type="number" min="0" id="new-opening" class="form-input" value="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Product Image URL</label>
          <input type="url" id="new-image" class="form-input" placeholder="https://..." />
        </div>
      </form>
    `,primaryText:"Save Product",onPrimary:()=>window.submitNewProduct()})};window.updatePricePreview=function(){var e;const o=parseFloat(((e=document.getElementById("new-cost"))==null?void 0:e.value)||"0"),t=document.getElementById("new-price");o>0&&t&&!t.value&&(t.value=(o*1.4).toFixed(2))};window.submitNewProduct=async function(){var I,L,$,z,U,O,y,C,D,K,et,ot,m,k,V,G,X;const o=(I=document.getElementById("new-sku"))==null?void 0:I.value.trim(),t=(L=document.getElementById("new-name"))==null?void 0:L.value.trim(),e=parseFloat((($=document.getElementById("new-cost"))==null?void 0:$.value)||"0"),n=parseInt(((z=document.getElementById("new-min"))==null?void 0:z.value)||"10",10),a=parseInt(((U=document.getElementById("new-max"))==null?void 0:U.value)||n*10,10);if(!o||!t){window.showToast("Please fill all required fields (SKU, Name, Cost Price).","error");return}if(a<n){window.showToast("Maximum stock capacity must be greater than or equal to Minimum stock.","error");return}if(Y.some(st=>st.sku.toLowerCase()===o.toLowerCase())){window.showToast(`Error: SKU "${o}" already exists in the catalog. SKU must be unique.`,"error");return}const i=parseInt(((O=document.getElementById("new-opening"))==null?void 0:O.value)||"0",10),l=(y=document.getElementById("new-category"))==null?void 0:y.value,r=(C=document.getElementById("new-unit"))==null?void 0:C.value,s=(D=document.getElementById("new-supplier"))==null?void 0:D.value,d=(K=document.getElementById("new-location"))==null?void 0:K.value,c=parseFloat(((et=document.getElementById("new-price"))==null?void 0:et.value)||(e*1.4).toFixed(2)),p=(ot=document.getElementById("new-desc"))==null?void 0:ot.value.trim(),u=(m=document.getElementById("new-barcode"))==null?void 0:m.value.trim(),w=(k=document.getElementById("new-image"))==null?void 0:k.value.trim();let x="IN STOCK";i===0?x="OUT OF STOCK":i<=n&&(x="LOW STOCK");const f={id:`PRD-${Math.floor(1e3+Math.random()*9e3)}`,sku:o,barcode:u||"8801"+Math.floor(1e7+Math.random()*9e7),name:t,description:p,category:l,unit:r,supplier:s,costPrice:e,sellingPrice:c,minStock:n,maxStock:a,location:d,openingStock:i,currentStock:i,stockStatus:x,imageUrl:w,status:"ACTIVE"};let h=!1;if(S.isConfigured())try{window.showToast("Saving product to Google Sheets...","info"),await S.createProduct(f,v.getToken()),h=!0,window.showToast(`✅ Product "${t}" saved to Google Sheets!`,"success")}catch(st){console.error("API createProduct failed:",st),window.showToast(`❌ Google Sheets Error: ${st.message}`,"error",8e3)}else window.showToast(`⚠️ Demo Mode: Product "${t}" saved locally. To save to Google Sheets, connect your Web App URL in the top header.`,"warning",6e3);Y.unshift(f),T.unshift(f),i>0&&N.unshift({id:`TXN-${Date.now().toString().slice(-8)}`,date:new Date().toISOString().replace("T"," ").substring(0,16),type:"STOCK_IN",refNo:"OPENING-BALANCE",sku:o,productName:t,quantity:i,unitCost:e,totalValue:i*e,location:d,supplier:s,user:((V=v.getUser())==null?void 0:V.fullName)||"Admin"}),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((G=v.getUser())==null?void 0:G.userId)||"USR-001",username:((X=v.getUser())==null?void 0:X.username)||"admin",action:"CREATE_PRODUCT",module:"Products",recordId:f.id,description:`Created new master product [${o}] ${t}`}),window.closeModal();const b=document.getElementById("view-content");b&&(b.innerHTML=tt())};window.openEditProductModal=function(o){const t=Y.find(e=>e.id===o);t&&window.openModal({title:`Edit Master Product: ${t.sku}`,body:`
      <form id="edit-product-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditProduct('${t.id}');">
        <div class="form-group">
          <label class="form-label">SKU <span class="required-star">*</span></label>
          <input type="text" id="edit-sku" class="form-input" value="${t.sku}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Barcode</label>
          <input type="text" id="edit-barcode" class="form-input" value="${t.barcode||""}" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Product Name <span class="required-star">*</span></label>
          <input type="text" id="edit-name" class="form-input" value="${t.name}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description</label>
          <textarea id="edit-desc" class="form-textarea" rows="2">${t.description||""}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="edit-category" class="form-select">
            ${H.map(e=>`<option value="${e.name}" ${t.category===e.name?"selected":""}>${e.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit</label>
          <input type="text" id="edit-unit" class="form-input" value="${t.unit}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Supplier</label>
          <select id="edit-supplier" class="form-select">
            ${_.map(e=>`<option value="${e.name}" ${t.supplier===e.name?"selected":""}>${e.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Storage Location</label>
          <select id="edit-location" class="form-select">
            ${E.map(e=>`<option value="${e.name}" ${t.location===e.name||t.locationId===e.name?"selected":""}>${e.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cost Price ($) <span class="required-star">*</span></label>
          <input type="number" step="0.01" min="0" id="edit-cost" class="form-input" value="${t.costPrice}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price ($)</label>
          <input type="number" step="0.01" min="0" id="edit-price" class="form-input" value="${t.sellingPrice}" />
        </div>
        <div class="form-group">
          <label class="form-label">Min Stock Threshold</label>
          <input type="number" min="0" id="edit-min" class="form-input" value="${t.minStock}" />
        </div>
        <div class="form-group">
          <label class="form-label">Max Stock Capacity</label>
          <input type="number" min="0" id="edit-max" class="form-input" value="${t.maxStock}" />
        </div>
      </form>
    `,primaryText:"Save Changes",onPrimary:()=>window.submitEditProduct(t.id)})};window.submitEditProduct=async function(o){var l,r,s,d,c,p,u,w,x,f,h,b,I,L;const t=Y.find($=>$.id===o);if(!t)return;const e=(l=document.getElementById("edit-sku"))==null?void 0:l.value.trim(),n=(r=document.getElementById("edit-name"))==null?void 0:r.value.trim(),a=parseFloat(((s=document.getElementById("edit-cost"))==null?void 0:s.value)||"0");if(!e||!n){window.showToast("SKU and Product Name cannot be empty.","error");return}if(Y.some($=>$.id!==o&&$.sku.toLowerCase()===e.toLowerCase())){window.showToast(`Error: SKU "${e}" already belongs to another product.`,"error");return}if(t.sku=e,t.name=n,t.barcode=(d=document.getElementById("edit-barcode"))==null?void 0:d.value.trim(),t.description=(c=document.getElementById("edit-desc"))==null?void 0:c.value.trim(),t.category=(p=document.getElementById("edit-category"))==null?void 0:p.value,t.unit=(u=document.getElementById("edit-unit"))==null?void 0:u.value,t.supplier=(w=document.getElementById("edit-supplier"))==null?void 0:w.value,t.location=(x=document.getElementById("edit-location"))==null?void 0:x.value,t.costPrice=a,t.sellingPrice=parseFloat(((f=document.getElementById("edit-price"))==null?void 0:f.value)||(a*1.4).toFixed(2)),t.minStock=parseInt(((h=document.getElementById("edit-min"))==null?void 0:h.value)||"10",10),t.maxStock=parseInt(((b=document.getElementById("edit-max"))==null?void 0:b.value)||"100",10),t.currentStock===0?t.stockStatus="OUT OF STOCK":t.currentStock<=t.minStock?t.stockStatus="LOW STOCK":t.stockStatus="IN STOCK",S.isConfigured())try{await S.request("updateProduct",{method:"POST",data:{id:o,...t},token:v.getToken()})}catch($){console.warn("API update failed, updated in memory:",$)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((I=v.getUser())==null?void 0:I.userId)||"USR-001",username:((L=v.getUser())==null?void 0:L.username)||"admin",action:"UPDATE_PRODUCT",module:"Products",recordId:o,description:`Updated catalog attributes for [${t.sku}] ${t.name}`}),window.closeModal(),window.showToast(`Product "${t.name}" updated successfully.`,"success");const i=document.getElementById("view-content");i&&(i.innerHTML=tt())};window.archiveProductPrompt=function(o){const t=Y.find(e=>e.id===o);t&&window.openModal({title:`Archive Product: ${t.sku}`,body:`
      <div>
        <div style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">
          Are you sure you want to archive "${t.name}"?
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">
          Archived products will be excluded from the active catalog and daily Stock In / Stock Out dropdowns, but historical transaction ledger records and audit logs will remain permanently intact.
        </p>
      </div>
    `,primaryText:"Yes, Archive Product",onPrimary:async()=>{var n,a;if(t.status="ARCHIVED",S.isConfigured())try{await S.request("archiveProduct",{method:"POST",data:{id:o},token:v.getToken()})}catch(i){console.warn("API archive failed, archived in memory:",i)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((n=v.getUser())==null?void 0:n.userId)||"USR-001",username:((a=v.getUser())==null?void 0:a.username)||"admin",action:"ARCHIVE_PRODUCT",module:"Products",recordId:o,description:`Archived product [${t.sku}] ${t.name}`}),window.closeModal(),window.showToast(`Product "${t.name}" archived.`,"info");const e=document.getElementById("view-content");e&&(e.innerHTML=tt())}})};window.handleInventorySearch=function(o){A.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=tt())};window.handleInventoryFilter=function(o,t){A[o]=t;const e=document.getElementById("view-content");e&&(e.innerHTML=tt())};window.resetInventoryFilters=function(){A={search:"",category:"ALL",location:"ALL",stockStatus:"ALL",status:"ACTIVE"};const o=document.getElementById("view-content");o&&(o.innerHTML=tt())};window.refreshProductCatalog=async function(){window.showToast("Synchronizing catalog with Google Sheets...","info"),await Mt(),window.showToast("Product catalog up-to-date.","success");const o=document.getElementById("view-content");o&&(o.innerHTML=tt())};window.exportInventoryCSV=function(){const o=["Product ID","SKU","Barcode","Product Name","Category","Unit","Supplier","Cost Price","Selling Price","Current Stock","Stock Value","Status"],t=Y.filter(i=>i.status!=="ARCHIVED").map(i=>[i.id,i.sku,i.barcode||"",`"${i.name.replace(/"/g,'""')}"`,i.category,i.unit,`"${i.supplier||""}"`,i.costPrice,i.sellingPrice,i.currentStock,(i.currentStock*i.costPrice).toFixed(2),i.stockStatus]),e="data:text/csv;charset=utf-8,"+[o.join(","),...t.map(i=>i.join(","))].join(`
`),n=encodeURI(e),a=document.createElement("a");a.setAttribute("href",n),a.setAttribute("download",`Product_Catalog_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a),window.showToast("Product Catalog CSV downloaded.","success")};window.recalculateStockLedger=async function(){const o=v.getUser();if(!v.hasRole("ADMIN","STOCK_MANAGER")){window.showToast("Access restricted: Managerial permissions required to recalculate ledger.","error");return}window.showToast("Synchronizing inventory ledger from transaction logs...","info");let t=0;if(Y.forEach(n=>{const a=N.filter(p=>p.productId===n.id||p.sku===n.sku),i=a.filter(p=>p.type==="STOCK_IN").reduce((p,u)=>p+(u.quantity||0),0),l=a.filter(p=>p.type==="STOCK_OUT").reduce((p,u)=>p+(u.quantity||0),0),r=a.filter(p=>p.type==="ADJUSTMENT_IN").reduce((p,u)=>p+(u.quantity||0),0),s=a.filter(p=>p.type==="ADJUSTMENT_OUT").reduce((p,u)=>p+(u.quantity||0),0),d=n.openingStock||0,c=Math.max(0,d+i-l+r-s);n.currentStock=c,n.currentStock===0?n.stockStatus="OUT OF STOCK":n.currentStock<=n.minStock?n.stockStatus="LOW STOCK":n.stockStatus="IN STOCK",t++}),S.isConfigured())try{await S.request("recalculateStockLedger",{method:"POST",token:v.getToken()})}catch(n){console.warn("API recalculateStockLedger failed:",n)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:(o==null?void 0:o.userId)||"USR-001",username:(o==null?void 0:o.username)||"admin",action:"RECALCULATE_STOCK",module:"Current Stock",recordId:"ALL",description:`Recalculated transaction balances for ${t} master catalog items.`}),window.showToast(`Ledger synchronized! ${t} items recalculated from transaction history.`,"success");const e=document.getElementById("view-content");e&&(e.innerHTML=tt())};let Q={search:"",location:"ALL",supplier:"ALL"};function mt(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t=N.filter(d=>d.type==="STOCK_IN"),e=new Date().toISOString().slice(0,10),n=`PO-${new Date().getFullYear()}-${Math.floor(1e3+Math.random()*9e3)}`,a=t.length,i=t.reduce((d,c)=>d+(c.quantity||0),0),l=t.reduce((d,c)=>d+(c.totalValue||c.quantity*(c.unitCost||0)),0),r=new Set(t.map(d=>d.supplier).filter(Boolean)).size,s=t.filter(d=>{const c=Q.search.toLowerCase(),p=!c||d.refNo&&d.refNo.toLowerCase().includes(c)||d.id&&d.id.toLowerCase().includes(c)||d.sku&&d.sku.toLowerCase().includes(c)||d.productName&&d.productName.toLowerCase().includes(c)||d.supplier&&d.supplier.toLowerCase().includes(c)||d.location&&d.location.toLowerCase().includes(c),u=Q.location==="ALL"||d.location===Q.location,w=Q.supplier==="ALL"||d.supplier===Q.supplier;return p&&u&&w});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock In & Inbound Receiving</h1>
        <p>Record vendor purchase shipments, inbound consignments, and warehouse stock receipts.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportStockInCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Inbound Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Stock In KPI Cards Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Inbound Receipts</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
        </div>
        <div class="kpi-value">${a}</div>
        <div class="kpi-footer">Completed intake vouchers</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Received</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${i.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative physical stock additions</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Inbound Stock Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${l.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div class="kpi-footer">Gross procurement value</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Sourcing Partners</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${r}</div>
        <div class="kpi-footer">Suppliers with completed receipts</div>
      </div>
    </div>

    <!-- Intake Form & Live Impact Section -->
    ${o?`
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Inbound Voucher Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--success);" viewBox="0 0 24 24" fill="none"><path d="M7 11l5-5m0 0l5 5m-5-5v12" stroke="currentColor" stroke-width="2"/></svg>
              New Goods Receipt Voucher (GRN)
            </div>
            <span class="badge badge-in-stock">INBOUND MOVEMENT</span>
          </div>

          <div class="card-body">
            <form id="stock-in-form" onsubmit="event.preventDefault(); window.submitStockIn();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Receipt Date <span class="required-star">*</span></label>
                  <input type="date" id="in-date" class="form-input" value="${e}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    PO / Delivery Reference <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('in-ref').value = 'PO-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="in-ref" class="form-input" value="${n}" placeholder="PO-2026-XXXX" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Supplying Vendor <span class="required-star">*</span></label>
                  <select id="in-supplier" class="form-select" required>
                    <option value="">Select Supplier...</option>
                    ${_.filter(d=>d.status==="ACTIVE").map(d=>`
                      <option value="${d.name}">${d.name}</option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Receiving Facility <span class="required-star">*</span></label>
                  <select id="in-location" class="form-select" required>
                    ${E.filter(d=>d.status==="ACTIVE").map(d=>`
                      <option value="${d.name}">${d.name}</option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Catalog Item to Receive <span class="required-star">*</span></label>
                  <select id="in-product" class="form-select" onchange="window.handleStockInProductChange(this.value)" required>
                    <option value="">Select Product from Catalog...</option>
                    ${T.filter(d=>d.status!=="ARCHIVED").map(d=>`
                      <option value="${d.id}" data-cost="${d.costPrice}" data-name="${d.name}" data-sku="${d.sku}" data-unit="${d.unit}" data-stock="${d.currentStock}" data-min="${d.minStock}" data-max="${d.maxStock}">
                        [${d.sku}] ${d.name} — Current: ${d.currentStock} ${d.unit}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Intake Quantity <span class="required-star">*</span></label>
                  <input type="number" id="in-qty" class="form-input" min="1" step="1" placeholder="e.g. 50" oninput="window.updateStockInCalc()" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Unit Cost ($) <span class="required-star">*</span></label>
                  <input type="number" id="in-cost" class="form-input" min="0" step="0.01" placeholder="0.00" oninput="window.updateStockInCalc()" required />
                </div>

                <!-- Live Calculation Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner">
                    <div class="calc-summary-left">
                      <span>Valuation Formula: <strong>Quantity × Unit Cost</strong></span>
                      <span id="in-calc-breakdown" style="font-weight: 600; color: var(--text-main);">0 × $0.00</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Total Inbound Value</div>
                      <div class="calc-summary-val" id="in-total-val" style="color: var(--success);">$0.00</div>
                    </div>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Carrier / Delivery Notes</label>
                  <textarea id="in-notes" class="form-textarea" rows="2" placeholder="e.g. Received via FedLine logistics. Bill of Lading #BL-992. Packaging inspected intact."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetStockInForm()">Reset</button>
                <button type="submit" class="btn btn-primary" id="btn-save-stock-in">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Confirm & Post Stock In
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Real-Time Stock Impact Widget -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/></svg>
                Inventory Impact Preview
              </div>
            </div>
            <div class="card-body" id="inbound-impact-preview">
              <div class="empty-state" style="padding: 24px;">
                <div class="empty-state-icon">
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
                <div class="empty-state-desc" style="font-size: 12px;">Choose a catalog product to preview before/after stock levels and valuation.</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>
                Receiving Compliance SOP
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Count Verification:</strong> Unload and physically verify quantity against the Vendor Packing Slip.</p>
              <p style="margin-top: 6px;">• <strong>Audit Trail:</strong> Inbound records are immutable. Corrections must be handled via Stock Adjustments.</p>
              <p style="margin-top: 6px;">• <strong>FIFO Valuation:</strong> Stock valuation balances reflect transaction at-cost pricing.</p>
            </div>
          </div>
        </div>
      </div>
    `:""}

    <!-- Inbound Receipts Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Inbound Receipts History Ledger</div>
        <span class="badge badge-neutral">${s.length} Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by PO #, SKU, product, or vendor..." 
              value="${Q.search}" 
              oninput="window.handleStockInSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleStockInLocationFilter(this.value)">
            <option value="ALL" ${Q.location==="ALL"?"selected":""}>All Locations</option>
            ${E.map(d=>`
              <option value="${d.name}" ${Q.location===d.name?"selected":""}>${d.name}</option>
            `).join("")}
          </select>

          <select class="select-filter" onchange="window.handleStockInSupplierFilter(this.value)">
            <option value="ALL" ${Q.supplier==="ALL"?"selected":""}>All Suppliers</option>
            ${_.map(d=>`
              <option value="${d.name}" ${Q.supplier===d.name?"selected":""}>${d.name}</option>
            `).join("")}
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${s.length}</strong> receipts
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Receipt Ref / ID</th>
              <th>Date & Time</th>
              <th>Product Line</th>
              <th>Destination Depot</th>
              <th>Supplying Vendor</th>
              <th style="text-align: right;">Qty Intake</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Total Value</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${s.length===0?`
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No inbound receipts found</div>
                    <div class="empty-state-desc">Try clearing the search query or post a new Stock In voucher.</div>
                  </div>
                </td>
              </tr>
            `:s.map(d=>{const c=d.totalValue||d.quantity*(d.unitCost||0);return`
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${d.refNo||d.id}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${d.id}</div>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); white-space: nowrap;">
                    ${d.date}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${d.productName}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${d.sku}</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${d.location||"Central Storage"}
                  </td>
                  <td style="font-size: 13px; font-weight: 500;">
                    ${d.supplier||"N/A"}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 700; color: var(--success); font-size: 14px;">
                      +${d.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(d.unitCost||0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${c.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge badge-in-stock" style="font-size: 11px;">
                      COMPLETED
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewReceiptVoucher('${d.id}')" title="View Goods Receipt Note">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      GRN Voucher
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleStockInProductChange=function(o){const t=T.find(i=>i.id===o),e=document.getElementById("in-cost"),n=document.getElementById("in-supplier"),a=document.getElementById("in-location");t&&(e&&(e.value=Number(t.costPrice||0).toFixed(2)),t.supplier&&n&&(n.value=t.supplier),t.location&&a&&(a.value=t.location)),window.updateStockInCalc()};window.updateStockInCalc=function(){var h,b;const o=document.getElementById("in-product"),t=o==null?void 0:o.value,e=parseFloat(((h=document.getElementById("in-qty"))==null?void 0:h.value)||"0"),n=parseFloat(((b=document.getElementById("in-cost"))==null?void 0:b.value)||"0"),a=e*n,i=document.getElementById("in-calc-breakdown"),l=document.getElementById("in-total-val");i&&(i.textContent=`${e} units × $${n.toFixed(2)}`),l&&(l.textContent=`$${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`);const r=document.getElementById("inbound-impact-preview");if(!r)return;const s=T.find(I=>I.id===t);if(!s){r.innerHTML=`
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
        <div class="empty-state-desc" style="font-size: 12px;">Choose a catalog product to preview before/after stock levels and valuation.</div>
      </div>
    `;return}const d=s.currentStock||0,c=d+(isNaN(e)||e<0?0:e),p=s.minStock||10,u=s.maxStock||500,w=Math.min(100,Math.round(c/u*100));let x="IN STOCK",f="badge-in-stock";c===0?(x="OUT OF STOCK",f="badge-out-of-stock"):c<=p&&(x="LOW STOCK",f="badge-low-stock"),r.innerHTML=`
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
      <div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${s.name}</div>
        <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${s.sku} | ${s.category}</div>
      </div>
      <span class="badge ${f}" style="font-size: 11px;">${x}</span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
      <div style="background: var(--bg-main); padding: 10px; border-radius: 6px; text-align: center;">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Current Stock</div>
        <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">${d} ${s.unit}</div>
      </div>

      <div style="background: rgba(34, 197, 94, 0.08); padding: 10px; border-radius: 6px; text-align: center; border: 1px dashed var(--success);">
        <div style="font-size: 11px; color: var(--success); font-weight: 600; text-transform: uppercase;">Projected Stock</div>
        <div style="font-size: 18px; font-weight: 700; color: var(--success);">+${c} ${s.unit}</div>
      </div>
    </div>

    <div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span style="color: var(--text-muted);">Warehouse Capacity (${c}/${u})</span>
        <span style="font-weight: 600; color: var(--text-main);">${w}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${w}%; background: var(--success);"></div>
      </div>
    </div>
  `};window.resetStockInForm=function(){setTimeout(()=>{window.updateStockInCalc()},50)};window.submitStockIn=async function(){var h,b,I,L,$,z,U,O,y,C;const o=document.getElementById("in-product"),t=o==null?void 0:o.value,e=parseInt(((h=document.getElementById("in-qty"))==null?void 0:h.value)||"0",10),n=parseFloat(((b=document.getElementById("in-cost"))==null?void 0:b.value)||"0"),a=(I=document.getElementById("in-ref"))==null?void 0:I.value.trim(),i=(L=document.getElementById("in-supplier"))==null?void 0:L.value,l=($=document.getElementById("in-location"))==null?void 0:$.value,r=((z=document.getElementById("in-date"))==null?void 0:z.value)||new Date().toISOString().slice(0,10),s=(U=document.getElementById("in-notes"))==null?void 0:U.value.trim();if(!t||!e||e<=0||n<0||!a||!i||!l){window.showToast("Please validate all mandatory fields. Intake quantity must be greater than zero.","error");return}const d=T.find(D=>D.id===t);if(!d){window.showToast("Selected product could not be found.","error");return}const c=new Date().toTimeString().slice(0,5),p=`${r} ${c}`,u=`TXN-IN-${Date.now().toString().slice(-6)}`,w=e*n,x={id:u,date:p,type:"STOCK_IN",refNo:a,productId:d.id,sku:d.sku,productName:d.name,quantity:e,unitCost:n,totalValue:w,supplier:i,location:l,user:((O=v.getUser())==null?void 0:O.fullName)||"Alex Thorne",notes:s||"Supplier Purchase Intake"};if(S.isConfigured())try{window.showToast("Recording Stock In with Google Sheets Ledger...","info"),await S.request("createStockIn",{method:"POST",data:x,token:v.getToken()}),window.showToast("✅ Stock In successfully recorded in Google Sheets!","success")}catch(D){console.error("API Stock In failed:",D),window.showToast(`❌ Google Sheets Error: ${D.message}`,"error",8e3)}else window.showToast("⚠️ Demo Mode: Transaction recorded locally. Connect your Google Sheets Web App URL in header to save permanently.","warning",6e3);N.unshift(x),d.currentStock+=e,d.currentStock>d.minStock?d.stockStatus="IN STOCK":d.currentStock>0&&(d.stockStatus="LOW STOCK"),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((y=v.getUser())==null?void 0:y.userId)||"USR-001",username:((C=v.getUser())==null?void 0:C.username)||"admin",action:"STOCK_IN",module:"Stock In",recordId:u,description:`Received ${e} ${d.unit} of [${d.sku}] ${d.name} from "${i}" (Ref: ${a})`}),window.showToast(`Goods Receipt Voucher ${a} posted successfully! Updated balance: ${d.currentStock} ${d.unit}.`,"success");const f=document.getElementById("view-content");f&&(f.innerHTML=mt())};window.viewReceiptVoucher=function(o){const t=N.find(n=>n.id===o);if(!t)return;const e=t.totalValue||t.quantity*(t.unitCost||0);window.openModal({title:`Goods Receipt Note: ${t.refNo||t.id}`,body:`
      <div id="printable-grn-voucher" style="padding: 10px;">
        <!-- Voucher Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--primary); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Warehouse Inbound Receiving & Quality Verification</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">GOODS RECEIPT NOTE</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Voucher Metadata Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">PO / Delivery Challan:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Receipt Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Supplying Vendor:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.supplier||"Authorized Vendor"}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Receiving Depot:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location||"Central Storage"}</div>
          </div>
        </div>

        <!-- Received Line Items Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 700; color: var(--success); font-size: 14px;">+${t.quantity}</td>
                <td style="text-align: right;">$${Number(t.unitCost||0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${e.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: var(--bg-main); font-weight: 700;">
                <td colspan="4" style="text-align: right; font-size: 13px;">Grand Total Received:</td>
                <td style="text-align: right; color: var(--primary); font-size: 14px;">$${e.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes & Remarks -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Receipt Remarks:</strong> ${t.notes||"Goods verified and inspected with zero defects."}
        </div>

        <!-- Sign-Off Block -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Received & Inspected By:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user||"Warehouse Receiver"}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Site Supervisor Authorization:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; margin-left: auto; padding-top: 4px; font-weight: 600; color: var(--text-main);">Signature & Stamp</div>
          </div>
        </div>
      </div>
    `,primaryText:"Print Voucher",onPrimary:()=>{window.print()}})};window.handleStockInSearch=function(o){Q.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=mt())};window.handleStockInLocationFilter=function(o){Q.location=o;const t=document.getElementById("view-content");t&&(t.innerHTML=mt())};window.handleStockInSupplierFilter=function(o){Q.supplier=o;const t=document.getElementById("view-content");t&&(t.innerHTML=mt())};window.exportStockInCSV=function(){const o=N.filter(l=>l.type==="STOCK_IN");if(o.length===0){window.showToast("No Stock In records to export.","info");return}const t=["Transaction_ID","Date","Type","Reference_No","SKU","Product_Name","Quantity","Unit_Cost","Total_Value","Supplier","Location","Received_By","Notes"],e=o.map(l=>[l.id,`"${l.date}"`,l.type,`"${l.refNo}"`,`"${l.sku}"`,`"${(l.productName||"").replace(/"/g,'""')}"`,l.quantity,Number(l.unitCost||0).toFixed(2),Number(l.totalValue||l.quantity*(l.unitCost||0)).toFixed(2),`"${(l.supplier||"").replace(/"/g,'""')}"`,`"${(l.location||"").replace(/"/g,'""')}"`,`"${(l.user||"").replace(/"/g,'""')}"`,`"${(l.notes||"").replace(/"/g,'""')}"`]),n="data:text/csv;charset=utf-8,"+[t.join(","),...e.map(l=>l.join(","))].join(`
`),a=encodeURI(n),i=document.createElement("a");i.setAttribute("href",a),i.setAttribute("download",`Stock_In_Ledger_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(i),i.click(),document.body.removeChild(i),window.showToast("Stock In receipts exported to CSV successfully.","success")};let F={search:"",location:"ALL",department:"ALL"};function gt(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t=N.filter(d=>d.type==="STOCK_OUT"),e=new Date().toISOString().slice(0,10),n=`SO-${new Date().getFullYear()}-${Math.floor(1e3+Math.random()*9e3)}`,a=t.length,i=t.reduce((d,c)=>d+(c.quantity||0),0),l=t.reduce((d,c)=>d+(c.totalValue||c.quantity*(c.unitCost||0)),0),r=new Set(t.map(d=>d.department).filter(Boolean)).size,s=t.filter(d=>{const c=F.search.toLowerCase(),p=!c||d.refNo&&d.refNo.toLowerCase().includes(c)||d.id&&d.id.toLowerCase().includes(c)||d.sku&&d.sku.toLowerCase().includes(c)||d.productName&&d.productName.toLowerCase().includes(c)||d.department&&d.department.toLowerCase().includes(c)||d.location&&d.location.toLowerCase().includes(c),u=F.location==="ALL"||d.location===F.location,w=F.department==="ALL"||d.department===F.department;return p&&u&&w});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock Out & Inventory Dispatch</h1>
        <p>Fulfill customer sales orders, department requisitions, and outgoing facility consignments.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportStockOutCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Outbound Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Stock Out KPI Cards Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Dispatches</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
        </div>
        <div class="kpi-value">${a}</div>
        <div class="kpi-footer">Completed outgoing orders</div>
      </div>

      <div class="kpi-card kpi-orange">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Issued</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 12H4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${i.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative stock deductions</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Dispatched Valuation</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${l.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div class="kpi-footer">Gross at-cost fulfillment value</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Departments Served</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${r}</div>
        <div class="kpi-footer">Active internal & external channels</div>
      </div>
    </div>

    <!-- Dispatch Form & Stock Depletion Preview -->
    ${o?`
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Dispatch Requisition Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--danger);" viewBox="0 0 24 24" fill="none"><path d="M17 13l-5 5m0 0l-5-5m5 5V6" stroke="currentColor" stroke-width="2"/></svg>
              New Goods Dispatch Voucher (GDN)
            </div>
            <span class="badge badge-out-of-stock">OUTBOUND TRANSACTION</span>
          </div>

          <div class="card-body">
            <form id="stock-out-form" onsubmit="event.preventDefault(); window.submitStockOut();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Dispatch Date <span class="required-star">*</span></label>
                  <input type="date" id="out-date" class="form-input" value="${e}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    SO / Requisition Reference <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('out-ref').value = 'SO-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="out-ref" class="form-input" value="${n}" placeholder="SO-2026-XXXX" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Issuing Facility <span class="required-star">*</span></label>
                  <select id="out-location" class="form-select" required>
                    ${E.filter(d=>d.status==="ACTIVE").map(d=>`
                      <option value="${d.name}">${d.name}</option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Requesting Department <span class="required-star">*</span></label>
                  <select id="out-dept" class="form-select" required>
                    <option value="Sales & Distribution">Sales & Distribution</option>
                    <option value="Operations">Operations</option>
                    <option value="Production & Assembly">Production & Assembly</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Administration & HR">Administration & HR</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Catalog Item to Issue <span class="required-star">*</span></label>
                  <select id="out-product" class="form-select" onchange="window.handleStockOutProductChange(this.value)" required>
                    <option value="">Select Product from Catalog...</option>
                    ${T.filter(d=>d.status!=="ARCHIVED").map(d=>`
                      <option value="${d.id}" data-stock="${d.currentStock}" data-unit="${d.unit}" data-cost="${d.costPrice}">
                        [${d.sku}] ${d.name} — Available: ${d.currentStock} ${d.unit} ${d.currentStock===0?"(OUT OF STOCK)":""}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <!-- Available Stock Callout Indicator -->
                <div class="form-group col-span-2" id="out-availability-box" style="display: none;">
                  <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Available Stock On Hand</span>
                      <div id="out-available-text" style="font-size: 15px; font-weight: 700; color: var(--text-main);">0 Units</div>
                    </div>
                    <div id="out-stock-pill"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Dispatch Quantity <span class="required-star">*</span></label>
                  <input type="number" id="out-qty" class="form-input" min="1" step="1" placeholder="Enter quantity to issue" oninput="window.validateStockOutQuantity()" required />
                  <div id="out-error-notice" style="display: none; font-size: 12px; color: var(--danger); margin-top: 4px; font-weight: 600;"></div>
                </div>

                <div class="form-group">
                  <label class="form-label">Issuance Purpose / Reason <span class="required-star">*</span></label>
                  <select id="out-reason" class="form-select" required>
                    <option value="Customer Sales Fulfillment">Customer Sales Fulfillment</option>
                    <option value="Internal Office Consumption">Internal Office Consumption</option>
                    <option value="Production Line Issuance">Production Line Issuance</option>
                    <option value="Inter-Branch Transfer">Inter-Branch Transfer</option>
                    <option value="Damaged / Expired Write-off">Damaged / Expired Write-off</option>
                    <option value="Sample / Marketing Demo">Sample / Marketing Demo</option>
                  </select>
                </div>

                <!-- Live Valuation Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner">
                    <div class="calc-summary-left">
                      <span>Valuation Formula: <strong>Quantity × Unit Cost</strong></span>
                      <span id="out-calc-breakdown" style="font-weight: 600; color: var(--text-main);">0 units × $0.00</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Dispatched Holding Value</div>
                      <div class="calc-summary-val" id="out-total-val" style="color: var(--danger);">$0.00</div>
                    </div>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Recipient / Consignee & Delivery Notes</label>
                  <textarea id="out-notes" class="form-textarea" rows="2" placeholder="e.g. Dispatched to Chicago Regional Store. Waybill #WB-482. Received by Mark Vance."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetStockOutForm()">Reset</button>
                <button type="submit" class="btn btn-danger" id="btn-save-stock-out">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Confirm & Dispatch Stock
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Real-Time Stock Depletion Impact Widget -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/></svg>
                Inventory Depletion Forecast
              </div>
            </div>
            <div class="card-body" id="outbound-impact-preview">
              <div class="empty-state" style="padding: 24px;">
                <div class="empty-state-icon">
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
                <div class="empty-state-desc" style="font-size: 12px;">Choose an item to preview depletion impact, threshold compliance, and remaining stock.</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--danger);" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>
                Strict Anti-Negative Stock Guardrail
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Zero Negative Inventory:</strong> Requisitions cannot exceed available on-hand stock under any circumstance.</p>
              <p style="margin-top: 6px;">• <strong>Audit Enforcement:</strong> Dispatches immediately decrement physical balance and post immutable entries to the transaction ledger.</p>
              <p style="margin-top: 6px;">• <strong>Threshold Alerts:</strong> When remaining balance drops to or below the minimum reorder point, an alert is triggered.</p>
            </div>
          </div>
        </div>
      </div>
    `:""}

    <!-- Outbound Dispatch Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Outbound Dispatches History Ledger</div>
        <span class="badge badge-neutral">${s.length} Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by SO #, SKU, product, or department..." 
              value="${F.search}" 
              oninput="window.handleStockOutSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleStockOutLocationFilter(this.value)">
            <option value="ALL" ${F.location==="ALL"?"selected":""}>All Locations</option>
            ${E.map(d=>`
              <option value="${d.name}" ${F.location===d.name?"selected":""}>${d.name}</option>
            `).join("")}
          </select>

          <select class="select-filter" onchange="window.handleStockOutDeptFilter(this.value)">
            <option value="ALL" ${F.department==="ALL"?"selected":""}>All Departments</option>
            <option value="Sales & Distribution" ${F.department==="Sales & Distribution"?"selected":""}>Sales & Distribution</option>
            <option value="Operations" ${F.department==="Operations"?"selected":""}>Operations</option>
            <option value="Production & Assembly" ${F.department==="Production & Assembly"?"selected":""}>Production & Assembly</option>
            <option value="IT Services" ${F.department==="IT Services"?"selected":""}>IT Services</option>
            <option value="Administration & HR" ${F.department==="Administration & HR"?"selected":""}>Administration & HR</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${s.length}</strong> dispatches
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dispatch Ref / ID</th>
              <th>Date & Time</th>
              <th>Product Line</th>
              <th>Origin Depot</th>
              <th>Department / Purpose</th>
              <th style="text-align: right;">Qty Issued</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Total Value</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${s.length===0?`
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No outbound dispatches found</div>
                    <div class="empty-state-desc">Try clearing the search query or post a new Stock Out voucher.</div>
                  </div>
                </td>
              </tr>
            `:s.map(d=>{const c=d.totalValue||d.quantity*(d.unitCost||0);return`
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${d.refNo||d.id}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${d.id}</div>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); white-space: nowrap;">
                    ${d.date}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${d.productName}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${d.sku}</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${d.location||"Central Storage"}
                  </td>
                  <td>
                    <div style="font-size: 13px; font-weight: 500; color: var(--text-main);">${d.department||"Operations"}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${d.reason||"Requisition"}</div>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 700; color: var(--danger); font-size: 14px;">
                      -${d.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(d.unitCost||0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--text-main);">
                    $${c.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge badge-out-of-stock" style="font-size: 11px;">
                      DISPATCHED
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewDispatchVoucher('${d.id}')" title="View Goods Dispatch Note">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      GDN Voucher
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleStockOutProductChange=function(o){const t=T.find(l=>l.id===o),e=document.getElementById("out-availability-box"),n=document.getElementById("out-available-text"),a=document.getElementById("out-stock-pill"),i=document.getElementById("out-location");t&&e&&n&&a?(e.style.display="block",n.textContent=`${t.currentStock} ${t.unit}`,a.className=`badge ${t.currentStock===0?"badge-out-of-stock":t.currentStock<=t.minStock?"badge-low-stock":"badge-in-stock"}`,a.textContent=t.stockStatus,t.location&&i&&(i.value=t.location)):e&&(e.style.display="none"),window.validateStockOutQuantity()};window.validateStockOutQuantity=function(){var p;const o=(p=document.getElementById("out-product"))==null?void 0:p.value,t=T.find(u=>u.id===o),e=document.getElementById("out-qty"),n=document.getElementById("out-error-notice"),a=document.getElementById("btn-save-stock-out"),i=parseFloat((e==null?void 0:e.value)||"0"),l=t&&t.costPrice||0,r=i*l,s=document.getElementById("out-calc-breakdown"),d=document.getElementById("out-total-val");s&&(s.textContent=`${i} units × $${l.toFixed(2)}`),d&&(d.textContent=`$${r.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`);const c=document.getElementById("outbound-impact-preview");if(c)if(!t)c.innerHTML=`
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div class="empty-state-title" style="font-size: 14px;">Select an item</div>
          <div class="empty-state-desc" style="font-size: 12px;">Choose an item to preview depletion impact, threshold compliance, and remaining stock.</div>
        </div>
      `;else{const u=t.currentStock-(isNaN(i)||i<0?0:i),w=t.minStock||10,x=t.maxStock||500,f=Math.max(0,Math.min(100,Math.round(u/x*100)));let h="IN STOCK",b="badge-in-stock";u<0?(h="NEGATIVE DEFICIT",b="badge-out-of-stock"):u===0?(h="DEPLETED (OUT OF STOCK)",b="badge-out-of-stock"):u<=w&&(h="LOW STOCK (REORDER)",b="badge-low-stock"),c.innerHTML=`
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${t.sku} | Threshold: ${w} ${t.unit}</div>
          </div>
          <span class="badge ${b}" style="font-size: 10px;">${h}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
          <div style="background: var(--bg-main); padding: 10px; border-radius: 6px; text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Available Now</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">${t.currentStock} ${t.unit}</div>
          </div>

          <div style="background: ${u<0?"rgba(239, 68, 68, 0.1)":"rgba(0, 87, 231, 0.06)"}; padding: 10px; border-radius: 6px; text-align: center; border: 1px dashed ${u<0?"var(--danger)":"var(--primary)"};">
            <div style="font-size: 11px; color: ${u<0?"var(--danger)":"var(--primary)"}; font-weight: 600; text-transform: uppercase;">Balance After Dispatch</div>
            <div style="font-size: 18px; font-weight: 700; color: ${u<0?"var(--danger)":"var(--text-main)"};">${u} ${t.unit}</div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Remaining Storage Gauge (${u}/${x})</span>
            <span style="font-weight: 600; color: var(--text-main);">${f}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${f}%; background: ${u<=w?"var(--warning)":"var(--primary)"};"></div>
          </div>
        </div>
      `}return!t||!e||!n||!a?!0:i>t.currentStock?(e.style.borderColor="var(--danger)",n.style.display="block",n.innerHTML=`⚠️ <strong>Insufficient Inventory:</strong> Requisition of <strong>${i} ${t.unit}</strong> exceeds on-hand balance of <strong>${t.currentStock} ${t.unit}</strong>.`,a.disabled=!0,a.style.opacity="0.4",a.style.cursor="not-allowed",!1):(e.style.borderColor="",n.style.display="none",a.disabled=!1,a.style.opacity="1",a.style.cursor="pointer",!0)};window.resetStockOutForm=function(){setTimeout(()=>{window.validateStockOutQuantity()},50)};window.submitStockOut=async function(){var f,h,b,I,L,$,z,U,O,y,C;if(!window.validateStockOutQuantity()){window.showToast("Transaction blocked: requested quantity exceeds available physical stock.","error");return}const o=(f=document.getElementById("out-product"))==null?void 0:f.value,t=T.find(D=>D.id===o),e=parseInt(((h=document.getElementById("out-qty"))==null?void 0:h.value)||"0",10),n=(b=document.getElementById("out-ref"))==null?void 0:b.value.trim(),a=(I=document.getElementById("out-location"))==null?void 0:I.value,i=(L=document.getElementById("out-dept"))==null?void 0:L.value,l=($=document.getElementById("out-reason"))==null?void 0:$.value,r=((z=document.getElementById("out-date"))==null?void 0:z.value)||new Date().toISOString().slice(0,10),s=(U=document.getElementById("out-notes"))==null?void 0:U.value.trim();if(!t||!e||e<=0||!n||!a||!i){window.showToast("Please complete all mandatory requisition fields.","error");return}if(e>t.currentStock){window.showToast(`Insufficient stock! Available balance: ${t.currentStock} ${t.unit}.`,"error");return}const d=new Date().toTimeString().slice(0,5),c=`${r} ${d}`,p=`TXN-OUT-${Date.now().toString().slice(-6)}`,u=e*t.costPrice,w={id:p,date:c,type:"STOCK_OUT",refNo:n,productId:t.id,sku:t.sku,productName:t.name,quantity:e,unitCost:t.costPrice,totalValue:u,location:a,supplier:"-",department:i,reason:l,user:((O=v.getUser())==null?void 0:O.fullName)||"Alex Thorne",notes:s||"Dispatch Requisition"};if(S.isConfigured())try{window.showToast("Transmitting Stock Out to Google Sheets Ledger...","info"),await S.request("createStockOut",{method:"POST",data:w,token:v.getToken()}),window.showToast("✅ Stock Out successfully recorded in Google Sheets!","success")}catch(D){console.error("API Stock Out failed:",D),window.showToast(`❌ Google Sheets Error: ${D.message}`,"error",8e3)}else window.showToast("⚠️ Demo Mode: Transaction recorded locally. Connect your Google Sheets Web App URL in header to save permanently.","warning",6e3);N.unshift(w),t.currentStock-=e,t.currentStock===0?t.stockStatus="OUT OF STOCK":t.currentStock<=t.minStock?t.stockStatus="LOW STOCK":t.stockStatus="IN STOCK",P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((y=v.getUser())==null?void 0:y.userId)||"USR-001",username:((C=v.getUser())==null?void 0:C.username)||"admin",action:"STOCK_OUT",module:"Stock Out",recordId:p,description:`Dispatched ${e} ${t.unit} of [${t.sku}] ${t.name} to "${i}" (Ref: ${n})`}),window.showToast(`Goods Dispatch Note ${n} posted successfully! Remaining: ${t.currentStock} ${t.unit}.`,"success");const x=document.getElementById("view-content");x&&(x.innerHTML=gt())};window.viewDispatchVoucher=function(o){const t=N.find(n=>n.id===o);if(!t)return;const e=t.totalValue||t.quantity*(t.unitCost||0);window.openModal({title:`Goods Dispatch Note: ${t.refNo||t.id}`,body:`
      <div id="printable-gdn-voucher" style="padding: 10px;">
        <!-- Voucher Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--danger); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--danger); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Warehouse Outbound Dispatch & Packing Slip</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">GOODS DISPATCH NOTE</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--danger); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Voucher Metadata Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">SO / Requisition Reference:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Dispatch Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Issuing Depot:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location||"Central Storage"}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Requesting Department:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.department||"Operations"} (${t.reason||"Dispatch"})</div>
          </div>
        </div>

        <!-- Dispatched Line Items Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Description</th>
                <th style="text-align: right;">Quantity Issued</th>
                <th style="text-align: right;">Unit Valuation</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 700; color: var(--danger); font-size: 14px;">-${t.quantity}</td>
                <td style="text-align: right;">$${Number(t.unitCost||0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${e.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: var(--bg-main); font-weight: 700;">
                <td colspan="4" style="text-align: right; font-size: 13px;">Grand Total Dispatched:</td>
                <td style="text-align: right; color: var(--danger); font-size: 14px;">$${e.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes & Remarks -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Dispatch Remarks:</strong> ${t.notes||"Goods verified and released according to requisition mandate."}
        </div>

        <!-- Sign-Off Block -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Dispatched By Warehouse Officer:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user||"Alex Thorne"}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Department Recipient Acknowledgment:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; margin-left: auto; padding-top: 4px; font-weight: 600; color: var(--text-main);">Signature & Employee ID</div>
          </div>
        </div>
      </div>
    `,primaryText:"Print Voucher",onPrimary:()=>{window.print()}})};window.handleStockOutSearch=function(o){F.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=gt())};window.handleStockOutLocationFilter=function(o){F.location=o;const t=document.getElementById("view-content");t&&(t.innerHTML=gt())};window.handleStockOutDeptFilter=function(o){F.department=o;const t=document.getElementById("view-content");t&&(t.innerHTML=gt())};window.exportStockOutCSV=function(){const o=N.filter(l=>l.type==="STOCK_OUT");if(o.length===0){window.showToast("No Stock Out records to export.","info");return}const t=["Transaction_ID","Date","Type","Reference_No","SKU","Product_Name","Quantity_Issued","Unit_Cost","Total_Value","Department","Issuing_Location","Dispatched_By","Notes"],e=o.map(l=>[l.id,`"${l.date}"`,l.type,`"${l.refNo}"`,`"${l.sku}"`,`"${(l.productName||"").replace(/"/g,'""')}"`,l.quantity,Number(l.unitCost||0).toFixed(2),Number(l.totalValue||l.quantity*(l.unitCost||0)).toFixed(2),`"${(l.department||"").replace(/"/g,'""')}"`,`"${(l.location||"").replace(/"/g,'""')}"`,`"${(l.user||"").replace(/"/g,'""')}"`,`"${(l.notes||"").replace(/"/g,'""')}"`]),n="data:text/csv;charset=utf-8,"+[t.join(","),...e.map(l=>l.join(","))].join(`
`),a=encodeURI(n),i=document.createElement("a");i.setAttribute("href",a),i.setAttribute("download",`Stock_Out_Ledger_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(i),i.click(),document.body.removeChild(i),window.showToast("Stock Out dispatches exported to CSV successfully.","success")};let W={search:"",location:"ALL",type:"ALL"};function ht(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t=N.filter(c=>c.type==="ADJUSTMENT_IN"||c.type==="ADJUSTMENT_OUT"),e=new Date().toISOString().slice(0,10),n=`AUD-${new Date().getFullYear()}-${Math.floor(1e3+Math.random()*9e3)}`,a=t.length,i=t.reduce((c,p)=>p.type==="ADJUSTMENT_IN"?c+p.quantity:c-p.quantity,0),l=t.reduce((c,p)=>{const u=p.totalValue||p.quantity*(p.unitCost||0);return p.type==="ADJUSTMENT_IN"?c+u:c-u},0),r=t.filter(c=>c.type==="ADJUSTMENT_IN").length,s=t.filter(c=>c.type==="ADJUSTMENT_OUT").length,d=t.filter(c=>{const p=W.search.toLowerCase(),u=!p||c.refNo&&c.refNo.toLowerCase().includes(p)||c.id&&c.id.toLowerCase().includes(p)||c.sku&&c.sku.toLowerCase().includes(p)||c.productName&&c.productName.toLowerCase().includes(p)||c.reason&&c.reason.toLowerCase().includes(p)||c.location&&c.location.toLowerCase().includes(p),w=W.location==="ALL"||c.location===W.location,x=W.type==="ALL"||c.type===W.type;return u&&w&&x});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Stock Adjustment & Variance Reconciliation</h1>
        <p>Conduct physical cycle counts, audit stock take reconciliations, and resolve physical-to-book discrepancies.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportAdjustmentCSV()">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Audit Log
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.router.navigate('inventory')">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory Catalog
        </button>
      </div>
    </div>

    <!-- Adjustment KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Audit Reconciliations</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${a}</div>
        <div class="kpi-footer">${r} Surpluses | ${s} Deficits</div>
      </div>

      <div class="kpi-card ${i>=0?"kpi-green":"kpi-orange"}">
        <div class="kpi-card-header">
          <span class="kpi-title">Net Unit Variance</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${i>=0?"+":""}${i.toLocaleString()}</div>
        <div class="kpi-footer">Cumulative physical discrepancy</div>
      </div>

      <div class="kpi-card ${l>=0?"kpi-cyan":"kpi-purple"}">
        <div class="kpi-card-header">
          <span class="kpi-title">Net Financial Impact</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          ${l>=0?"+":"-"}$${Math.abs(l).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div class="kpi-footer">Book valuation adjustment balance</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog Audit Status</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 18px;">100% Verified</div>
        <div class="kpi-footer">Active reconciliation safeguards</div>
      </div>
    </div>

    <!-- Reconciliation Form & Audit Guidelines -->
    ${o?`
      <div class="dashboard-grid-2" style="margin-bottom: 24px;">
        <!-- Physical Count Reconciliation Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg style="width: 18px; height: 18px; stroke: var(--warning);" viewBox="0 0 24 24" fill="none"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" stroke-width="2"/></svg>
              Physical Stock Count Reconciliation Form
            </div>
            <span class="badge badge-neutral">AUDIT VERIFIED</span>
          </div>

          <div class="card-body">
            <form id="adjustment-form" onsubmit="event.preventDefault(); window.submitStockAdjustment();">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Audit / Verification Date <span class="required-star">*</span></label>
                  <input type="date" id="adj-date" class="form-input" value="${e}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Audit Ref / Count Sheet # <span class="required-star">*</span>
                    <button type="button" class="btn-link" style="float: right; font-size: 11px;" onclick="document.getElementById('adj-ref').value = 'AUD-${new Date().getFullYear()}-' + Math.floor(1000 + Math.random() * 9000)">Regenerate</button>
                  </label>
                  <input type="text" id="adj-ref" class="form-input" value="${n}" placeholder="AUD-2026-XXXX" required />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Target Catalog Product <span class="required-star">*</span></label>
                  <select id="adj-product" class="form-select" onchange="window.handleAdjustmentProductChange(this.value)" required>
                    <option value="">Select Product to Reconcile...</option>
                    ${T.filter(c=>c.status!=="ARCHIVED").map(c=>`
                      <option value="${c.id}" data-current="${c.currentStock}" data-unit="${c.unit}" data-cost="${c.costPrice}" data-location="${c.location}">
                        [${c.sku}] ${c.name} — Current System Balance: ${c.currentStock} ${c.unit}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Current System Book Quantity</label>
                  <input type="number" id="adj-sys-qty" class="form-input" value="0" readonly style="background: var(--bg-main); font-weight: 700; color: var(--text-main);" />
                  <div class="form-hint">Recorded digital balance in database</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Physical Counted Quantity <span class="required-star">*</span></label>
                  <input type="number" id="adj-phy-qty" class="form-input" min="0" step="1" placeholder="Enter verified count on shelf" oninput="window.updateAdjustmentVariance()" required />
                  <div class="form-hint">Physical stock verified on shelf</div>
                </div>

                <!-- Live Discrepancy & Direction Banner -->
                <div class="form-group col-span-2">
                  <div class="calc-summary-banner" id="adj-banner-box" style="background: var(--bg-main); border: 1px solid var(--border-color);">
                    <div>
                      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Calculated Discrepancy</div>
                      <div style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin-top: 2px;">
                        Formula: <strong>Physical Count − System Book</strong>
                      </div>
                      <div id="adj-financial-impact" style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        Valuation Impact: $0.00
                      </div>
                    </div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 14px;">
                      <div>
                        <div id="adj-diff-val" style="font-size: 22px; font-weight: 800; color: var(--text-muted);">0 Units</div>
                      </div>
                      <div id="adj-action-badge">
                        <span class="badge badge-neutral">BALANCED</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Warehouse Facility <span class="required-star">*</span></label>
                  <select id="adj-location" class="form-select" required>
                    ${E.filter(c=>c.status==="ACTIVE").map(c=>`
                      <option value="${c.name}">${c.name}</option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Adjustment Reason <span class="required-star">*</span></label>
                  <select id="adj-reason" class="form-select" required>
                    <option value="">Select Reason...</option>
                    <option value="Periodic Cycle Count Variance">Periodic Cycle Count Variance</option>
                    <option value="Annual Physical Stock Take Audit">Annual Physical Stock Take Audit</option>
                    <option value="Damaged in Warehouse Storage">Damaged in Warehouse Storage</option>
                    <option value="Defective / Broken in Transit">Defective / Broken in Transit</option>
                    <option value="Supplier Packaging Error">Supplier Packaging Error</option>
                    <option value="Theft / Unexplained Shrinkage">Theft / Unexplained Shrinkage</option>
                    <option value="Found Unrecorded Surplus Stock">Found Unrecorded Surplus Stock</option>
                    <option value="Expired Product Disposal">Expired Product Disposal</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Auditor Investigation Notes & Justification</label>
                  <textarea id="adj-notes" class="form-textarea" rows="2" placeholder="Detail the root cause of the variance, recount verification, or corrective action taken..."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px;">
                <button type="reset" class="btn btn-secondary" onclick="window.resetAdjustmentForm()">Reset</button>
                <button type="submit" class="btn btn-primary" id="btn-save-adj">
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Post Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Audit Reconciliation SOP & Rules -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2"/></svg>
                Audit Reconciliation Protocol
              </div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>• <strong>Dual Ledger Synchronization:</strong> Adjustments post to both the dedicated <code>Stock_Adjustments</code> log and the master <code>Stock_Transactions</code> ledger.</p>
              <p style="margin-top: 6px;">• <strong>Direction Assignment:</strong> Positive discrepancies automatically log as <code>ADJUSTMENT_IN</code>; negative discrepancies automatically log as <code>ADJUSTMENT_OUT</code>.</p>
              <p style="margin-top: 6px;">• <strong>Managerial Oversight:</strong> Discrepancies exceeding $500 or 20% of on-hand inventory require senior management countersignature.</p>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Audit Trail Compliance</div>
            </div>
            <div class="card-body" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
              <p>Every posted adjustment generates an immutable cryptographic transaction ID and permanent audit record with operator identity and timestamp.</p>
            </div>
          </div>
        </div>
      </div>
    `:""}

    <!-- Adjustments History Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Stock Adjustments History Ledger</div>
        <span class="badge badge-neutral">${d.length} Audit Records</span>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search by Audit #, SKU, product, reason, or location..." 
              value="${W.search}" 
              oninput="window.handleAdjustmentSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleAdjustmentLocationFilter(this.value)">
            <option value="ALL" ${W.location==="ALL"?"selected":""}>All Locations</option>
            ${E.map(c=>`
              <option value="${c.name}" ${W.location===c.name?"selected":""}>${c.name}</option>
            `).join("")}
          </select>

          <select class="select-filter" onchange="window.handleAdjustmentTypeFilter(this.value)">
            <option value="ALL" ${W.type==="ALL"?"selected":""}>All Variance Types</option>
            <option value="ADJUSTMENT_IN" ${W.type==="ADJUSTMENT_IN"?"selected":""}>ADJUSTMENT_IN (Surplus)</option>
            <option value="ADJUSTMENT_OUT" ${W.type==="ADJUSTMENT_OUT"?"selected":""}>ADJUSTMENT_OUT (Deficit)</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${d.length}</strong> adjustments
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Audit Ref / ID</th>
              <th>Timestamp</th>
              <th>Product Line</th>
              <th>Location</th>
              <th>Reason & Root Cause</th>
              <th style="text-align: right;">Variance Quantity</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Financial Impact</th>
              <th style="text-align: center;">Direction</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${d.length===0?`
              <tr>
                <td colspan="10">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No stock adjustments found</div>
                    <div class="empty-state-desc">Try clearing the search query or reconcile a physical stock count.</div>
                  </div>
                </td>
              </tr>
            `:d.map(c=>{const p=c.type==="ADJUSTMENT_IN",u=c.totalValue||c.quantity*(c.unitCost||0);return`
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${c.refNo||c.id}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${c.id}</div>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); white-space: nowrap;">
                    ${c.date}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${c.productName}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--primary);">${c.sku}</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${c.location||"Central Storage"}
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.reason||""}">
                    ${c.reason||"Cycle count reconciliation"}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 800; color: ${p?"var(--success)":"var(--danger)"}; font-size: 14px;">
                      ${p?"+":"-"}${c.quantity}
                    </span>
                  </td>
                  <td style="text-align: right; font-size: 13px;">
                    $${Number(c.unitCost||0).toFixed(2)}
                  </td>
                  <td style="text-align: right; font-weight: 700; color: ${p?"var(--success)":"var(--danger)"};">
                    ${p?"+":"-"}$${u.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${p?"badge-in-stock":"badge-out-of-stock"}" style="font-size: 11px;">
                      ${p?"+ SURPLUS":"- DEFICIT"}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewAdjustmentVoucher('${c.id}')" title="View Adjustment Voucher">
                      <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      Voucher
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleAdjustmentProductChange=function(o){const t=T.find(i=>i.id===o),e=document.getElementById("adj-sys-qty"),n=document.getElementById("adj-phy-qty"),a=document.getElementById("adj-location");t&&(e&&(e.value=t.currentStock||0),n&&(n.value=t.currentStock||0),t.location&&a&&(a.value=t.location),window.updateAdjustmentVariance())};window.updateAdjustmentVariance=function(){var c,p,u;const o=(c=document.getElementById("adj-product"))==null?void 0:c.value,t=T.find(w=>w.id===o),e=parseInt(((p=document.getElementById("adj-sys-qty"))==null?void 0:p.value)||"0",10),n=parseInt(((u=document.getElementById("adj-phy-qty"))==null?void 0:u.value)||"0",10),a=isNaN(n)?0:n-e,i=t&&t.costPrice||0,l=a*i,r=document.getElementById("adj-diff-val"),s=document.getElementById("adj-action-badge"),d=document.getElementById("adj-financial-impact");!r||!s||(d&&(d.innerHTML=`Valuation Impact: <strong style="color: ${a>0?"var(--success)":a<0?"var(--danger)":"var(--text-main)"};">${a>=0?"+":"-"}$${Math.abs(l).toFixed(2)}</strong>`),a>0?(r.textContent=`+${a} Units`,r.style.color="var(--success)",s.innerHTML=`<span class="badge badge-in-stock">ADJUSTMENT_IN (+${a} SURPLUS)</span>`):a<0?(r.textContent=`${a} Units`,r.style.color="var(--danger)",s.innerHTML=`<span class="badge badge-out-of-stock">ADJUSTMENT_OUT (${a} DEFICIT)</span>`):(r.textContent="0 Units",r.style.color="var(--text-muted)",s.innerHTML='<span class="badge badge-neutral">BALANCED (NO DISCREPANCY)</span>'))};window.resetAdjustmentForm=function(){setTimeout(()=>{window.updateAdjustmentVariance()},50)};window.submitStockAdjustment=async function(){var I,L,$,z,U,O,y,C,D,K,et;const o=(I=document.getElementById("adj-product"))==null?void 0:I.value,t=T.find(ot=>ot.id===o),e=parseInt(((L=document.getElementById("adj-sys-qty"))==null?void 0:L.value)||"0",10),n=parseInt((($=document.getElementById("adj-phy-qty"))==null?void 0:$.value)||"0",10),a=(z=document.getElementById("adj-reason"))==null?void 0:z.value,i=(U=document.getElementById("adj-ref"))==null?void 0:U.value.trim(),l=(O=document.getElementById("adj-location"))==null?void 0:O.value,r=((y=document.getElementById("adj-date"))==null?void 0:y.value)||new Date().toISOString().slice(0,10),s=(C=document.getElementById("adj-notes"))==null?void 0:C.value.trim();if(!t||isNaN(n)||!a||!i||!l){window.showToast("Please specify target product, physical verified count, reason, and location.","error");return}const d=n-e;if(d===0){window.showToast("Physical count matches system balance exactly. No variance to post.","info");return}const c=d>0?"ADJUSTMENT_IN":"ADJUSTMENT_OUT",p=Math.abs(d),u=new Date().toTimeString().slice(0,5),w=`${r} ${u}`,x=`TXN-ADJ-${Date.now().toString().slice(-6)}`,f=p*t.costPrice,h={id:x,date:w,type:c,refNo:i,productId:t.id,sku:t.sku,productName:t.name,quantity:p,unitCost:t.costPrice,totalValue:f,location:l,supplier:"-",department:"Inventory Control",reason:a,user:((D=v.getUser())==null?void 0:D.fullName)||"Alex Thorne",notes:s||"Cycle Count Variance Reconciliation"};if(S.isConfigured())try{window.showToast("Posting Stock Adjustment to Google Sheets...","info"),await S.request("createStockAdjustment",{method:"POST",data:{productId:t.id,physicalQuantity:n,reason:a,refNo:i,location:l,notes:s},token:v.getToken()}),window.showToast("✅ Stock Adjustment successfully posted to Google Sheets!","success")}catch(ot){console.error("API createStockAdjustment failed:",ot),window.showToast(`❌ Google Sheets Error: ${ot.message}`,"error",8e3)}else window.showToast("⚠️ Demo Mode: Adjustment posted locally. Connect your Google Sheets Web App URL in header to save permanently.","warning",6e3);N.unshift(h),t.currentStock=n,t.currentStock===0?t.stockStatus="OUT OF STOCK":t.currentStock<=t.minStock?t.stockStatus="LOW STOCK":t.stockStatus="IN STOCK",P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((K=v.getUser())==null?void 0:K.userId)||"USR-001",username:((et=v.getUser())==null?void 0:et.username)||"admin",action:"STOCK_ADJUSTMENT",module:"Stock Adjustment",recordId:x,description:`Reconciled ${t.name} from ${e} to ${n} (${d>0?"+":""}${d}) — ${a}`}),window.showToast(`Stock Adjustment ${i} posted. Balance reconciled to ${n} ${t.unit}.`,"success");const b=document.getElementById("view-content");b&&(b.innerHTML=ht())};window.viewAdjustmentVoucher=function(o){const t=N.find(a=>a.id===o);if(!t)return;const e=t.type==="ADJUSTMENT_IN",n=t.totalValue||t.quantity*(t.unitCost||0);window.openModal({title:`Stock Adjustment Voucher: ${t.refNo||t.id}`,body:`
      <div id="printable-adj-voucher" style="padding: 10px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${e?"var(--success)":"var(--warning)"}; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">STOCK MANAGEMENT SYSTEM</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Inventory Cycle Count & Reconciliation Certificate</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">ADJUSTMENT VOUCHER</div>
            <div style="font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 700;">${t.id}</div>
          </div>
        </div>

        <!-- Metadata -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg-main); padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Audit Reference No:</span>
            <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${t.refNo}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Audit Timestamp:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.date}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Storage Location:</span>
            <div style="font-weight: 600; color: var(--text-main);">${t.location||"Central Storage"}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Variance Direction:</span>
            <div><span class="badge ${e?"badge-in-stock":"badge-out-of-stock"}">${e?"+ SURPLUS INTAKE":"- DEFICIT WRITE-OFF"}</span></div>
          </div>
        </div>

        <!-- Line Item Table -->
        <div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 20px;">
          <table class="data-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th>Item SKU</th>
                <th>Product Description</th>
                <th style="text-align: right;">Variance Qty</th>
                <th style="text-align: right;">Unit Cost</th>
                <th style="text-align: right;">Financial Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
                <td style="font-weight: 600;">${t.productName}</td>
                <td style="text-align: right; font-weight: 800; color: ${e?"var(--success)":"var(--danger)"}; font-size: 14px;">
                  ${e?"+":"-"}${t.quantity}
                </td>
                <td style="text-align: right;">$${Number(t.unitCost||0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 800; color: ${e?"var(--success)":"var(--danger)"};">
                  ${e?"+":"-"}$${n.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Justification Notes -->
        <div style="font-size: 12px; color: var(--text-secondary); background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 24px;">
          <strong>Auditor Finding & Root Cause:</strong> ${t.reason||"Cycle count discrepancy"}. ${t.notes||""}
        </div>

        <!-- Dual Signature Blocks -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px;">
          <div>
            <div style="margin-bottom: 30px; color: var(--text-muted);">Auditor / Physical Count Verified By:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; padding-top: 4px; font-weight: 600; color: var(--text-main);">${t.user||"Stock Auditor"}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 30px; color: var(--text-muted);">Warehouse Manager Approval:</div>
            <div style="border-top: 1px solid #94a3b8; width: 80%; margin-left: auto; padding-top: 4px; font-weight: 600; color: var(--text-main);">Signature & Stamp</div>
          </div>
        </div>
      </div>
    `,primaryText:"Print Voucher",onPrimary:()=>{window.print()}})};window.handleAdjustmentSearch=function(o){W.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=ht())};window.handleAdjustmentLocationFilter=function(o){W.location=o;const t=document.getElementById("view-content");t&&(t.innerHTML=ht())};window.handleAdjustmentTypeFilter=function(o){W.type=o;const t=document.getElementById("view-content");t&&(t.innerHTML=ht())};window.exportAdjustmentCSV=function(){const o=N.filter(l=>l.type==="ADJUSTMENT_IN"||l.type==="ADJUSTMENT_OUT");if(o.length===0){window.showToast("No adjustment records to export.","info");return}const t=["Transaction_ID","Date","Type","Reference_No","SKU","Product_Name","Variance_Quantity","Unit_Cost","Financial_Impact","Location","Reason","Auditor","Notes"],e=o.map(l=>[l.id,`"${l.date}"`,l.type,`"${l.refNo}"`,`"${l.sku}"`,`"${(l.productName||"").replace(/"/g,'""')}"`,l.type==="ADJUSTMENT_IN"?l.quantity:-l.quantity,Number(l.unitCost||0).toFixed(2),Number(l.totalValue||l.quantity*(l.unitCost||0)).toFixed(2),`"${(l.location||"").replace(/"/g,'""')}"`,`"${(l.reason||"").replace(/"/g,'""')}"`,`"${(l.user||"").replace(/"/g,'""')}"`,`"${(l.notes||"").replace(/"/g,'""')}"`]),n="data:text/csv;charset=utf-8,"+[t.join(","),...e.map(l=>l.join(","))].join(`
`),a=encodeURI(n),i=document.createElement("a");i.setAttribute("href",a),i.setAttribute("download",`Stock_Adjustments_Audit_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(i),i.click(),document.body.removeChild(i),window.showToast("Adjustment audit records exported to CSV successfully.","success")};let at={search:"",status:"ALL"};function dt(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t={};T.forEach(s=>{s.status!=="ARCHIVED"&&s.supplier&&(t[s.supplier]||(t[s.supplier]={count:0,totalValue:0,products:[]}),t[s.supplier].count+=1,t[s.supplier].totalValue+=s.costPrice*s.currentStock,t[s.supplier].products.push(s))});const e=_.length,n=_.filter(s=>s.status==="ACTIVE").length;let a="None",i=0;Object.keys(t).forEach(s=>{t[s].count>i&&(i=t[s].count,a=s)});const l=Object.values(t).reduce((s,d)=>s+d.count,0),r=_.filter(s=>{const d=at.search.toLowerCase(),c=!d||s.name.toLowerCase().includes(d)||s.contactPerson&&s.contactPerson.toLowerCase().includes(d)||s.email&&s.email.toLowerCase().includes(d)||s.phone&&s.phone.toLowerCase().includes(d)||s.address&&s.address.toLowerCase().includes(d)||s.id&&s.id.toLowerCase().includes(d),p=at.status==="ALL"||s.status===at.status;return c&&p});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Supplier & Vendor Directory</h1>
        <p>Maintain authorized procurement partners, contact channels, lead times, and fulfillment agreements.</p>
      </div>
      <div class="page-actions">
        ${o?`
          <button class="btn btn-primary btn-sm" onclick="window.openAddSupplierModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Supplier
          </button>
        `:""}
      </div>
    </div>

    <!-- Supplier KPI Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Registered Vendors</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e}</div>
        <div class="kpi-footer">Approved procurement partners</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Suppliers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${n}</div>
        <div class="kpi-footer">Eligible for Purchase Orders & Stock In</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">SKUs Sourced</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${l}</div>
        <div class="kpi-footer">Products with assigned vendor</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Top Sourcing Partner</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 18px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${a}
        </div>
        <div class="kpi-footer">${i} catalog items supplied</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 300px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search vendor by name, contact, email, or city..." 
              value="${at.search}" 
              oninput="window.handleSupplierSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleSupplierStatusFilter(this.value)">
            <option value="ALL" ${at.status==="ALL"?"selected":""}>All Statuses</option>
            <option value="ACTIVE" ${at.status==="ACTIVE"?"selected":""}>Active</option>
            <option value="INACTIVE" ${at.status==="INACTIVE"?"selected":""}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${r.length}</strong> of ${_.length} suppliers
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Supplier / Company</th>
              <th>Primary Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Physical Address</th>
              <th style="text-align: right;">Sourced Items</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${r.length===0?`
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching suppliers found</div>
                    <div class="empty-state-desc">Try clearing your search query or add a new vendor.</div>
                  </div>
                </td>
              </tr>
            `:r.map(s=>{const d=t[s.name]||{count:0};return`
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 34px; height: 34px; border-radius: 6px; background: rgba(0, 87, 231, 0.08); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">
                        ${(s.name||"S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${s.name}</div>
                        <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${s.contactPerson||"N/A"}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Account Rep</div>
                  </td>
                  <td style="font-size: 13px;">
                    ${s.phone?`
                      <a href="tel:${s.phone}" style="color: var(--text-main); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: var(--text-light); fill: none;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                        ${s.phone}
                      </a>
                    `:'<span style="color: var(--text-light);">-</span>'}
                  </td>
                  <td style="font-size: 13px;">
                    ${s.email?`
                      <a href="mailto:${s.email}" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 500;">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: currentColor; fill: none;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                        ${s.email}
                      </a>
                    `:'<span style="color: var(--text-light);">-</span>'}
                  </td>
                  <td style="font-size: 12px; color: var(--text-secondary); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${s.address||""}">
                    ${s.address||'<span style="color: var(--text-light);">No address specified</span>'}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewSupplierProducts('${s.name}')" title="Filter catalog by ${s.name}">
                      <strong>${d.count}</strong> items
                    </button>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${s.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}">
                      ${s.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Supplier Profile & Catalog" onclick="window.viewSupplierDetails('${s.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </button>

                      ${o?`
                        <button class="btn btn-secondary btn-sm" title="Edit Supplier" onclick="window.openEditSupplierModal('${s.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleSupplierStatus('${s.id}')">
                          ${s.status==="ACTIVE"?"Deactivate":"Activate"}
                        </button>
                      `:""}
                    </div>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleSupplierSearch=function(o){at.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=dt())};window.handleSupplierStatusFilter=function(o){at.status=o;const t=document.getElementById("view-content");t&&(t.innerHTML=dt())};window.viewSupplierProducts=function(o){window.router.navigate("inventory"),setTimeout(()=>{window.handleInventorySearch(o)},50)};window.viewSupplierDetails=function(o){const t=_.find(i=>i.id===o);if(!t)return;const e=T.filter(i=>i.supplier===t.name||i.supplierId===t.id),n=e.reduce((i,l)=>i+l.costPrice*l.currentStock,0),a=e.reduce((i,l)=>i+l.currentStock,0);window.openModal({title:`Supplier Profile: ${t.name}`,body:`
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 87, 231, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${(t.name||"S").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${t.name}</h3>
            <div style="font-family: monospace; font-size: 12px; color: var(--text-light);">${t.id}</div>
          </div>
        </div>
        <span class="badge ${t.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}" style="font-size: 12px; padding: 4px 10px;">
          ${t.status}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: var(--bg-main); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Contact Person</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">${t.contactPerson||"Not specified"}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Phone Number</div>
          <div style="font-size: 14px; color: var(--text-main);">${t.phone||"Not provided"}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Email Address</div>
          <div style="font-size: 14px; color: var(--primary); font-weight: 500;">
            ${t.email?`<a href="mailto:${t.email}" style="color: var(--primary);">${t.email}</a>`:"Not provided"}
          </div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Physical Facility / Address</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${t.address||"Not provided"}</div>
        </div>
        <div style="grid-column: span 2;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Payment Terms & Notes</div>
          <div style="font-size: 13px; color: var(--text-secondary);">${t.notes||"Standard procurement agreement (Net 30)."}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main);">
          Supplied Catalog Products (${e.length})
        </h4>
        <div style="font-size: 12px; color: var(--text-muted);">
          Total Stock: <strong>${a.toLocaleString()} units</strong> | Holding Value: <strong style="color: var(--primary);">$${n.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
        <table class="data-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th style="text-align: right;">Cost Price</th>
              <th style="text-align: right;">Stock</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${e.length===0?`
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                  No catalog products are currently assigned to this vendor.
                </td>
              </tr>
            `:e.map(i=>`
              <tr>
                <td style="font-family: monospace; font-weight: 600; color: var(--primary);">${i.sku}</td>
                <td style="font-weight: 600;">${i.name}</td>
                <td><span class="badge badge-neutral" style="font-size: 11px;">${i.category}</span></td>
                <td style="text-align: right;">$${Number(i.costPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">${i.currentStock}</td>
                <td style="text-align: center;">
                  <span class="badge ${i.stockStatus==="IN STOCK"?"badge-in-stock":i.stockStatus==="LOW STOCK"?"badge-low-stock":"badge-out-of-stock"}" style="font-size: 10px;">
                    ${i.stockStatus}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `,primaryText:"Close",onPrimary:()=>window.closeModal()})};window.openAddSupplierModal=function(){window.openModal({title:"Register New Vendor / Supplier",body:`
      <form id="add-supplier-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewSupplier();">
        <div class="form-group col-span-2">
          <label class="form-label">Company / Supplier Name <span class="required-star">*</span></label>
          <input type="text" id="sup-new-name" class="form-input" placeholder="e.g. Apex Industrial Supplies" required />
          <div class="form-hint">Must be unique across authorized vendor directory</div>
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person <span class="required-star">*</span></label>
          <input type="text" id="sup-new-contact" class="form-input" placeholder="Representative full name" required />
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number <span class="required-star">*</span></label>
          <input type="tel" id="sup-new-phone" class="form-input" placeholder="+1 (555) 000-0000" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Email Address <span class="required-star">*</span></label>
          <input type="email" id="sup-new-email" class="form-input" placeholder="procurement@supplier.com" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address / Logistics Depot</label>
          <input type="text" id="sup-new-address" class="form-input" placeholder="Street, Building, City, State, ZIP" />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Procurement Terms & Notes</label>
          <textarea id="sup-new-notes" class="form-textarea" rows="2" placeholder="e.g. Net 30 payment terms, 5-day delivery lead time, MOQ: 50 units"></textarea>
        </div>
      </form>
    `,primaryText:"Save Supplier",onPrimary:()=>window.submitNewSupplier()})};window.submitNewSupplier=async function(){var d,c,p,u,w,x,f,h;const o=(d=document.getElementById("sup-new-name"))==null?void 0:d.value.trim(),t=(c=document.getElementById("sup-new-contact"))==null?void 0:c.value.trim(),e=(p=document.getElementById("sup-new-phone"))==null?void 0:p.value.trim(),n=(u=document.getElementById("sup-new-email"))==null?void 0:u.value.trim(),a=((w=document.getElementById("sup-new-address"))==null?void 0:w.value.trim())||"Not specified",i=((x=document.getElementById("sup-new-notes"))==null?void 0:x.value.trim())||"Standard Net 30 procurement terms.";if(!o||!t||!e||!n){window.showToast("Please fill in all mandatory supplier fields.","error");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)){window.showToast("Please enter a valid email address.","error");return}if(_.some(b=>b.name.toLowerCase()===o.toLowerCase())){window.showToast(`Error: Supplier "${o}" is already registered.`,"error");return}const r={id:`SUP-${Math.floor(100+Math.random()*900)}`,name:o,contactPerson:t,phone:e,email:n,address:a,notes:i,status:"ACTIVE"};if(S.isConfigured())try{window.showToast("Registering supplier in Google Sheets...","info"),await S.request("createSupplier",{method:"POST",data:r,token:v.getToken()})}catch(b){console.warn("API supplier registration failed, keeping in local memory:",b)}_.push(r),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((f=v.getUser())==null?void 0:f.userId)||"USR-001",username:((h=v.getUser())==null?void 0:h.username)||"admin",action:"CREATE_SUPPLIER",module:"Suppliers",recordId:r.id,description:`Registered new supplier "${o}" (${t})`}),window.closeModal(),window.showToast(`Supplier "${o}" registered successfully.`,"success");const s=document.getElementById("view-content");s&&(s.innerHTML=dt())};window.openEditSupplierModal=function(o){const t=_.find(e=>e.id===o);t&&window.openModal({title:`Edit Supplier: ${t.name}`,body:`
      <form id="edit-supplier-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditSupplier('${t.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Supplier / Company Name <span class="required-star">*</span></label>
          <input type="text" id="sup-edit-name" class="form-input" value="${t.name}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person <span class="required-star">*</span></label>
          <input type="text" id="sup-edit-contact" class="form-input" value="${t.contactPerson||""}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number <span class="required-star">*</span></label>
          <input type="tel" id="sup-edit-phone" class="form-input" value="${t.phone||""}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Email Address <span class="required-star">*</span></label>
          <input type="email" id="sup-edit-email" class="form-input" value="${t.email||""}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address</label>
          <input type="text" id="sup-edit-address" class="form-input" value="${t.address||""}" />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Payment Terms & Notes</label>
          <textarea id="sup-edit-notes" class="form-textarea" rows="2">${t.notes||""}</textarea>
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Status</label>
          <select id="sup-edit-status" class="form-select">
            <option value="ACTIVE" ${t.status==="ACTIVE"?"selected":""}>ACTIVE</option>
            <option value="INACTIVE" ${t.status==="INACTIVE"?"selected":""}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,primaryText:"Update Supplier",onPrimary:()=>window.submitEditSupplier(t.id)})};window.submitEditSupplier=async function(o){var p,u,w,x,f,h,b,I,L;const t=_.find($=>$.id===o);if(!t)return;const e=(p=document.getElementById("sup-edit-name"))==null?void 0:p.value.trim(),n=(u=document.getElementById("sup-edit-contact"))==null?void 0:u.value.trim(),a=(w=document.getElementById("sup-edit-phone"))==null?void 0:w.value.trim(),i=(x=document.getElementById("sup-edit-email"))==null?void 0:x.value.trim(),l=(f=document.getElementById("sup-edit-address"))==null?void 0:f.value.trim(),r=(h=document.getElementById("sup-edit-notes"))==null?void 0:h.value.trim(),s=(b=document.getElementById("sup-edit-status"))==null?void 0:b.value;if(!e||!n||!a||!i){window.showToast("Please fill all mandatory fields.","error");return}if(_.some($=>$.id!==o&&$.name.toLowerCase()===e.toLowerCase())){window.showToast(`Error: Another supplier is already named "${e}".`,"error");return}const d=t.name;if(t.name=e,t.contactPerson=n,t.phone=a,t.email=i,t.address=l,t.notes=r,t.status=s,d!==e&&T.forEach($=>{($.supplier===d||$.supplierId===o)&&($.supplier=e)}),S.isConfigured())try{await S.request("updateSupplier",{method:"POST",data:{id:o,name:e,contactPerson:n,phone:a,email:i,address:l,notes:r,status:s},token:v.getToken()})}catch($){console.warn("API updateSupplier failed:",$)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((I=v.getUser())==null?void 0:I.userId)||"USR-001",username:((L=v.getUser())==null?void 0:L.username)||"admin",action:"UPDATE_SUPPLIER",module:"Suppliers",recordId:o,description:`Updated supplier profile "${d}" -> "${e}"`}),window.closeModal(),window.showToast(`Supplier "${e}" updated successfully.`,"success");const c=document.getElementById("view-content");c&&(c.innerHTML=dt())};window.toggleSupplierStatus=async function(o){var a,i;const t=_.find(l=>l.id===o);if(!t)return;const e=t.status==="ACTIVE"?"INACTIVE":"ACTIVE";if(e==="INACTIVE"){const l=T.filter(r=>r.supplier===t.name&&r.status!=="ARCHIVED");if(l.length>0&&!confirm(`Warning: "${t.name}" currently supplies ${l.length} active catalog items. Deactivating will prevent new purchase receipts from this supplier. Do you wish to continue?`))return}if(t.status=e,S.isConfigured())try{await S.request("toggleSupplierStatus",{method:"POST",data:{id:o},token:v.getToken()})}catch(l){console.warn("API toggleSupplierStatus failed:",l)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((a=v.getUser())==null?void 0:a.userId)||"USR-001",username:((i=v.getUser())==null?void 0:i.username)||"admin",action:"TOGGLE_SUPPLIER_STATUS",module:"Suppliers",recordId:o,description:`Changed supplier "${t.name}" status to ${e}`}),window.showToast(`Supplier "${t.name}" is now ${e}.`,"info");const n=document.getElementById("view-content");n&&(n.innerHTML=dt())};let J={search:"",status:"ALL"};function ct(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t={};T.forEach(a=>{a.status!=="ARCHIVED"&&(t[a.category]=(t[a.category]||0)+1)});const e=H.filter(a=>{const i=!J.search||a.name.toLowerCase().includes(J.search.toLowerCase())||a.description&&a.description.toLowerCase().includes(J.search.toLowerCase())||a.id.toLowerCase().includes(J.search.toLowerCase()),l=J.status==="ALL"||a.status===J.status;return i&&l}),n=H.filter(a=>a.status==="ACTIVE").length;return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Product Categories Management</h1>
        <p>Organize inventory catalog into functional classifications, departments, and accounting groups.</p>
      </div>
      <div class="page-actions">
        ${o?`
          <button class="btn btn-primary btn-sm" onclick="window.openAddCategoryModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Category
          </button>
        `:""}
      </div>
    </div>

    <!-- Category KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Categories</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </div>
        </div>
        <div class="kpi-value">${H.length}</div>
        <div class="kpi-footer">Primary classification groups</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Categories</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${n}</div>
        <div class="kpi-footer">Available for catalog assignment</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Catalog SKUs Mapped</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${T.length}</div>
        <div class="kpi-footer">100% categorially classified</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search category by name or description..." 
              value="${J.search}" 
              oninput="window.handleCategorySearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleCategoryStatusFilter(this.value)">
            <option value="ALL" ${J.status==="ALL"?"selected":""}>All Statuses</option>
            <option value="ACTIVE" ${J.status==="ACTIVE"?"selected":""}>Active</option>
            <option value="INACTIVE" ${J.status==="INACTIVE"?"selected":""}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${e.length}</strong> categories
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Category Name</th>
              <th>Description / Scope</th>
              <th style="text-align: right;">Associated Products</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${e.length===0?`
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching categories found</div>
                    <div class="empty-state-desc">Try clearing your search query or add a new product category.</div>
                  </div>
                </td>
              </tr>
            `:e.map(a=>{const i=t[a.name]||0;return`
                <tr>
                  <td style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 13px;">
                    ${a.id}
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${a.name}</div>
                  </td>
                  <td style="font-size: 13px; color: var(--text-secondary); max-width: 320px;">
                    ${a.description||"No description provided."}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewCategoryProducts('${a.name}')" title="Filter catalog by this category">
                      <strong>${i}</strong> items
                    </button>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${a.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}">
                      ${a.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      ${o?`
                        <button class="btn btn-secondary btn-sm" title="Edit Category" onclick="window.openEditCategoryModal('${a.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleCategoryStatus('${a.id}')">
                          ${a.status==="ACTIVE"?"Deactivate":"Activate"}
                        </button>
                      `:`
                        <span style="font-size: 12px; color: var(--text-light);">View Only</span>
                      `}
                    </div>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleCategorySearch=function(o){J.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=ct())};window.handleCategoryStatusFilter=function(o){J.status=o;const t=document.getElementById("view-content");t&&(t.innerHTML=ct())};window.viewCategoryProducts=function(o){window.router.navigate("inventory"),setTimeout(()=>{window.handleInventoryFilter("category",o)},50)};window.openAddCategoryModal=function(){window.openModal({title:"Add New Product Category",body:`
      <form id="add-category-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewCategory();">
        <div class="form-group col-span-2">
          <label class="form-label">Category Name <span class="required-star">*</span></label>
          <input type="text" id="cat-new-name" class="form-input" placeholder="e.g. Electrical & Lighting" required />
          <div class="form-hint">Must be unique across all active categories</div>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description / Scope of Items</label>
          <textarea id="cat-new-desc" class="form-textarea" rows="3" placeholder="Explain the range of products classified under this category..."></textarea>
        </div>
      </form>
    `,primaryText:"Save Category",onPrimary:()=>window.submitNewCategory()})};window.submitNewCategory=async function(){var a,i,l,r;const o=(a=document.getElementById("cat-new-name"))==null?void 0:a.value.trim(),t=(i=document.getElementById("cat-new-desc"))==null?void 0:i.value.trim();if(!o){window.showToast("Category name is required.","error");return}if(H.some(s=>s.name.toLowerCase()===o.toLowerCase())){window.showToast(`Error: Category "${o}" already exists. Category names must be unique.`,"error");return}const e={id:`CAT-${Math.floor(100+Math.random()*900)}`,name:o,description:t,status:"ACTIVE"};if(S.isConfigured())try{window.showToast("Registering category in Google Sheets...","info"),await S.request("createCategory",{method:"POST",data:e,token:v.getToken()})}catch(s){console.warn("API category creation failed, continuing in memory:",s)}H.push(e),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((l=v.getUser())==null?void 0:l.userId)||"USR-001",username:((r=v.getUser())==null?void 0:r.username)||"admin",action:"CREATE_CATEGORY",module:"Categories",recordId:e.id,description:`Created product category "${o}"`}),window.closeModal(),window.showToast(`Category "${o}" created successfully.`,"success");const n=document.getElementById("view-content");n&&(n.innerHTML=ct())};window.openEditCategoryModal=function(o){const t=H.find(e=>e.id===o);t&&window.openModal({title:`Edit Category: ${t.name}`,body:`
      <form id="edit-category-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditCategory('${t.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Category Name <span class="required-star">*</span></label>
          <input type="text" id="cat-edit-name" class="form-input" value="${t.name}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description</label>
          <textarea id="cat-edit-desc" class="form-textarea" rows="3">${t.description||""}</textarea>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Status</label>
          <select id="cat-edit-status" class="form-select">
            <option value="ACTIVE" ${t.status==="ACTIVE"?"selected":""}>ACTIVE</option>
            <option value="INACTIVE" ${t.status==="INACTIVE"?"selected":""}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,primaryText:"Update Category",onPrimary:()=>window.submitEditCategory(t.id)})};window.submitEditCategory=function(o){var r,s,d,c,p;const t=H.find(u=>u.id===o);if(!t)return;const e=(r=document.getElementById("cat-edit-name"))==null?void 0:r.value.trim(),n=(s=document.getElementById("cat-edit-desc"))==null?void 0:s.value.trim(),a=(d=document.getElementById("cat-edit-status"))==null?void 0:d.value;if(!e){window.showToast("Category name cannot be empty.","error");return}if(H.some(u=>u.id!==o&&u.name.toLowerCase()===e.toLowerCase())){window.showToast(`Error: Another category is already named "${e}".`,"error");return}const i=t.name;t.name=e,t.description=n,t.status=a,i!==e&&T.forEach(u=>{u.category===i&&(u.category=e)}),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((c=v.getUser())==null?void 0:c.userId)||"USR-001",username:((p=v.getUser())==null?void 0:p.username)||"admin",action:"UPDATE_CATEGORY",module:"Categories",recordId:o,description:`Updated category "${i}" -> "${e}"`}),window.closeModal(),window.showToast(`Category "${e}" updated successfully.`,"success");const l=document.getElementById("view-content");l&&(l.innerHTML=ct())};window.toggleCategoryStatus=function(o){const t=H.find(n=>n.id===o);if(!t)return;t.status=t.status==="ACTIVE"?"INACTIVE":"ACTIVE",window.showToast(`Category "${t.name}" status set to ${t.status}.`,"info");const e=document.getElementById("view-content");e&&(e.innerHTML=ct())};let B={search:"",type:"ALL",status:"ALL"};function rt(){const o=v.hasRole("ADMIN","STOCK_MANAGER"),t={};T.forEach(r=>{r.status!=="ARCHIVED"&&r.location&&(t[r.location]||(t[r.location]={count:0,totalUnits:0,totalValue:0,products:[]}),t[r.location].count+=1,t[r.location].totalUnits+=r.currentStock||0,t[r.location].totalValue+=(r.costPrice||0)*(r.currentStock||0),t[r.location].products.push(r))});const e=E.length,n=E.filter(r=>r.status==="ACTIVE").length,a=Object.values(t).reduce((r,s)=>r+s.totalUnits,0),i=Object.values(t).reduce((r,s)=>r+s.totalValue,0),l=E.filter(r=>{const s=B.search.toLowerCase(),d=!s||r.name.toLowerCase().includes(s)||r.id.toLowerCase().includes(s)||r.type&&r.type.toLowerCase().includes(s)||r.manager&&r.manager.toLowerCase().includes(s)||r.address&&r.address.toLowerCase().includes(s),c=B.type==="ALL"||r.type===B.type,p=B.status==="ALL"||r.status===B.status;return d&&c&&p});return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Storage Locations & Warehouses</h1>
        <p>Manage central distribution depots, fulfillment hubs, retail store stock rooms, and regional facilities.</p>
      </div>
      <div class="page-actions">
        ${o?`
          <button class="btn btn-primary btn-sm" onclick="window.openAddLocationModal()">
            <svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Location
          </button>
        `:""}
      </div>
    </div>

    <!-- Location KPI Summary Row -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Facilities</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e}</div>
        <div class="kpi-footer">Registered warehouses & outlets</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Active Depots</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div class="kpi-value">${n}</div>
        <div class="kpi-footer">Operational storage destinations</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Units Stored</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${a.toLocaleString()}</div>
        <div class="kpi-footer">Physical items across all nodes</div>
      </div>

      <div class="kpi-card kpi-purple">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Holding Value</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0013 8h-2a2 2 0 100 4h2a2 2 0 110 4h-2a2 2 0 01-1.8-1"/><path d="M12 6v2m0 8v2"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="font-size: 20px;">
          $${i.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div class="kpi-footer">Cumulative at-cost valuation</div>
      </div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="filter-left">
          <div class="filter-search-box" style="min-width: 280px;">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search location by name, manager, or address..." 
              value="${B.search}" 
              oninput="window.handleLocationSearch(this.value)" 
            />
          </div>

          <select class="select-filter" onchange="window.handleLocationTypeFilter(this.value)">
            <option value="ALL" ${B.type==="ALL"?"selected":""}>All Types</option>
            <option value="Central Storage" ${B.type==="Central Storage"?"selected":""}>Central Storage</option>
            <option value="Corporate Store" ${B.type==="Corporate Store"?"selected":""}>Corporate Store</option>
            <option value="Retail Outlet" ${B.type==="Retail Outlet"?"selected":""}>Retail Outlet</option>
            <option value="Fulfillment Hub" ${B.type==="Fulfillment Hub"?"selected":""}>Fulfillment Hub</option>
            <option value="Quarantine / QC Bay" ${B.type==="Quarantine / QC Bay"?"selected":""}>Quarantine / QC Bay</option>
          </select>

          <select class="select-filter" onchange="window.handleLocationStatusFilter(this.value)">
            <option value="ALL" ${B.status==="ALL"?"selected":""}>All Statuses</option>
            <option value="ACTIVE" ${B.status==="ACTIVE"?"selected":""}>Active</option>
            <option value="INACTIVE" ${B.status==="INACTIVE"?"selected":""}>Inactive</option>
          </select>
        </div>

        <div style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
          Showing <strong>${l.length}</strong> of ${E.length} facilities
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Facility Name</th>
              <th>Type</th>
              <th>Address / Premises</th>
              <th>Facility Manager</th>
              <th style="text-align: right;">Inventory Held</th>
              <th style="text-align: right;">Holding Value</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${l.length===0?`
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <div class="empty-state-icon">
                      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: currentColor; fill: none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <div class="empty-state-title">No matching locations found</div>
                    <div class="empty-state-desc">Try clearing search filters or add a new facility.</div>
                  </div>
                </td>
              </tr>
            `:l.map(r=>{const s=t[r.name]||{count:0,totalUnits:0,totalValue:0};return`
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${r.name}</div>
                    <div style="font-family: monospace; font-size: 11px; color: var(--text-light);">${r.id}</div>
                  </td>
                  <td>
                    <span class="badge badge-neutral" style="font-weight: 600;">
                      ${r.type}
                    </span>
                  </td>
                  <td style="font-size: 12.5px; color: var(--text-secondary); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.address||""}">
                    ${r.address||'<span style="color: var(--text-light);">No address specified</span>'}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${r.manager}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Site Supervisor</div>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewLocationProducts('${r.name}')" title="Filter catalog by ${r.name}">
                      <strong>${s.count}</strong> SKUs <span style="color: var(--text-muted);">(${s.totalUnits} pcs)</span>
                    </button>
                  </td>
                  <td style="text-align: right; font-weight: 700; color: var(--primary);">
                    $${s.totalValue.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${r.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}">
                      ${r.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                      <button class="btn btn-secondary btn-sm" title="View Location Profile & Stock" onclick="window.viewLocationDetails('${r.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </button>

                      ${o?`
                        <button class="btn btn-secondary btn-sm" title="Edit Location" onclick="window.openEditLocationModal('${r.id}')">
                          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Toggle Active / Inactive" onclick="window.toggleLocationStatus('${r.id}')">
                          ${r.status==="ACTIVE"?"Deactivate":"Activate"}
                        </button>
                      `:""}
                    </div>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.handleLocationSearch=function(o){B.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=rt())};window.handleLocationTypeFilter=function(o){B.type=o;const t=document.getElementById("view-content");t&&(t.innerHTML=rt())};window.handleLocationStatusFilter=function(o){B.status=o;const t=document.getElementById("view-content");t&&(t.innerHTML=rt())};window.viewLocationProducts=function(o){window.router.navigate("inventory"),setTimeout(()=>{window.handleInventoryFilter("location",o)},50)};window.viewLocationDetails=function(o){const t=E.find(i=>i.id===o);if(!t)return;const e=T.filter(i=>i.location===t.name||i.locationId===t.id),n=e.reduce((i,l)=>i+(l.currentStock||0),0),a=e.reduce((i,l)=>i+(l.costPrice||0)*(l.currentStock||0),0);window.openModal({title:`Facility Dossier: ${t.name}`,body:`
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(0, 87, 231, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">
            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2;"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main);">${t.name}</h3>
            <div style="font-family: monospace; font-size: 12px; color: var(--text-light);">${t.id} | ${t.type}</div>
          </div>
        </div>
        <span class="badge ${t.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}" style="font-size: 12px; padding: 4px 10px;">
          ${t.status}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; background: var(--bg-main); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Warehouse Manager</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">${t.manager}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Facility Classification</div>
          <div style="font-size: 14px; color: var(--text-main); font-weight: 500;">${t.type}</div>
        </div>
        <div style="grid-column: span 2;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">Physical Address</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${t.address||"Not specified"}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main);">
          Stored Products Inventory (${e.length})
        </h4>
        <div style="font-size: 12px; color: var(--text-muted);">
          Total Stock: <strong>${n.toLocaleString()} units</strong> | Holding Value: <strong style="color: var(--primary);">$${a.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
        <table class="data-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th style="text-align: right;">Unit Cost</th>
              <th style="text-align: right;">Stock Balance</th>
              <th style="text-align: right;">Total Value</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${e.length===0?`
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">
                  No products are currently assigned to this storage facility.
                </td>
              </tr>
            `:e.map(i=>`
              <tr>
                <td style="font-family: monospace; font-weight: 600; color: var(--primary);">${i.sku}</td>
                <td style="font-weight: 600;">${i.name}</td>
                <td><span class="badge badge-neutral" style="font-size: 11px;">${i.category}</span></td>
                <td style="text-align: right;">$${Number(i.costPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">${i.currentStock}</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">
                  $${(i.costPrice*i.currentStock).toFixed(2)}
                </td>
                <td style="text-align: center;">
                  <span class="badge ${i.stockStatus==="IN STOCK"?"badge-in-stock":i.stockStatus==="LOW STOCK"?"badge-low-stock":"badge-out-of-stock"}" style="font-size: 10px;">
                    ${i.stockStatus}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `,primaryText:"Close",onPrimary:()=>window.closeModal()})};window.openAddLocationModal=function(){window.openModal({title:"Register New Storage Location",body:`
      <form id="add-location-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewLocation();">
        <div class="form-group col-span-2">
          <label class="form-label">Location / Warehouse Name <span class="required-star">*</span></label>
          <input type="text" id="loc-new-name" class="form-input" placeholder="e.g. Distribution Center South" required />
          <div class="form-hint">Must be unique across facility network</div>
        </div>

        <div class="form-group">
          <label class="form-label">Facility Classification <span class="required-star">*</span></label>
          <select id="loc-new-type" class="form-select">
            <option value="Central Storage">Central Storage</option>
            <option value="Corporate Store">Corporate Store</option>
            <option value="Retail Outlet">Retail Outlet</option>
            <option value="Fulfillment Hub">Fulfillment Hub</option>
            <option value="Quarantine / QC Bay">Quarantine / QC Bay</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Site Manager <span class="required-star">*</span></label>
          <input type="text" id="loc-new-mgr" class="form-input" placeholder="Manager in Charge" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address / Gate Location <span class="required-star">*</span></label>
          <input type="text" id="loc-new-address" class="form-input" placeholder="Plot / Building / Street / City" required />
        </div>
      </form>
    `,primaryText:"Save Location",onPrimary:()=>window.submitNewLocation()})};window.submitNewLocation=async function(){var l,r,s,d,c,p;const o=(l=document.getElementById("loc-new-name"))==null?void 0:l.value.trim(),t=(r=document.getElementById("loc-new-type"))==null?void 0:r.value,e=(s=document.getElementById("loc-new-mgr"))==null?void 0:s.value.trim(),n=(d=document.getElementById("loc-new-address"))==null?void 0:d.value.trim();if(!o||!e||!n){window.showToast("Please fill all mandatory location fields.","error");return}if(E.some(u=>u.name.toLowerCase()===o.toLowerCase())){window.showToast(`Error: Location "${o}" already exists.`,"error");return}const a={id:`LOC-${Math.floor(100+Math.random()*900)}`,name:o,type:t,address:n,manager:e,status:"ACTIVE"};if(S.isConfigured())try{window.showToast("Registering facility in Google Sheets...","info"),await S.request("createLocation",{method:"POST",data:a,token:v.getToken()})}catch(u){console.warn("API createLocation failed:",u)}E.push(a),P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((c=v.getUser())==null?void 0:c.userId)||"USR-001",username:((p=v.getUser())==null?void 0:p.username)||"admin",action:"CREATE_LOCATION",module:"Locations",recordId:a.id,description:`Added facility "${o}" (${t}, Manager: ${e})`}),window.closeModal(),window.showToast(`Storage location "${o}" registered successfully.`,"success");const i=document.getElementById("view-content");i&&(i.innerHTML=rt())};window.openEditLocationModal=function(o){const t=E.find(e=>e.id===o);t&&window.openModal({title:`Edit Facility: ${t.name}`,body:`
      <form id="edit-location-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditLocation('${t.id}');">
        <div class="form-group col-span-2">
          <label class="form-label">Location / Warehouse Name <span class="required-star">*</span></label>
          <input type="text" id="loc-edit-name" class="form-input" value="${t.name}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Facility Classification <span class="required-star">*</span></label>
          <select id="loc-edit-type" class="form-select">
            <option value="Central Storage" ${t.type==="Central Storage"?"selected":""}>Central Storage</option>
            <option value="Corporate Store" ${t.type==="Corporate Store"?"selected":""}>Corporate Store</option>
            <option value="Retail Outlet" ${t.type==="Retail Outlet"?"selected":""}>Retail Outlet</option>
            <option value="Fulfillment Hub" ${t.type==="Fulfillment Hub"?"selected":""}>Fulfillment Hub</option>
            <option value="Quarantine / QC Bay" ${t.type==="Quarantine / QC Bay"?"selected":""}>Quarantine / QC Bay</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Site Manager <span class="required-star">*</span></label>
          <input type="text" id="loc-edit-mgr" class="form-input" value="${t.manager}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Physical Address</label>
          <input type="text" id="loc-edit-address" class="form-input" value="${t.address||""}" required />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label">Operational Status</label>
          <select id="loc-edit-status" class="form-select">
            <option value="ACTIVE" ${t.status==="ACTIVE"?"selected":""}>ACTIVE</option>
            <option value="INACTIVE" ${t.status==="INACTIVE"?"selected":""}>INACTIVE</option>
          </select>
        </div>
      </form>
    `,primaryText:"Update Location",onPrimary:()=>window.submitEditLocation(t.id)})};window.submitEditLocation=async function(o){var d,c,p,u,w,x,f;const t=E.find(h=>h.id===o);if(!t)return;const e=(d=document.getElementById("loc-edit-name"))==null?void 0:d.value.trim(),n=(c=document.getElementById("loc-edit-type"))==null?void 0:c.value,a=(p=document.getElementById("loc-edit-mgr"))==null?void 0:p.value.trim(),i=(u=document.getElementById("loc-edit-address"))==null?void 0:u.value.trim(),l=(w=document.getElementById("loc-edit-status"))==null?void 0:w.value;if(!e||!a||!i){window.showToast("Please fill all mandatory fields.","error");return}if(E.some(h=>h.id!==o&&h.name.toLowerCase()===e.toLowerCase())){window.showToast(`Error: Another location is already named "${e}".`,"error");return}const r=t.name;if(t.name=e,t.type=n,t.manager=a,t.address=i,t.status=l,r!==e&&T.forEach(h=>{(h.location===r||h.locationId===o)&&(h.location=e)}),S.isConfigured())try{await S.request("updateLocation",{method:"POST",data:{id:o,name:e,type:n,manager:a,address:i,status:l},token:v.getToken()})}catch(h){console.warn("API updateLocation failed:",h)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((x=v.getUser())==null?void 0:x.userId)||"USR-001",username:((f=v.getUser())==null?void 0:f.username)||"admin",action:"UPDATE_LOCATION",module:"Locations",recordId:o,description:`Updated facility profile "${r}" -> "${e}"`}),window.closeModal(),window.showToast(`Facility "${e}" updated successfully.`,"success");const s=document.getElementById("view-content");s&&(s.innerHTML=rt())};window.toggleLocationStatus=async function(o){var a,i;const t=E.find(l=>l.id===o);if(!t)return;const e=t.status==="ACTIVE"?"INACTIVE":"ACTIVE";if(e==="INACTIVE"){const l=T.filter(r=>(r.location===t.name||r.locationId===o)&&r.currentStock>0);if(l.length>0&&!confirm(`Warning: "${t.name}" currently holds physical stock for ${l.length} items. Deactivating will prevent new stock-in or receipts into this facility. Do you wish to continue?`))return}if(t.status=e,S.isConfigured())try{await S.request("toggleLocationStatus",{method:"POST",data:{id:o},token:v.getToken()})}catch(l){console.warn("API toggleLocationStatus failed:",l)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((a=v.getUser())==null?void 0:a.userId)||"USR-001",username:((i=v.getUser())==null?void 0:i.username)||"admin",action:"TOGGLE_LOCATION_STATUS",module:"Locations",recordId:o,description:`Changed facility "${t.name}" status to ${e}`}),window.showToast(`Facility "${t.name}" is now ${e}.`,"info");const n=document.getElementById("view-content");n&&(n.innerHTML=rt())};let R="VALUATION_REPORT",g={search:"",dateFrom:"",dateTo:new Date().toISOString().slice(0,10),category:"ALL",location:"ALL",supplier:"ALL",stockStatus:"ALL",movementType:"ALL",urgency:"ALL"};const Ct=new Date(Date.now()-720*60*60*1e3);g.dateFrom=Ct.toISOString().slice(0,10);function xt(){var e,n;const o=new Date().toISOString().slice(0,10);return`
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>Corporate Reports & Analytics</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 14 Active</span>
        </div>
        <p>Audit-grade inventory valuation, movement ledgers, replenishment schedules, and vendor analytics.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.printReport()" title="Print current report view">
          <svg viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Report
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.exportActiveReportCSV()" title="Export clean structured CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Report Type Tab Navigation -->
    <div class="card report-tab-bar" style="margin-bottom: 20px; padding: 6px; background: var(--surface);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${[{id:"VALUATION_REPORT",name:"Stock Valuation",icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{id:"MOVEMENT_LEDGER",name:"Movement Ledger",icon:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"},{id:"REORDER_REPORT",name:"Low Stock Reorder Plan",icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"},{id:"SUPPLIER_REPORT",name:"Supplier Procurement",icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},{id:"CURRENT_INVENTORY",name:"Master Stock Balances",icon:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"}].map(a=>{const i=R===a.id;return`
            <button 
              class="btn ${i?"btn-primary":"btn-secondary"} btn-sm" 
              onclick="window.switchReportTab('${a.id}')"
              style="padding: 8px 16px; border-radius: var(--radius-md); font-weight: ${i?"700":"500"};"
            >
              <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2;"><path d="${a.icon}"/></svg>
              ${a.name}
            </button>
          `}).join("")}
      </div>
    </div>

    <!-- Active Report Summary KPIs & Filter Card -->
    ${Pt()}

    <!-- Printable Report Card Container -->
    <div class="card" id="printable-report-area">
      <!-- Print Only Header -->
      <div class="print-only-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Apex Stock Management System</h1>
            <h2 style="font-size: 15px; font-weight: 600; color: #0057E7;">${ft(R)}</h2>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Generated: <strong>${o}</strong></div>
            <div>Auditor: <strong>${((e=v.getUser())==null?void 0:e.fullName)||"System User"}</strong> [${((n=v.getUser())==null?void 0:n.role)||"VIEWER"}]</div>
          </div>
        </div>
      </div>

      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/></svg>
          ${ft(R)}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge badge-neutral" style="font-size: 11px;">As of ${o}</span>
        </div>
      </div>

      <div class="table-responsive">
        ${Dt()}
      </div>
    </div>
  `}function ft(o){switch(o){case"VALUATION_REPORT":return"Comprehensive Inventory Valuation Report";case"MOVEMENT_LEDGER":return"Stock Movement & Transaction Ledger";case"REORDER_REPORT":return"Low Stock & Replenishment Reorder Schedule";case"SUPPLIER_REPORT":return"Supplier Procurement & Fulfillment Performance";case"CURRENT_INVENTORY":return"Master Catalog & Physical Stock Balances";default:return"Inventory Analytical Report"}}function Pt(){if(R==="VALUATION_REPORT"){const o=vt(),t=o.reduce((l,r)=>l+(r.currentStock||0),0),e=o.reduce((l,r)=>l+(r.currentStock||0)*(r.costPrice||0),0),n=o.reduce((l,r)=>l+(r.currentStock||0)*(r.sellingPrice||0),0),a=n-e,i=n>0?a/n*100:0;return`
      <!-- Valuation KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Catalog Items</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div></div>
          <div class="kpi-value">${o.length}</div>
          <div class="kpi-footer">Filtered lines</div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Physical Units</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></div></div>
          <div class="kpi-value">${t.toLocaleString()}</div>
          <div class="kpi-footer">Total inventory on hand</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Total Cost Value (FIFO)</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${e.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          <div class="kpi-footer"><span class="kpi-trend positive">Asset valuation</span></div>
        </div>
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Total Retail Valuation</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div></div>
          <div class="kpi-value">$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          <div class="kpi-footer">Potential turnover value</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Unrealized Margin</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div></div>
          <div class="kpi-value">${i.toFixed(1)}%</div>
          <div class="kpi-footer">Profit: <strong>$${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
        </div>
      </div>

      <!-- Valuation Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Product / SKU / Barcode</label>
              <input type="text" class="form-input" placeholder="Search by name, SKU..." value="${g.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Category</label>
              <select class="form-select" onchange="window.setReportFilter('category', this.value)">
                <option value="ALL" ${g.category==="ALL"?"selected":""}>All Categories</option>
                ${H.map(l=>`<option value="${l.name}" ${g.category===l.name?"selected":""}>${l.name}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Location</label>
              <select class="form-select" onchange="window.setReportFilter('location', this.value)">
                <option value="ALL" ${g.location==="ALL"?"selected":""}>All Locations</option>
                ${E.map(l=>`<option value="${l.name}" ${g.location===l.name?"selected":""}>${l.name}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Stock Status</label>
              <select class="form-select" onchange="window.setReportFilter('stockStatus', this.value)">
                <option value="ALL" ${g.stockStatus==="ALL"?"selected":""}>All Statuses</option>
                <option value="IN STOCK" ${g.stockStatus==="IN STOCK"?"selected":""}>In Stock</option>
                <option value="LOW STOCK" ${g.stockStatus==="LOW STOCK"?"selected":""}>Low Stock</option>
                <option value="OUT OF STOCK" ${g.stockStatus==="OUT OF STOCK"?"selected":""}>Out of Stock</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `}if(R==="MOVEMENT_LEDGER"){const o=St(),t=o.filter(r=>r.type==="STOCK_IN"||r.type==="ADJUSTMENT_IN"),e=o.filter(r=>r.type==="STOCK_OUT"||r.type==="ADJUSTMENT_OUT"),n=t.reduce((r,s)=>r+(s.quantity||0),0),a=t.reduce((r,s)=>r+(s.totalValue||(s.quantity||0)*(s.unitCost||0)),0),i=e.reduce((r,s)=>r+(s.quantity||0),0),l=e.reduce((r,s)=>r+(s.totalValue||(s.quantity||0)*(s.unitCost||0)),0);return`
      <!-- Ledger KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Transactions</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div></div>
          <div class="kpi-value">${o.length}</div>
          <div class="kpi-footer">In selected timeframe</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Inbound Receipts</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg></div></div>
          <div class="kpi-value">+${n.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
          <div class="kpi-footer">Valued at <strong>$${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-card-header"><span class="kpi-title">Outbound Dispatches</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg></div></div>
          <div class="kpi-value">-${i.toLocaleString()} <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">units</span></div>
          <div class="kpi-footer">Valued at <strong>$${l.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Net Volume Delta</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg></div></div>
          <div class="kpi-value" style="color: ${n>=i?"var(--success-text)":"var(--danger-text)"};">
            ${n>=i?"+":""}${(n-i).toLocaleString()}
          </div>
          <div class="kpi-footer">Net balance change</div>
        </div>
      </div>

      <!-- Ledger Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Ref / Product / User</label>
              <input type="text" class="form-input" placeholder="Search ref #, name..." value="${g.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Date From</label>
              <input type="date" class="form-input" value="${g.dateFrom}" onchange="window.setReportFilter('dateFrom', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Date To</label>
              <input type="date" class="form-input" value="${g.dateTo}" onchange="window.setReportFilter('dateTo', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Movement Type</label>
              <select class="form-select" onchange="window.setReportFilter('movementType', this.value)">
                <option value="ALL" ${g.movementType==="ALL"?"selected":""}>All Types</option>
                <option value="STOCK_IN" ${g.movementType==="STOCK_IN"?"selected":""}>Stock In</option>
                <option value="STOCK_OUT" ${g.movementType==="STOCK_OUT"?"selected":""}>Stock Out</option>
                <option value="ADJUSTMENT_IN" ${g.movementType==="ADJUSTMENT_IN"?"selected":""}>Adjustment In</option>
                <option value="ADJUSTMENT_OUT" ${g.movementType==="ADJUSTMENT_OUT"?"selected":""}>Adjustment Out</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Facility</label>
              <select class="form-select" onchange="window.setReportFilter('location', this.value)">
                <option value="ALL" ${g.location==="ALL"?"selected":""}>All Facilities</option>
                ${E.map(r=>`<option value="${r.name}" ${g.location===r.name?"selected":""}>${r.name}</option>`).join("")}
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `}if(R==="REORDER_REPORT"){const o=kt(),t=o.filter(a=>a.currentStock===0),e=o.filter(a=>a.currentStock>0),n=o.reduce((a,i)=>{const l=Math.max(0,(i.maxStock||i.minStock*2)-i.currentStock);return a+l*(i.costPrice||0)},0);return`
      <!-- Reorder KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-amber">
          <div class="kpi-card-header"><span class="kpi-title">Critical Lines</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div></div>
          <div class="kpi-value">${o.length}</div>
          <div class="kpi-footer">Require procurement attention</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-card-header"><span class="kpi-title">Completely Depleted</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></div></div>
          <div class="kpi-value">${t.length}</div>
          <div class="kpi-footer"><span class="kpi-trend negative">Zero stock available</span></div>
        </div>
        <div class="kpi-card kpi-amber">
          <div class="kpi-card-header"><span class="kpi-title">Low Stock Warnings</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">${e.length}</div>
          <div class="kpi-footer">At or below minimum limit</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Restock Capital Required</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          <div class="kpi-footer">To reach maximum stock capacity</div>
        </div>
      </div>

      <!-- Reorder Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Product / SKU</label>
              <input type="text" class="form-input" placeholder="Search product..." value="${g.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Depletion Severity</label>
              <select class="form-select" onchange="window.setReportFilter('urgency', this.value)">
                <option value="ALL" ${g.urgency==="ALL"?"selected":""}>All Critical (0 & Low)</option>
                <option value="DEPLETED" ${g.urgency==="DEPLETED"?"selected":""}>Out of Stock Only (0)</option>
                <option value="LOW" ${g.urgency==="LOW"?"selected":""}>Low Stock Only (&gt; 0)</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Category</label>
              <select class="form-select" onchange="window.setReportFilter('category', this.value)">
                <option value="ALL" ${g.category==="ALL"?"selected":""}>All Categories</option>
                ${H.map(a=>`<option value="${a.name}" ${g.category===a.name?"selected":""}>${a.name}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Supplier</label>
              <select class="form-select" onchange="window.setReportFilter('supplier', this.value)">
                <option value="ALL" ${g.supplier==="ALL"?"selected":""}>All Suppliers</option>
                ${_.map(a=>`<option value="${a.name}" ${g.supplier===a.name?"selected":""}>${a.name}</option>`).join("")}
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `}if(R==="SUPPLIER_REPORT"){const o=$t(),t=o.reduce((a,i)=>a+i.totalSpend,0),e=o.reduce((a,i)=>a+i.totalUnits,0),n=o.reduce((a,i)=>a+i.totalShipments,0);return`
      <!-- Supplier KPIs -->
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        <div class="kpi-card kpi-blue">
          <div class="kpi-card-header"><span class="kpi-title">Active Suppliers</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div></div>
          <div class="kpi-value">${o.length}</div>
          <div class="kpi-footer">Approved vendors</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-card-header"><span class="kpi-title">Total Procurement Spend</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
          <div class="kpi-value">$${t.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          <div class="kpi-footer">Across all delivered POs</div>
        </div>
        <div class="kpi-card kpi-cyan">
          <div class="kpi-card-header"><span class="kpi-title">Total Units Procured</span><div class="kpi-icon-wrap"><svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div></div>
          <div class="kpi-value">${e.toLocaleString()}</div>
          <div class="kpi-footer">${n} total shipments received</div>
        </div>
      </div>

      <!-- Supplier Filter Bar -->
      <div class="card report-filter-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Search Supplier Name / Contact Person</label>
              <input type="text" class="form-input" placeholder="Search vendor..." value="${g.search}" oninput="window.setReportFilter('search', this.value)" />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px;">Status</label>
              <select class="form-select" onchange="window.setReportFilter('supplierStatus', this.value)">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE" selected>Active Vendors</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
          </div>
        </div>
      </div>
    `}return`
    <div class="card report-filter-card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search Product / SKU</label>
            <input type="text" class="form-input" placeholder="Search..." value="${g.search}" oninput="window.setReportFilter('search', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Category</label>
            <select class="form-select" onchange="window.setReportFilter('category', this.value)">
              <option value="ALL">All Categories</option>
              ${H.map(o=>`<option value="${o.name}">${o.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Location</label>
            <select class="form-select" onchange="window.setReportFilter('location', this.value)">
              <option value="ALL">All Locations</option>
              ${E.map(o=>`<option value="${o.name}">${o.name}</option>`).join("")}
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetReportFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>
  `}function vt(){return T.filter(o=>{if(o.status==="ARCHIVED")return!1;const t=g.search.toLowerCase(),e=!t||o.name.toLowerCase().includes(t)||o.sku.toLowerCase().includes(t)||o.barcode&&o.barcode.includes(t),n=g.category==="ALL"||o.category===g.category,a=g.location==="ALL"||o.location===g.location||o.locationId===g.location,i=g.stockStatus==="ALL"||o.stockStatus===g.stockStatus;return e&&n&&a&&i})}function St(){return N.filter(o=>{const t=g.search.toLowerCase(),e=!t||o.refNo&&o.refNo.toLowerCase().includes(t)||o.productName&&o.productName.toLowerCase().includes(t)||o.sku&&o.sku.toLowerCase().includes(t)||o.user&&o.user.toLowerCase().includes(t),n=String(o.date||"").slice(0,10),a=!g.dateFrom||n>=g.dateFrom,i=!g.dateTo||n<=g.dateTo,l=g.movementType==="ALL"||o.type===g.movementType,r=g.location==="ALL"||o.location===g.location;return e&&a&&i&&l&&r})}function kt(){return T.filter(o=>{if(o.status==="ARCHIVED"||o.currentStock>o.minStock)return!1;const t=g.search.toLowerCase(),e=!t||o.name.toLowerCase().includes(t)||o.sku.toLowerCase().includes(t),n=g.category==="ALL"||o.category===g.category,a=g.supplier==="ALL"||o.supplier===g.supplier;let i=!0;return g.urgency==="DEPLETED"?i=o.currentStock===0:g.urgency==="LOW"&&(i=o.currentStock>0),e&&n&&a&&i}).sort((o,t)=>{if(o.currentStock===0&&t.currentStock!==0)return-1;if(t.currentStock===0&&o.currentStock!==0)return 1;const e=o.minStock>0?o.currentStock/o.minStock:0,n=t.minStock>0?t.currentStock/t.minStock:0;return e-n})}function $t(){const o=N.filter(e=>e.type==="STOCK_IN"),t=g.search.toLowerCase();return _.filter(e=>{const n=!t||e.name.toLowerCase().includes(t)||e.contactPerson&&e.contactPerson.toLowerCase().includes(t),a=!g.supplierStatus||g.supplierStatus==="ALL"||e.status===g.supplierStatus;return n&&a}).map(e=>{const n=o.filter(d=>d.supplier===e.name),a=T.filter(d=>d.supplier===e.name&&d.status!=="ARCHIVED");let i=0,l=0,r="-";n.forEach(d=>{const c=Number(d.quantity)||0,p=Number(d.totalValue||c*(d.unitCost||0))||0;i+=c,l+=p,(!r||String(d.date)>r)&&(r=String(d.date).slice(0,10))});const s=n.length>0?l/n.length:0;return{id:e.id,name:e.name,contactPerson:e.contactPerson||"-",phone:e.phone||"-",email:e.email||"-",status:e.status||"ACTIVE",activeLines:a.length,totalShipments:n.length,totalUnits:i,totalSpend:l,avgOrderValue:s,lastDeliveryDate:r}}).sort((e,n)=>n.totalSpend-e.totalSpend)}function Dt(){if(R==="VALUATION_REPORT"){const t=vt(),e=t.reduce((r,s)=>r+(s.currentStock||0),0),n=t.reduce((r,s)=>r+(s.currentStock||0)*(s.costPrice||0),0),a=t.reduce((r,s)=>r+(s.currentStock||0)*(s.sellingPrice||0),0),i=a-n,l=a>0?i/a*100:0;return`
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Location</th>
            <th style="text-align: right;">Stock Count</th>
            <th style="text-align: right;">Unit Cost</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Cost Valuation</th>
            <th style="text-align: right;">Retail Valuation</th>
            <th style="text-align: right;">Margin %</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${t.length===0?`
            <tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 32px;">No products match current criteria.</td></tr>
          `:t.map(r=>{const s=(r.currentStock||0)*(r.costPrice||0),d=(r.currentStock||0)*(r.sellingPrice||0),c=d-s,p=d>0?c/d*100:0;return`
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${r.sku}</td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main);">${r.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${r.supplier||""}</div>
                </td>
                <td><span class="badge badge-neutral">${r.category}</span></td>
                <td style="font-size: 12px; color: var(--text-muted);">${r.location||"Central"}</td>
                <td style="text-align: right; font-weight: 700;">${r.currentStock} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">${r.unit}</span></td>
                <td style="text-align: right;">$${(r.costPrice||0).toFixed(2)}</td>
                <td style="text-align: right; color: var(--text-muted);">$${(r.sellingPrice||0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${s.toFixed(2)}</td>
                <td style="text-align: right; color: var(--text-muted);">$${d.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 600; color: var(--success);">${p.toFixed(1)}%</td>
                <td style="text-align: center;">
                  <span class="badge ${r.currentStock===0?"badge-out-of-stock":r.currentStock<=r.minStock?"badge-low-stock":"badge-in-stock"}">
                    ${r.stockStatus}
                  </span>
                </td>
              </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="4" style="text-align: right; padding: 14px 16px;">Consolidated Portfolio Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">${e.toLocaleString()} units</td>
            <td colspan="2"></td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 14px;">
              $${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td style="text-align: right; padding: 14px 16px; color: var(--text-main); font-size: 14px;">
              $${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td style="text-align: right; padding: 14px 16px; color: var(--success); font-size: 14px;">
              ${l.toFixed(1)}%
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `}if(R==="MOVEMENT_LEDGER"){const t=St(),e=t.filter(i=>i.type==="STOCK_IN"||i.type==="ADJUSTMENT_IN").reduce((i,l)=>i+(l.quantity||0),0),n=t.filter(i=>i.type==="STOCK_OUT"||i.type==="ADJUSTMENT_OUT").reduce((i,l)=>i+(l.quantity||0),0),a=t.reduce((i,l)=>i+(l.totalValue||(l.quantity||0)*(l.unitCost||0)),0);return`
      <table class="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Ref No</th>
            <th>Type</th>
            <th>Product Name / SKU</th>
            <th>Location</th>
            <th>Counterparty</th>
            <th style="text-align: right;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total Value</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          ${t.length===0?`
            <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px;">No transactions recorded within selected date and filter range.</td></tr>
          `:t.map(i=>{const l=i.type==="STOCK_IN"||i.type==="ADJUSTMENT_IN";return`
              <tr>
                <td style="font-size: 12px; color: var(--text-muted);">${i.date}</td>
                <td style="font-weight: 700; font-family: monospace;">${i.refNo}</td>
                <td>
                  <span class="badge ${i.type==="STOCK_IN"?"badge-in-stock":i.type==="STOCK_OUT"?"badge-out-of-stock":"badge-low-stock"}">
                    ${i.type.replace("_"," ")}
                  </span>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${i.productName}</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${i.sku||""}</div>
                </td>
                <td style="font-size: 12px; color: var(--text-muted);">${i.location||"Central"}</td>
                <td style="font-size: 12px;">${i.supplier||i.destination||i.recipient||"Internal"}</td>
                <td style="text-align: right; font-weight: 700; color: ${l?"var(--success-text)":"var(--danger-text)"};">
                  ${l?"+":"-"}${i.quantity}
                </td>
                <td style="text-align: right;">$${(i.unitCost||i.unitPrice||0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700;">$${(i.totalValue||(i.quantity||0)*(i.unitCost||0)).toFixed(2)}</td>
                <td style="font-size: 12px; color: var(--text-muted);">${i.user||"System"}</td>
              </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="6" style="text-align: right; padding: 14px 16px;">Ledger Range Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">
              <span style="color: var(--success); font-weight: 700;">+${e} In</span> / 
              <span style="color: var(--danger); font-weight: 700;">-${n} Out</span>
            </td>
            <td></td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 14px;">
              $${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `}if(R==="REORDER_REPORT"){const t=kt(),e=t.reduce((n,a)=>{const i=Math.max(0,(a.maxStock||a.minStock*2)-a.currentStock);return n+i*(a.costPrice||0)},0);return`
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Primary Supplier</th>
            <th style="text-align: right;">Current Stock</th>
            <th style="text-align: right;">Min Stock</th>
            <th style="text-align: right;">Max Target</th>
            <th style="text-align: right;">Deficit</th>
            <th style="text-align: right;">Recommended Reorder</th>
            <th style="text-align: right;">Estimated Cost</th>
            <th style="text-align: center;">Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${t.length===0?`
            <tr><td colspan="12" style="text-align: center; color: var(--success); font-weight: 600; padding: 32px;">✓ All inventory items are adequately stocked above minimum thresholds.</td></tr>
          `:t.map(n=>{const a=Math.max(0,n.minStock-n.currentStock),i=n.maxStock||n.minStock*2,l=Math.max(a,i-n.currentStock),r=l*(n.costPrice||0);return`
              <tr>
                <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${n.sku}</td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${n.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${n.location||"Central"}</div>
                </td>
                <td><span class="badge badge-neutral">${n.category}</span></td>
                <td style="font-size: 12.5px; font-weight: 500;">${n.supplier||"Unassigned"}</td>
                <td style="text-align: right; font-weight: 700; color: ${n.currentStock===0?"var(--danger)":"var(--warning-dark)"};">
                  ${n.currentStock} ${n.unit}
                </td>
                <td style="text-align: right; color: var(--text-muted);">${n.minStock}</td>
                <td style="text-align: right; color: var(--text-muted);">${i}</td>
                <td style="text-align: right; font-weight: 600; color: var(--danger);">${a>0?`-${a}`:"0"}</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">
                  <strong>+${l}</strong> ${n.unit}
                </td>
                <td style="text-align: right; font-weight: 700;">$${r.toFixed(2)}</td>
                <td style="text-align: center;">
                  <span class="badge ${n.currentStock===0?"badge-out-of-stock":"badge-low-stock"}">
                    ${n.stockStatus}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-primary btn-sm" onclick="window.reorderReportItem('${n.id}', ${l})" title="Open Stock In with recommended intake">
                    Reorder
                  </button>
                </td>
              </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="8" style="text-align: right; padding: 14px 16px;">Total Estimated Reorder Procurement Capital:</td>
            <td colspan="2" style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 15px;">
              $${e.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    `}if(R==="SUPPLIER_REPORT"){const t=$t(),e=t.reduce((i,l)=>i+l.totalSpend,0),n=t.reduce((i,l)=>i+l.totalUnits,0),a=t.reduce((i,l)=>i+l.totalShipments,0);return`
      <table class="data-table">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Contact Person</th>
            <th>Phone / Email</th>
            <th style="text-align: right;">Active Catalog Lines</th>
            <th style="text-align: right;">Purchase Orders</th>
            <th style="text-align: right;">Units Supplied</th>
            <th style="text-align: right;">Total Spend ($)</th>
            <th style="text-align: right;">Avg PO Value</th>
            <th>Last Shipment</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${t.length===0?`
            <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px;">No supplier records found.</td></tr>
          `:t.map(i=>`
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${i.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${i.id}</div>
              </td>
              <td style="font-weight: 500;">${i.contactPerson}</td>
              <td>
                <div style="font-size: 12px; color: var(--text-main);">${i.phone}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${i.email}</div>
              </td>
              <td style="text-align: right; font-weight: 600;">${i.activeLines} lines</td>
              <td style="text-align: right; font-weight: 600;">${i.totalShipments} POs</td>
              <td style="text-align: right; font-weight: 700; color: var(--primary);">${i.totalUnits.toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${i.totalSpend.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td style="text-align: right; color: var(--text-muted);">$${i.avgOrderValue.toFixed(2)}</td>
              <td style="font-size: 12px; color: var(--text-muted);">${i.lastDeliveryDate}</td>
              <td style="text-align: center;">
                <span class="badge ${i.status==="ACTIVE"?"badge-in-stock":"badge-neutral"}">
                  ${i.status}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="background: var(--surface-alt); font-weight: 700; border-top: 2px solid var(--border);">
            <td colspan="4" style="text-align: right; padding: 14px 16px;">Vendor Portfolio Totals:</td>
            <td style="text-align: right; padding: 14px 16px;">${a} POs</td>
            <td style="text-align: right; padding: 14px 16px;">${n.toLocaleString()} units</td>
            <td style="text-align: right; padding: 14px 16px; color: var(--primary); font-size: 15px;">
              $${e.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>
    `}return`
    <table class="data-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Location</th>
          <th style="text-align: right;">Current Stock</th>
          <th style="text-align: right;">Min Stock</th>
          <th style="text-align: right;">Max Stock</th>
          <th style="text-align: right;">Unit Cost</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${vt().map(t=>`
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${t.sku}</td>
            <td style="font-weight: 600;">${t.name}</td>
            <td><span class="badge badge-neutral">${t.category}</span></td>
            <td>${t.location}</td>
            <td style="text-align: right; font-weight: 700;">${t.currentStock} ${t.unit}</td>
            <td style="text-align: right; color: var(--text-muted);">${t.minStock}</td>
            <td style="text-align: right; color: var(--text-muted);">${t.maxStock}</td>
            <td style="text-align: right;">$${(t.costPrice||0).toFixed(2)}</td>
            <td style="text-align: right;">$${(t.sellingPrice||0).toFixed(2)}</td>
            <td style="text-align: center;"><span class="badge ${t.stockStatus==="IN STOCK"?"badge-in-stock":t.stockStatus==="LOW STOCK"?"badge-low-stock":"badge-out-of-stock"}">${t.stockStatus}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}window.switchReportTab=function(o){R=o,g.search="";const t=document.getElementById("view-content");t&&(t.innerHTML=xt())};window.setReportFilter=function(o,t){g[o]=t;const e=document.getElementById("view-content");e&&(e.innerHTML=xt())};window.resetReportFilters=function(){g={search:"",dateFrom:Ct.toISOString().slice(0,10),dateTo:new Date().toISOString().slice(0,10),category:"ALL",location:"ALL",supplier:"ALL",stockStatus:"ALL",movementType:"ALL",urgency:"ALL"};const o=document.getElementById("view-content");o&&(o.innerHTML=xt())};window.reorderReportItem=function(o,t){window.router.navigate("stock-in"),setTimeout(()=>{var n,a;const e=document.getElementById("in-product");if(e){e.value=o,(n=window.handleStockInProductChange)==null||n.call(window,o);const i=document.getElementById("in-qty");i&&(i.value=t||50,(a=window.updateStockInCalc)==null||a.call(window),i.focus())}window.showToast("Product and reorder volume pre-populated for intake.","info")},100)};window.printReport=function(){window.print()};window.exportActiveReportCSV=function(){var i,l;const o=new Date().toISOString().slice(0,10);let t=[];if(t.push(["Apex Stock Management System - Official Report"]),t.push(["Report Type",ft(R)]),t.push(["Generated On",new Date().toISOString()]),t.push(["Generated By",`${((i=v.getUser())==null?void 0:i.fullName)||"System User"} (${((l=v.getUser())==null?void 0:l.role)||"VIEWER"})`]),t.push([]),R==="VALUATION_REPORT"){const r=vt();t.push(["SKU","Product Name","Category","Location","Current Stock","Unit","Cost Price","Selling Price","Cost Valuation","Retail Valuation","Unrealized Profit","Margin %","Status"]),r.forEach(s=>{const d=(s.currentStock||0)*(s.costPrice||0),c=(s.currentStock||0)*(s.sellingPrice||0),p=c-d,u=c>0?p/c*100:0;t.push([s.sku,`"${s.name.replace(/"/g,'""')}"`,s.category,s.location||"Central",s.currentStock,s.unit,(s.costPrice||0).toFixed(2),(s.sellingPrice||0).toFixed(2),d.toFixed(2),c.toFixed(2),p.toFixed(2),`${u.toFixed(1)}%`,s.stockStatus])})}else if(R==="MOVEMENT_LEDGER"){const r=St();t.push(["Date & Time","Ref No","Type","SKU","Product Name","Location","Counterparty","Quantity","Unit Cost","Total Value","User"]),r.forEach(s=>{const d=s.type==="STOCK_IN"||s.type==="ADJUSTMENT_IN";t.push([s.date,s.refNo,s.type,s.sku||"",`"${s.productName.replace(/"/g,'""')}"`,s.location||"Central",`"${(s.supplier||s.destination||s.recipient||"Internal").replace(/"/g,'""')}"`,`${d?"+":"-"}${s.quantity}`,(s.unitCost||0).toFixed(2),(s.totalValue||(s.quantity||0)*(s.unitCost||0)).toFixed(2),s.user||"System"])})}else if(R==="REORDER_REPORT"){const r=kt();t.push(["SKU","Product Name","Category","Primary Supplier","Location","Current Stock","Min Stock","Max Target","Deficit","Recommended Reorder","Unit Cost","Estimated Restock Cost","Status"]),r.forEach(s=>{const d=Math.max(0,s.minStock-s.currentStock),c=s.maxStock||s.minStock*2,p=Math.max(d,c-s.currentStock),u=p*(s.costPrice||0);t.push([s.sku,`"${s.name.replace(/"/g,'""')}"`,s.category,`"${(s.supplier||"Unassigned").replace(/"/g,'""')}"`,s.location||"Central",s.currentStock,s.minStock,c,d,p,(s.costPrice||0).toFixed(2),u.toFixed(2),s.stockStatus])})}else if(R==="SUPPLIER_REPORT"){const r=$t();t.push(["Supplier ID","Supplier Name","Contact Person","Phone","Email","Active Catalog Lines","Total Purchase Orders","Total Units Supplied","Total Spend ($)","Avg PO Value ($)","Last Delivery Date","Status"]),r.forEach(s=>{t.push([s.id,`"${s.name.replace(/"/g,'""')}"`,`"${s.contactPerson.replace(/"/g,'""')}"`,s.phone,s.email,s.activeLines,s.totalShipments,s.totalUnits,s.totalSpend.toFixed(2),s.avgOrderValue.toFixed(2),s.lastDeliveryDate,s.status])})}else{const r=vt();t.push(["SKU","Product Name","Category","Location","Current Stock","Min Stock","Max Stock","Cost Price","Selling Price","Status"]),r.forEach(s=>{t.push([s.sku,`"${s.name.replace(/"/g,'""')}"`,s.category,s.location,s.currentStock,s.minStock,s.maxStock,(s.costPrice||0).toFixed(2),(s.sellingPrice||0).toFixed(2),s.stockStatus])})}const e="data:text/csv;charset=utf-8,"+t.map(r=>r.join(",")).join(`
`),n=encodeURI(e),a=document.createElement("a");a.setAttribute("href",n),a.setAttribute("download",`${R}_${o}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a),window.showToast(`${ft(R)} CSV exported successfully.`,"success")};let j={search:"",role:"ALL",status:"ALL"};function lt(){const o=v.getUser(),t=(o==null?void 0:o.role)==="ADMIN",e=q.length,n=q.filter(s=>s.status==="ACTIVE").length,a=q.filter(s=>s.role==="ADMIN").length,i=q.filter(s=>s.role==="STOCK_MANAGER").length,l=q.filter(s=>s.role==="VIEWER").length,r=q.filter(s=>{const d=j.search.toLowerCase(),c=!d||s.username.toLowerCase().includes(d)||s.fullName.toLowerCase().includes(d)||s.email.toLowerCase().includes(d)||s.userId.toLowerCase().includes(d),p=j.role==="ALL"||s.role===j.role,u=j.status==="ALL"||s.status===j.status;return c&&p&&u});return`
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>User Administration & RBAC Management</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 15 Active</span>
        </div>
        <p>Provision operator accounts, assign corporate security tiers, reset access credentials, and enforce role-based privileges.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.exportUsersCSV()" title="Export operator roster">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Users
        </button>
        ${t?`
          <button class="btn btn-primary btn-sm" onclick="window.openAddUserModal()" title="Create new system user">
            <svg viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Add New User
          </button>
        `:`
          <span class="badge badge-neutral" style="padding: 6px 12px; font-size: 12px;">
            Role: <strong>${(o==null?void 0:o.role)||"VIEWER"}</strong> (Read-Only)
          </span>
        `}
      </div>
    </div>

    ${t?"":`
      <div class="card" style="border-left: 4px solid var(--warning); margin-bottom: 20px;">
        <div class="card-body" style="padding: 14px 20px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 10px;">
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke: var(--warning); fill: none; stroke-width: 2; flex-shrink: 0;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div>
            <strong>Privilege Notice:</strong> Your current session is authenticated as <strong>${(o==null?void 0:o.role)||"VIEWER"}</strong>. Only system <strong>Administrators</strong> possess clearance to provision operators, reassign security roles, reset credentials, or deactivate accounts.
          </div>
        </div>
      </div>
    `}

    <!-- 5 KPI Statistics Cards -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total Operators</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${e}</div>
        <div class="kpi-footer"><span class="kpi-trend positive">${n} active</span> • ${e-n} inactive</div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Administrators</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${a}</div>
        <div class="kpi-footer">Full system authority</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Managers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${i}</div>
        <div class="kpi-footer">Catalog & warehouse ops</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Viewers</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${l}</div>
        <div class="kpi-footer">Read-only oversight</div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search User / Name / Email</label>
            <input type="text" class="form-input" placeholder="Search by username, full name, email..." value="${j.search}" oninput="window.handleUserSearch(this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Security Tier</label>
            <select class="form-select" onchange="window.handleUserFilter('role', this.value)">
              <option value="ALL" ${j.role==="ALL"?"selected":""}>All Roles</option>
              <option value="ADMIN" ${j.role==="ADMIN"?"selected":""}>ADMIN</option>
              <option value="STOCK_MANAGER" ${j.role==="STOCK_MANAGER"?"selected":""}>STOCK_MANAGER</option>
              <option value="VIEWER" ${j.role==="VIEWER"?"selected":""}>VIEWER</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Account Status</label>
            <select class="form-select" onchange="window.handleUserFilter('status', this.value)">
              <option value="ALL" ${j.status==="ALL"?"selected":""}>All Statuses</option>
              <option value="ACTIVE" ${j.status==="ACTIVE"?"selected":""}>Active Accounts</option>
              <option value="INACTIVE" ${j.status==="INACTIVE"?"selected":""}>Inactive Accounts</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetUserFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2"/></svg>
          System Operators Roster
        </div>
        <span class="badge badge-neutral" style="font-size: 11.5px;">${r.length} Operators</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Work Email</th>
              <th>Security Tier</th>
              <th>Status</th>
              <th>Last Authenticated</th>
              <th>Created Date</th>
              <th style="text-align: right;">Administrative Actions</th>
            </tr>
          </thead>
          <tbody>
            ${r.length===0?`
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No operators match current filters.</td></tr>
            `:r.map(s=>{const d=s.fullName.split(" ").map(u=>u[0]).join("").slice(0,2).toUpperCase(),c=s.username==="admin",p=(o==null?void 0:o.userId)===s.userId||(o==null?void 0:o.username)===s.username;return`
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 34px; height: 34px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0;">
                        ${d}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${s.fullName} ${p?'<span class="badge badge-neutral" style="font-size: 10px; margin-left: 4px;">You</span>':""}</div>
                        <div style="font-size: 11.5px; color: var(--text-muted); font-family: monospace;">@${s.username} • ${s.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; color: var(--text-secondary);">${s.email}</div>
                  </td>
                  <td>
                    <span class="badge ${s.role==="ADMIN"?"badge-primary":s.role==="STOCK_MANAGER"?"badge-in-stock":"badge-neutral"}" style="font-size: 11px;">
                      ${s.role}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${s.status==="ACTIVE"?"badge-in-stock":"badge-out-of-stock"}" style="font-size: 11px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-right: 4px;"></span>
                      ${s.status}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted);">${s.lastLogin||"Never"}</td>
                  <td style="font-size: 12px; color: var(--text-muted);">${s.createdDate}</td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="window.viewUserDossier('${s.userId}')" title="View Operator Profile Dossier">
                        Dossier
                      </button>
                      ${t?`
                        <button class="btn btn-secondary btn-sm" onclick="window.openEditUserModal('${s.userId}')" title="Edit Profile & Assign Security Role">
                          Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.openResetUserPasswordModal('${s.userId}')" title="Issue New Temporary Password">
                          Reset Pwd
                        </button>
                        ${!c&&!p?`
                          <button class="btn btn-secondary btn-sm" onclick="window.toggleUserStatusPrompt('${s.userId}')" style="color: ${s.status==="ACTIVE"?"var(--danger)":"var(--success)"};" title="${s.status==="ACTIVE"?"Deactivate Account":"Activate Account"}">
                            ${s.status==="ACTIVE"?"Deactivate":"Activate"}
                          </button>
                        `:""}
                      `:""}
                    </div>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.openAddUserModal=function(){window.openModal({title:"Provision New System Operator",body:`
      <form id="add-user-form" class="form-grid" onsubmit="event.preventDefault(); window.submitNewUser();">
        <div class="form-group">
          <label class="form-label">Username <span class="required-star">*</span></label>
          <input type="text" id="usr-new-username" class="form-input" placeholder="e.g. jmiller" required />
          <div class="form-hint">Lowercase, letters and numbers</div>
        </div>
        <div class="form-group">
          <label class="form-label">Temporary Password <span class="required-star">*</span></label>
          <div style="position: relative;">
            <input type="password" id="usr-new-pwd" class="form-input" placeholder="Min 6 characters" minlength="6" required />
            <button type="button" onclick="window.toggleModalPwdVisibility('usr-new-pwd')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--text-muted);">Show</button>
          </div>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Full Name <span class="required-star">*</span></label>
          <input type="text" id="usr-new-fullname" class="form-input" placeholder="e.g. Jessica Miller" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Work Email Address <span class="required-star">*</span></label>
          <input type="email" id="usr-new-email" class="form-input" placeholder="jmiller@company.com" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Security Role Tier <span class="required-star">*</span></label>
          <select id="usr-new-role" class="form-select" required>
            <option value="VIEWER">VIEWER (Read-Only: Dashboard, Product Catalog, Valuation & Analytics)</option>
            <option value="STOCK_MANAGER" selected>STOCK_MANAGER (Standard Ops: Products, Stock In, Stock Out, Physical Count Adjustments)</option>
            <option value="ADMIN">ADMIN (Full Authority: User Admin, Security RBAC, System Settings, Audit Logs, Ledger Sync)</option>
          </select>
        </div>
      </form>
    `,primaryText:"Provision Operator",onPrimary:()=>window.submitNewUser()})};window.submitNewUser=async function(){var c,p,u,w,x,f,h;const o=(c=document.getElementById("usr-new-username"))==null?void 0:c.value.trim().toLowerCase(),t=(p=document.getElementById("usr-new-pwd"))==null?void 0:p.value.trim(),e=(u=document.getElementById("usr-new-fullname"))==null?void 0:u.value.trim(),n=(w=document.getElementById("usr-new-email"))==null?void 0:w.value.trim(),a=((x=document.getElementById("usr-new-role"))==null?void 0:x.value)||"VIEWER";if(!o||!t||!e||!n){window.showToast("All fields marked with an asterisk are required.","error");return}if(t.length<6){window.showToast("Initial password must be at least 6 characters long.","error");return}if(q.some(b=>b.username.toLowerCase()===o)){window.showToast(`Username "@${o}" is already assigned to an existing operator.`,"error");return}const i=`USR-${(q.length+1).toString().padStart(3,"0")}`,l=new Date().toISOString().slice(0,10),r={userId:i,username:o,fullName:e,email:n,role:a,status:"ACTIVE",lastLogin:"Never",createdDate:l};q.push(r);let s=!1;if(S.isConfigured())try{window.showToast("Saving new operator to Google Sheets...","info"),await S.createUser({username:o,password:t,fullName:e,email:n,role:a},v.getToken()),s=!0,window.showToast(`✅ Operator @${o} recorded in Google Sheets!`,"success")}catch(b){console.error("API createUser failed:",b),window.showToast(`❌ Google Sheets Error: ${b.message}`,"error",8e3)}else window.showToast(`⚠️ Demo Mode: Operator @${o} saved locally. To save to Google Sheets, connect your Web App URL in the top header.`,"warning",6e3);P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((f=v.getUser())==null?void 0:f.userId)||"USR-001",username:((h=v.getUser())==null?void 0:h.username)||"admin",action:"CREATE_USER",module:"Users",recordId:i,description:`Provisioned operator @${o} (${e}) with role tier [${a}]`}),window.closeModal();const d=document.getElementById("view-content");d&&(d.innerHTML=lt())};window.openEditUserModal=function(o){const t=q.find(n=>n.userId===o);if(!t)return;const e=t.username==="admin";window.openModal({title:`Edit Operator: @${t.username}`,body:`
      <form id="edit-user-form" class="form-grid" onsubmit="event.preventDefault(); window.submitEditUser('${t.userId}');">
        <div class="form-group">
          <label class="form-label">User ID</label>
          <input type="text" class="form-input" value="${t.userId}" disabled style="background: var(--surface-alt);" />
        </div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" value="@${t.username}" disabled style="background: var(--surface-alt);" />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Full Name <span class="required-star">*</span></label>
          <input type="text" id="usr-edit-fullname" class="form-input" value="${t.fullName}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Work Email Address <span class="required-star">*</span></label>
          <input type="email" id="usr-edit-email" class="form-input" value="${t.email}" required />
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Security Role Tier <span class="required-star">*</span></label>
          <select id="usr-edit-role" class="form-select" ${e?"disabled":""}>
            <option value="VIEWER" ${t.role==="VIEWER"?"selected":""}>VIEWER (Read-Only: Dashboard, Product Catalog, Valuation & Analytics)</option>
            <option value="STOCK_MANAGER" ${t.role==="STOCK_MANAGER"?"selected":""}>STOCK_MANAGER (Standard Ops: Products, Stock In, Stock Out, Physical Count Adjustments)</option>
            <option value="ADMIN" ${t.role==="ADMIN"?"selected":""}>ADMIN (Full Authority: User Admin, Security RBAC, System Settings, Audit Logs, Ledger Sync)</option>
          </select>
          ${e?'<div class="form-hint" style="color: var(--warning-dark);">Master admin account tier is locked.</div>':""}
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Account Status</label>
          <select id="usr-edit-status" class="form-select" ${e?"disabled":""}>
            <option value="ACTIVE" ${t.status==="ACTIVE"?"selected":""}>ACTIVE (Authorized to authenticate and perform tasks)</option>
            <option value="INACTIVE" ${t.status==="INACTIVE"?"selected":""}>INACTIVE (Temporarily suspended / Login blocked)</option>
          </select>
        </div>
      </form>
    `,primaryText:"Save Changes",onPrimary:()=>window.submitEditUser(t.userId)})};window.submitEditUser=async function(o){var s,d,c,p,u,w;const t=q.find(x=>x.userId===o);if(!t)return;const e=(s=document.getElementById("usr-edit-fullname"))==null?void 0:s.value.trim(),n=(d=document.getElementById("usr-edit-email"))==null?void 0:d.value.trim(),a=((c=document.getElementById("usr-edit-role"))==null?void 0:c.value)||t.role,i=((p=document.getElementById("usr-edit-status"))==null?void 0:p.value)||t.status;if(!e||!n){window.showToast("Full name and email are required.","error");return}const l=t.role;if(t.fullName=e,t.email=n,t.username!=="admin"&&(t.role=a,t.status=i),S.isConfigured())try{await S.updateUser({userId:o,fullName:e,email:n,role:t.role,status:t.status},v.getToken())}catch(x){console.warn("API updateUser failed, updated in local session:",x)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((u=v.getUser())==null?void 0:u.userId)||"USR-001",username:((w=v.getUser())==null?void 0:w.username)||"admin",action:"UPDATE_USER",module:"Users",recordId:o,description:`Updated profile for @${t.username} (Role: ${l} → ${t.role}, Status: ${t.status})`}),window.closeModal(),window.showToast(`Operator @${t.username} profile updated successfully.`,"success");const r=document.getElementById("view-content");r&&(r.innerHTML=lt())};window.openResetUserPasswordModal=function(o){const t=q.find(e=>e.userId===o);t&&window.openModal({title:`Reset Password: @${t.username}`,body:`
      <div>
        <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px;">
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${t.fullName}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Account: @${t.username} • Role: <strong>${t.role}</strong></div>
        </div>

        <form id="reset-pwd-form" onsubmit="event.preventDefault(); window.submitResetUserPassword('${t.userId}');">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">New Temporary Password <span class="required-star">*</span></label>
            <div style="position: relative;">
              <input type="password" id="usr-reset-newpwd" class="form-input" placeholder="Enter new password (min 6 chars)" minlength="6" required />
              <button type="button" onclick="window.toggleModalPwdVisibility('usr-reset-newpwd')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--text-muted);">Show</button>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Confirm Password <span class="required-star">*</span></label>
            <input type="password" id="usr-reset-confirmpwd" class="form-input" placeholder="Repeat new password" minlength="6" required />
          </div>
        </form>

        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0;">
          The operator will be required to authenticate with this new credential upon their next portal sign-in.
        </p>
      </div>
    `,primaryText:"Set New Password",onPrimary:()=>window.submitResetUserPassword(t.userId)})};window.submitResetUserPassword=async function(o){var a,i,l,r;const t=q.find(s=>s.userId===o);if(!t)return;const e=(a=document.getElementById("usr-reset-newpwd"))==null?void 0:a.value.trim(),n=(i=document.getElementById("usr-reset-confirmpwd"))==null?void 0:i.value.trim();if(!e||e.length<6){window.showToast("Password must be at least 6 characters long.","error");return}if(e!==n){window.showToast("Password confirmation does not match.","error");return}if(S.isConfigured())try{await S.resetUserPassword(o,e,v.getToken())}catch(s){console.warn("API resetUserPassword failed, updated in local session:",s)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((l=v.getUser())==null?void 0:l.userId)||"USR-001",username:((r=v.getUser())==null?void 0:r.username)||"admin",action:"RESET_PASSWORD",module:"Users",recordId:o,description:`Administrative credential reset issued for operator @${t.username}`}),window.closeModal(),window.showToast(`Credentials for @${t.username} reset successfully.`,"success")};window.toggleUserStatusPrompt=function(o){const t=q.find(n=>n.userId===o);if(!t)return;if(t.username==="admin"){window.showToast("Primary master admin account cannot be deactivated.","error");return}const e=t.status==="ACTIVE";window.openModal({title:`${e?"Deactivate":"Activate"} Operator: @${t.username}`,body:`
      <div>
        <p style="font-size: 14px; color: var(--text-main); margin-bottom: 10px;">
          Are you sure you want to <strong>${e?"deactivate":"reactivate"}</strong> the account for <strong>${t.fullName} (@${t.username})</strong>?
        </p>
        <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.6;">
          ${e?"Deactivated operators are immediately blocked from logging into the Stock Management System. All historic transaction ledgers created by this user will remain permanently preserved.":"Reactivating this operator restores their access privileges according to their assigned security tier."}
        </p>
      </div>
    `,primaryText:e?"Yes, Deactivate":"Yes, Activate",onPrimary:async()=>{var a,i;if(t.status=e?"INACTIVE":"ACTIVE",S.isConfigured())try{await S.deactivateUser(o,v.getToken())}catch(l){console.warn("API deactivateUser failed:",l)}P.unshift({id:`LOG-${Date.now().toString().slice(-4)}`,dateTime:new Date().toISOString().replace("T"," ").substring(0,19),userId:((a=v.getUser())==null?void 0:a.userId)||"USR-001",username:((i=v.getUser())==null?void 0:i.username)||"admin",action:"UPDATE_USER_STATUS",module:"Users",recordId:o,description:`Set account status for @${t.username} to ${t.status}`}),window.closeModal(),window.showToast(`Operator @${t.username} status toggled to ${t.status}.`,"info");const n=document.getElementById("view-content");n&&(n.innerHTML=lt())}})};window.viewUserDossier=function(o){const t=q.find(i=>i.userId===o);if(!t)return;const e=t.fullName.split(" ").map(i=>i[0]).join("").slice(0,2).toUpperCase(),n=P.filter(i=>i.userId===t.userId||i.username===t.username),a=t.role==="ADMIN"?["Full Master Product Catalog Management (Add/Edit/Archive)","Stock In / Purchase Receipts Management","Stock Out / Fulfillment Dispatching","Stock Adjustment & Count Reconciliation","Ledger Synchronization & Equation Recalculation","Full User Administration & Security Tier Assignment","Corporate System Configuration & Settings","Security Audit Log Inspection & Compliance Export"]:t.role==="STOCK_MANAGER"?["Master Product Catalog Operations (Add/Edit)","Stock In / Purchase Receipts Execution","Stock Out / Dispatch Orders Execution","Stock Adjustment & Variance Logging","Ledger Recalculation & Synchronize Balances","Analytical Inventory Reports View & Export"]:["Executive Dashboard Live Telemetry (Read-Only)","Inventory Catalog & Balances Search (Read-Only)","Valuation & Movement Reports (Read-Only)","Export Reports & Inventory Data to CSV"];window.openModal({title:`Operator Dossier: ${t.fullName}`,body:`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--primary); color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
            ${e}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 17px; font-weight: 700; color: var(--text-main);">${t.fullName}</div>
            <div style="font-size: 12px; color: var(--text-muted); font-family: monospace;">@${t.username} • ${t.userId}</div>
          </div>
          <div>
            <span class="badge ${t.role==="ADMIN"?"badge-primary":t.role==="STOCK_MANAGER"?"badge-in-stock":"badge-neutral"}">
              ${t.role}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Email:</strong> <div>${t.email}</div></div>
          <div><strong style="color: var(--text-muted);">Account Status:</strong> <div><span class="badge ${t.status==="ACTIVE"?"badge-in-stock":"badge-out-of-stock"}">${t.status}</span></div></div>
          <div><strong style="color: var(--text-muted);">Last Login:</strong> <div>${t.lastLogin||"Never"}</div></div>
          <div><strong style="color: var(--text-muted);">Account Created:</strong> <div>${t.createdDate}</div></div>
        </div>

        <div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Role Permissions Cleared:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 12.5px; color: var(--text-secondary); line-height: 1.6;">
            ${a.map(i=>`<li>${i}</li>`).join("")}
          </ul>
        </div>

        ${n.length>0?`
          <div style="border-top: 1px solid var(--border); padding-top: 12px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Recent Audit Activity:</div>
            <div style="max-height: 120px; overflow-y: auto; font-size: 11.5px; display: flex; flex-direction: column; gap: 6px;">
              ${n.slice(0,3).map(i=>`
                <div style="background: var(--surface-alt); padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <span style="font-weight: 600; color: var(--primary);">[${i.action}]</span> ${i.description}
                  <div style="color: var(--text-muted); font-size: 10.5px;">${i.dateTime}</div>
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
      </div>
    `,primaryText:"Close Dossier",onPrimary:()=>window.closeModal()})};window.handleUserSearch=function(o){j.search=o;const t=document.getElementById("view-content");t&&(t.innerHTML=lt())};window.handleUserFilter=function(o,t){j[o]=t;const e=document.getElementById("view-content");e&&(e.innerHTML=lt())};window.resetUserFilters=function(){j={search:"",role:"ALL",status:"ALL"};const o=document.getElementById("view-content");o&&(o.innerHTML=lt())};window.toggleModalPwdVisibility=function(o){const t=document.getElementById(o);t&&(t.type=t.type==="password"?"text":"password")};window.exportUsersCSV=function(){var i,l;const o=new Date().toISOString().slice(0,10),e="data:text/csv;charset=utf-8,"+[["Apex Stock Management System - Operator Roster"],["Generated On",new Date().toISOString()],["Generated By",`${((i=v.getUser())==null?void 0:i.fullName)||"System User"} (${((l=v.getUser())==null?void 0:l.role)||"VIEWER"})`],[],["User ID","Username","Full Name","Work Email","Security Role Tier","Status","Last Login","Created Date"],...q.map(r=>[r.userId,r.username,`"${r.fullName.replace(/"/g,'""')}"`,r.email,r.role,r.status,r.lastLogin||"Never",r.createdDate])].map(r=>r.join(",")).join(`
`),n=encodeURI(e),a=document.createElement("a");a.setAttribute("href",n),a.setAttribute("download",`System_Operators_${o}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a),window.showToast("Operator roster exported to CSV.","success")};let it="company";function At(){var o;return`
    <div class="page-header">
      <div class="page-title-group">
        <h1>Enterprise Configuration & Preferences</h1>
        <p>Manage company details, inventory business rules, localization, and security policies.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.saveSettings()">
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          Save Configuration
        </button>
      </div>
    </div>

    <!-- Settings Navigation Tabs -->
    <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); margin-bottom: 24px;">
      <button class="btn btn-sm ${it==="company"?"btn-primary":"btn-secondary"}" onclick="window.switchSettingsTab('company')">
        Company Information
      </button>
      <button class="btn btn-sm ${it==="inventory"?"btn-primary":"btn-secondary"}" onclick="window.switchSettingsTab('inventory')">
        Inventory Business Rules
      </button>
      <button class="btn btn-sm ${it==="system"?"btn-primary":"btn-secondary"}" onclick="window.switchSettingsTab('system')">
        Localization & Language (EN / KH)
      </button>
      <button class="btn btn-sm ${it==="security"?"btn-primary":"btn-secondary"}" onclick="window.switchSettingsTab('security')">
        Security & Session
      </button>
    </div>

    <!-- Active Tab Content -->
    ${it==="company"?`
      <div class="card">
        <div class="card-header">
          <div class="card-title">Company Profile</div>
          <span class="badge badge-neutral">Master Entity</span>
        </div>
        <div class="card-body">
          <form class="form-grid">
            <div class="form-group col-span-2">
              <label class="form-label">Corporate Registered Name <span class="required-star">*</span></label>
              <input type="text" id="set-company-name" class="form-input" value="${nt.companyName}" />
            </div>
            <div class="form-group col-span-2">
              <label class="form-label">Physical HQ Address <span class="required-star">*</span></label>
              <input type="text" id="set-address" class="form-input" value="${nt.address}" />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <input type="text" id="set-phone" class="form-input" value="${nt.phone}" />
            </div>
            <div class="form-group">
              <label class="form-label">Primary Business Email</label>
              <input type="email" id="set-email" class="form-input" value="${nt.email}" />
            </div>
            <div class="form-group col-span-2">
              <label class="form-label">Brand Logo Asset</label>
              <div style="display: flex; align-items: center; gap: 16px; margin-top: 6px;">
                <img src="/assets/logo.svg" alt="Company Logo" style="width: 48px; height: 48px; border-radius: var(--radius-md); border: 1px solid var(--border);" />
                <div>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.showToast('Logo upload supported in Google Drive storage phase.', 'info')">
                    Replace Logo SVG
                  </button>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Recommended: 200x200px SVG or PNG with transparent background</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `:""}

    ${it==="inventory"?`
      <div class="card">
        <div class="card-header">
          <div class="card-title">Inventory Controls & Thresholds</div>
        </div>
        <div class="card-body">
          <form class="form-grid">
            <div class="form-group">
              <label class="form-label">Default Minimum Stock Alert Threshold</label>
              <input type="number" id="set-min-stock" class="form-input" value="${nt.defaultMinStock}" />
              <div class="form-hint">Triggers Low Stock warning badge when units fall below this number</div>
            </div>
            <div class="form-group">
              <label class="form-label">Default Intake Location</label>
              <select id="set-default-loc" class="form-select">
                ${E.map(t=>`<option value="${t.name}" ${nt.defaultLocation===t.name?"selected":""}>${t.name}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Valuation Currency</label>
              <select id="set-currency" class="form-select">
                <option value="USD ($)" selected>USD ($)</option>
                <option value="KHR (៛)" >KHR (៛ - Khmer Riel)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Costing Methodology</label>
              <select class="form-select" disabled style="background: var(--surface-alt);">
                <option>FIFO (First-In, First-Out)</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    `:""}

    ${it==="system"?`
      <div class="card">
        <div class="card-header">
          <div class="card-title">Localization & Language Support</div>
          <span class="badge badge-in-stock">Bilingual Ready</span>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Interface Display Language</label>
              <select id="set-lang" class="form-select" onchange="window.handleLanguageChange(this.value)">
                <option value="English" selected>English (Primary)</option>
                <option value="Khmer">ភាសាខ្មែរ (Khmer)</option>
              </select>
              <div class="form-hint">System is architected with complete bilingual i18n dictionary structure</div>
            </div>
            <div class="form-group">
              <label class="form-label">Time Zone</label>
              <select class="form-select">
                <option value="UTC+7" selected>Asia/Phnom_Penh (UTC+07:00)</option>
                <option value="UTC-5">America/Chicago (UTC-05:00)</option>
                <option value="UTC+0">UTC (Universal Coordinated Time)</option>
              </select>
            </div>
            <div class="form-group col-span-2" style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 8px;">
              <label class="form-label">Google Apps Script Web App API URL</label>
              <div style="display: flex; gap: 8px;">
                <input type="url" id="set-api-url" class="form-input" placeholder="https://script.google.com/macros/s/AKfycbx.../exec" value="${((o=window.api)==null?void 0:o.getApiUrl())||""}" />
                <button type="button" class="btn btn-secondary btn-sm" onclick="window.testApiConnection()">
                  Test Connection
                </button>
              </div>
              <div class="form-hint" style="margin-top: 4px;">Paste the deployed Web App URL from your Google Apps Script editor.</div>
            </div>
          </div>
        </div>
      </div>
    `:""}

    ${it==="security"?`
      <div class="card">
        <div class="card-header">
          <div class="card-title">Authentication & Session Rules</div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Inactivity Auto-Logout Timer</label>
              <select class="form-select">
                <option value="30" selected>30 Minutes of idle inactivity</option>
                <option value="60">60 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Password Complexity Rule</label>
              <select class="form-select">
                <option selected>Minimum 8 characters with numbers & symbols</option>
                <option>Standard (minimum 6 characters)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `:""}
  `}window.switchSettingsTab=function(o){it=o;const t=document.getElementById("view-content");t&&(t.innerHTML=At())};window.handleLanguageChange=function(o){nt.language=o,o==="Khmer"?window.showToast("ភាសាខ្មែរ (Khmer bilingual dictionary loaded for UI demonstration).","info"):window.showToast("English interface active.","info")};window.saveSettings=function(){var e,n;const o=(e=document.getElementById("set-company-name"))==null?void 0:e.value;o&&(nt.companyName=o);const t=(n=document.getElementById("set-api-url"))==null?void 0:n.value;t!==void 0&&window.api&&window.api.setApiUrl(t),window.showToast("System configuration settings saved successfully.","success")};window.testApiConnection=async function(){const o=document.getElementById("set-api-url"),t=o==null?void 0:o.value.trim();if(!t){window.showToast("Please paste your Google Apps Script Web App URL first.","warning");return}window.api.setApiUrl(t),window.showToast("Pinging Google Apps Script API...","info");try{const e=await window.api.ping();e&&e.success?window.showToast("✅ Connected successfully to Google Apps Script Database!","success"):window.showToast("Connection responded, but ping was unsuccessful.","warning")}catch(e){window.showToast(e.message,"error")}};let M={search:"",module:"ALL",action:"ALL",user:"ALL",dateFrom:"",dateTo:new Date().toISOString().slice(0,10)},Z=[...P],wt=!1;async function Ot(){if(S.isConfigured())try{wt=!0;const o=await S.getAuditLogs(M,v.getToken());o&&o.success&&Array.isArray(o.data)&&(Z=o.data)}catch(o){console.warn("Could not fetch live audit logs from Google Sheets, using session state:",o)}finally{wt=!1}}function bt(){const o=v.getUser(),t=new Date().toISOString().slice(0,10),e=["Products","Current Stock","Stock In","Stock Out","Stock Adjustments","Categories","Suppliers","Locations","Users","Settings","Auth"],n=["STOCK_IN","STOCK_OUT","STOCK_ADJUSTMENT","RECALCULATE_STOCK","CREATE_PRODUCT","UPDATE_PRODUCT","ARCHIVE_PRODUCT","CREATE_CATEGORY","UPDATE_CATEGORY","CREATE_SUPPLIER","UPDATE_SUPPLIER","CREATE_LOCATION","UPDATE_LOCATION","CREATE_USER","UPDATE_USER","UPDATE_USER_STATUS","RESET_PASSWORD","UPDATE_SETTINGS","LOGIN"],a=Array.from(new Set(Z.map(p=>p.username).filter(Boolean))),i=Z.filter(p=>{const u=M.search.toLowerCase(),w=!u||p.id&&p.id.toLowerCase().includes(u)||p.action&&p.action.toLowerCase().includes(u)||p.username&&p.username.toLowerCase().includes(u)||p.description&&p.description.toLowerCase().includes(u)||p.module&&p.module.toLowerCase().includes(u)||p.recordId&&p.recordId.toLowerCase().includes(u),x=M.module==="ALL"||p.module===M.module,f=M.action==="ALL"||p.action===M.action,h=M.user==="ALL"||p.username===M.user,b=String(p.dateTime||"").slice(0,10),I=!M.dateFrom||b>=M.dateFrom,L=!M.dateTo||b<=M.dateTo;return w&&x&&f&&h&&I&&L}),l=Z.length,r=Z.filter(p=>p.action==="STOCK_IN"||p.action==="STOCK_OUT"||p.action==="STOCK_ADJUSTMENT"||p.action==="RECALCULATE_STOCK").length,s=Z.filter(p=>p.module==="Products"||p.module==="Categories"||p.module==="Suppliers"||p.module==="Locations").length,d=Z.filter(p=>p.module==="Users"||p.module==="Settings"||p.action==="RESET_PASSWORD").length,c=Z.filter(p=>p.action==="LOGIN"||p.action==="LOGOUT"||p.module==="Auth").length;return`
    <div class="page-header">
      <div class="page-title-group">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>System Security & Activity Audit Log</h1>
          <span class="badge badge-primary" style="font-size: 11px;">Phase 16 Active</span>
        </div>
        <p>Immutable enterprise audit trail capturing all critical inventory actions, security authorizations, and administrative events.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.refreshAuditTrail()" title="Sync audit logs with database">
          <svg viewBox="0 0 24 24" id="audit-sync-icon" style="${wt?"animation: spin 1s linear infinite;":""}"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          ${wt?"Syncing...":"Refresh Logs"}
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.printAuditTrail()" title="Print compliance audit record">
          <svg viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Audit
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.exportAuditCSV()" title="Export audit trail to CSV">
          <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- 5 KPI Statistics Cards -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Audited Events</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${l}</div>
        <div class="kpi-footer"><span class="kpi-trend positive">Tamper-evident</span> journal</div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-card-header">
          <span class="kpi-title">Stock Movements</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${r}</div>
        <div class="kpi-footer">In, Out, Adjustments</div>
      </div>

      <div class="kpi-card kpi-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Master Catalog Ops</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${s}</div>
        <div class="kpi-footer">Products, Categories, Suppliers</div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-card-header">
          <span class="kpi-title">Security & RBAC</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
        </div>
        <div class="kpi-value">${d}</div>
        <div class="kpi-footer">User admin & settings</div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Authentications</span>
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
          </div>
        </div>
        <div class="kpi-value">${c}</div>
        <div class="kpi-footer">Operator logins & sessions</div>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body" style="padding: 16px 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Search Narrative / Record / User</label>
            <input type="text" class="form-input" placeholder="Search audit trail..." value="${M.search}" oninput="window.setAuditFilter('search', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Module</label>
            <select class="form-select" onchange="window.setAuditFilter('module', this.value)">
              <option value="ALL" ${M.module==="ALL"?"selected":""}>All Modules</option>
              ${e.map(p=>`<option value="${p}" ${M.module===p?"selected":""}>${p}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Action Code</label>
            <select class="form-select" onchange="window.setAuditFilter('action', this.value)">
              <option value="ALL" ${M.action==="ALL"?"selected":""}>All Actions</option>
              ${n.map(p=>`<option value="${p}" ${M.action===p?"selected":""}>${p}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Operator User</label>
            <select class="form-select" onchange="window.setAuditFilter('user', this.value)">
              <option value="ALL" ${M.user==="ALL"?"selected":""}>All Operators</option>
              ${a.map(p=>`<option value="${p}" ${M.user===p?"selected":""}>@${p}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Date From</label>
            <input type="date" class="form-input" value="${M.dateFrom}" onchange="window.setAuditFilter('dateFrom', this.value)" />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 11px;">Date To</label>
            <input type="date" class="form-input" value="${M.dateTo}" onchange="window.setAuditFilter('dateTo', this.value)" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.resetAuditFilters()" style="height: 38px;">Reset</button>
        </div>
      </div>
    </div>

    <!-- Audit Log Table Card -->
    <div class="card" id="printable-audit-area">
      <!-- Print Only Header -->
      <div class="print-only-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">Apex Stock Management System</h1>
            <h2 style="font-size: 15px; font-weight: 600; color: #0057E7;">System Security & Activity Audit Log</h2>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Generated: <strong>${t}</strong></div>
            <div>Auditor: <strong>${(o==null?void 0:o.fullName)||"System User"}</strong> [${(o==null?void 0:o.role)||"VIEWER"}]</div>
          </div>
        </div>
      </div>

      <div class="card-header">
        <div class="card-title">
          <svg style="width: 18px; height: 18px; stroke: var(--primary);" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>
          Audit Activity Journal
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-neutral" style="font-size: 11.5px;">Showing <strong>${i.length}</strong> of ${l} logged events</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Log Ref</th>
              <th>Date & Time</th>
              <th>Operator</th>
              <th>Module</th>
              <th>Action Code</th>
              <th>Target Record</th>
              <th>Event Narrative</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${i.length===0?`
              <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px;">No audit events match current search and filter parameters.</td></tr>
            `:i.map(p=>{const u=(p.username||"SY").slice(0,2).toUpperCase();return`
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 12px;">
                      ${p.id}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">
                    ${p.dateTime}
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background: var(--surface-alt); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--text-main);">
                        ${u}
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 12.5px;">@${p.username}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-family: monospace;">${p.userId||""}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-neutral" style="font-weight: 600; font-size: 11px;">
                      ${p.module}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${p.action.includes("IN")?"badge-in-stock":p.action.includes("OUT")?"badge-out-of-stock":p.action.includes("ADJUST")?"badge-low-stock":p.action.includes("USER")||p.action.includes("PASSWORD")?"badge-primary":"badge-neutral"}" style="font-size: 10.5px;">
                      ${p.action}
                    </span>
                  </td>
                  <td>
                    <code style="font-size: 11.5px; background: var(--surface-alt); padding: 2px 6px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                      ${p.recordId}
                    </code>
                  </td>
                  <td>
                    <div style="font-size: 12.5px; color: var(--text-main); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.description}">
                      ${p.description}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewAuditEventDetails('${p.id}')" title="Inspect full audit record">
                      Inspect
                    </button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.viewAuditEventDetails=function(o){const t=Z.find(n=>n.id===o);if(!t)return;const e=q.find(n=>n.username===t.username||n.userId===t.userId);window.openModal({title:`Audit Dossier: ${t.id}`,body:`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Log Reference</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--primary); font-family: monospace;">${t.id}</div>
          </div>
          <div>
            <span class="badge ${t.action.includes("IN")?"badge-in-stock":t.action.includes("OUT")?"badge-out-of-stock":t.action.includes("ADJUST")?"badge-low-stock":t.action.includes("USER")||t.action.includes("PASSWORD")?"badge-primary":"badge-neutral"}">
              ${t.action}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div><strong style="color: var(--text-muted);">Timestamp:</strong> <div>${t.dateTime}</div></div>
          <div><strong style="color: var(--text-muted);">Module Affected:</strong> <div><strong>${t.module}</strong></div></div>
          <div><strong style="color: var(--text-muted);">Operator Username:</strong> <div>@${t.username}</div></div>
          <div><strong style="color: var(--text-muted);">Operator Identity:</strong> <div>${e?`${e.fullName} [${e.role}]`:t.userId||"System"}</div></div>
          <div><strong style="color: var(--text-muted);">Target Record ID:</strong> <div><code>${t.recordId}</code></div></div>
          <div><strong style="color: var(--text-muted);">Integrity State:</strong> <div style="color: var(--success); font-weight: 600;">✓ Verified Authentic</div></div>
        </div>

        <div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Event Narrative:</div>
          <div style="padding: 12px 14px; background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-main); line-height: 1.6;">
            ${t.description}
          </div>
        </div>

        <div style="font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; border-top: 1px solid var(--border); padding-top: 10px;">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: var(--primary); fill: none; stroke-width: 2;"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>Immutable audit record registered in Google Sheets <code>Audit_Log</code> master ledger.</span>
        </div>
      </div>
    `,primaryText:"Close Dossier",onPrimary:()=>window.closeModal()})};window.setAuditFilter=function(o,t){M[o]=t;const e=document.getElementById("view-content");e&&(e.innerHTML=bt())};window.resetAuditFilters=function(){M={search:"",module:"ALL",action:"ALL",user:"ALL",dateFrom:"",dateTo:new Date().toISOString().slice(0,10)};const o=document.getElementById("view-content");o&&(o.innerHTML=bt())};window.refreshAuditTrail=async function(){window.showToast("Synchronizing audit trail with database...","info"),await Ot(),window.showToast("Audit trail refreshed successfully.","success");const o=document.getElementById("view-content");o&&(o.innerHTML=bt())};window.printAuditTrail=function(){window.print()};window.exportAuditCSV=function(){var i,l;const o=new Date().toISOString().slice(0,10),e="data:text/csv;charset=utf-8,"+[["Apex Stock Management System - Official Security & Activity Audit Trail"],["Generated On",new Date().toISOString()],["Generated By",`${((i=v.getUser())==null?void 0:i.fullName)||"System User"} (${((l=v.getUser())==null?void 0:l.role)||"VIEWER"})`],[],["Log ID","Timestamp","Operator User","User ID","Module","Action Code","Target Record ID","Event Description"],...Z.map(r=>[r.id,r.dateTime,r.username,r.userId||"",r.module,r.action,r.recordId,`"${String(r.description||"").replace(/"/g,'""')}"`])].map(r=>r.join(",")).join(`
`),n=encodeURI(e),a=document.createElement("a");a.setAttribute("href",n),a.setAttribute("download",`Audit_Trail_${o}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a),window.showToast("Audit trail exported to CSV.","success")};class Rt{constructor(){this.routes={dashboard:yt,inventory:tt,products:tt,categories:ct,"stock-in":mt,"stock-out":gt,adjustment:ht,suppliers:dt,locations:rt,reports:xt,users:lt,settings:At,"audit-log":bt},this.currentRoute="dashboard"}init(){window.addEventListener("hashchange",()=>this.handleRoute()),window.addEventListener("DOMContentLoaded",()=>{this.initShellEvents(),this.handleRoute()})}navigate(t){window.location.hash=`#${t}`}handleRoute(){let t=window.location.hash.replace("#","").trim();if(t||(t="dashboard"),t==="logout"){v.logout(),window.showToast("You have been logged out securely.","info"),this.navigate("login");return}if(t==="login"){this.renderLoginView();return}if(!v.isAuthenticated()){this.navigate("login");return}const e=document.getElementById("app-shell"),n=document.getElementById("login-shell");if(e&&n&&(e.style.display="flex",n.style.display="none"),this.currentRoute=t,!v.canAccessRoute(t)){const r=v.getUser(),s=document.getElementById("view-content");s&&(s.innerHTML=`
          <div class="page-header">
            <div class="page-title-group">
              <h1>Access Restricted</h1>
              <p>Security Privilege Policy</p>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 60px 24px; max-width: 600px; margin: 40px auto;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--danger-light); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: currentColor; fill: none; stroke-width: 2;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Unauthorized Access (403)</h2>
            <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
              Your current account role <strong style="color: var(--primary);">[${(r==null?void 0:r.role)||"VIEWER"}]</strong> does not have clearance to view or perform operations in the <strong>${t.replace("-"," ").toUpperCase()}</strong> module.
            </p>
            <div>
              <button class="btn btn-primary" onclick="window.router.navigate('dashboard')">
                <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Return to Executive Dashboard
              </button>
            </div>
          </div>
        `),this.updateActiveNav("dashboard");return}this.updateActiveNav(t);const a=document.getElementById("view-content");if(a){const r=this.routes[t]||yt;a.innerHTML=r(),window.scrollTo(0,0)}const i=document.querySelector(".sidebar"),l=document.querySelector(".sidebar-overlay");i&&i.classList.remove("mobile-open"),l&&l.classList.remove("active")}updateActiveNav(t){const e=v.getUser();document.querySelectorAll(".sidebar-nav .nav-item").forEach(a=>{const i=a.getAttribute("data-route");v.canAccessRoute(i)?a.style.display="flex":a.style.display="none",i===t?a.classList.add("active"):a.classList.remove("active")}),document.querySelectorAll(".sidebar-nav .nav-section-title").forEach(a=>{let i=a.nextElementSibling,l=!1;for(;i&&!i.classList.contains("nav-section-title");){if(i.style.display!=="none"){l=!0;break}i=i.nextElementSibling}a.style.display=l?"block":"none"});const n=document.getElementById("header-breadcrumb");if(n){const a=t.replace("-"," ").toUpperCase();n.textContent=a}if(e){const a=document.getElementById("shell-user-name"),i=document.getElementById("shell-user-role"),l=document.getElementById("shell-user-avatar");a&&(a.textContent=e.fullName),i&&(i.textContent=e.role.replace("_"," ")),l&&(l.textContent=e.fullName.split(" ").map(r=>r[0]).join(""))}}renderLoginView(){const t=document.getElementById("app-shell"),e=document.getElementById("login-shell");t&&e&&(t.style.display="none",e.style.display="flex")}initShellEvents(){const t=document.getElementById("mobile-menu-btn"),e=document.querySelector(".sidebar"),n=document.querySelector(".sidebar-overlay");t&&e&&n&&(t.addEventListener("click",()=>{e.classList.toggle("mobile-open"),n.classList.toggle("active")}),n.addEventListener("click",()=>{e.classList.remove("mobile-open"),n.classList.remove("active")}));const a=document.getElementById("global-search-input");a&&a.addEventListener("keydown",i=>{if(i.key==="Enter"){const l=a.value.trim();this.navigate("inventory"),setTimeout(()=>{var r;(r=window.handleInventorySearch)==null||r.call(window,l)},50)}}),window.updateHeaderApiStatus()}}window.updateHeaderApiStatus=async function(){const o=document.getElementById("header-status-badge"),t=document.getElementById("header-status-dot"),e=document.getElementById("header-status-text");if(!(!o||!t||!e)){if(!window.api||!window.api.isConfigured()){o.className="system-status-indicator is-demo",t.className="status-dot dot-warning",e.textContent="🟡 Demo Mode",o.title="Running on local demo data. Click to connect your live Google Sheets database!";return}o.className="system-status-indicator",t.className="status-dot",e.textContent="Checking API...";try{const n=await window.api.ping();n&&n.success?(o.className="system-status-indicator is-live",t.className="status-dot",e.textContent="🟢 Google Sheets Live",o.title="Connected live to Google Sheets database. Click to manage connection."):(o.className="system-status-indicator is-error",t.className="status-dot dot-danger",e.textContent="🔴 API Disconnected",o.title="API responded with error. Click to test or update URL.")}catch{o.className="system-status-indicator is-error",t.className="status-dot dot-danger",e.textContent="🔴 Connection Offline",o.title="Could not reach Google Apps Script Web App. Click to configure."}}};window.openApiStatusModal=function(){const o=window.api?window.api.getApiUrl():"",t=window.api&&window.api.isConfigured();window.openModal({title:"Google Sheets Database Connection",body:`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: ${t?"var(--success-light)":"var(--warning-light)"}; border: 1px solid ${t?"var(--success-border)":"var(--warning-border)"}; border-radius: var(--radius-md);">
          <div>
            <div style="font-weight: 700; font-size: 14px; color: ${t?"var(--success-text)":"var(--warning-text)"};">
              ${t?"✅ Live Google Sheets Configured":"⚡ Demo Mode Active"}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${t?"All inventory operations synchronize live with your Google Spreadsheet.":"Operating on in-memory mock data. Connect your Google Apps Script Web App below."}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="modal-api-url">Google Apps Script Web App URL <span class="required-star">*</span></label>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <input 
              type="url" 
              id="modal-api-url" 
              class="form-input" 
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec" 
              value="${o}"
              style="flex: 1;"
            />
            <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-test-api" onclick="window.testModalApiConnection()">
              Test Ping
            </button>
          </div>
          <div class="form-hint" style="margin-top: 4px;">Must end in <code>/exec</code> and have permissions set to "Execute as Me" and "Access: Anyone".</div>
        </div>

        <div id="modal-api-test-result" style="display: none; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px;"></div>

        <div style="border-top: 1px solid var(--border); padding-top: 12px;">
          <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main); margin-bottom: 6px;">📋 3-Step Setup Instructions:</div>
          <ol style="font-size: 12px; color: var(--text-muted); line-height: 1.6; padding-left: 18px;">
            <li>Open your Google Sheet: <a href="https://docs.google.com/spreadsheets/d/1JBdQ-LVjBMvCiKxC8SH11bzDksPnIdmMFpXHNXasREM/edit" target="_blank" style="font-weight: 600;">Stock_Management_Database</a></li>
            <li>In Google Sheets, open <strong>Extensions → Apps Script</strong> and paste <code>backend/UNIFIED_BACKEND_SUITE.gs</code> into <code>Code.gs</code>.</li>
            <li>Click <strong>Deploy → New deployment → Web app</strong> (Access: Anyone) and paste the URL here.</li>
          </ol>
        </div>
      </div>
    `,primaryText:"Save & Synchronize",onPrimary:()=>{const e=document.getElementById("modal-api-url"),n=e?e.value.trim():"";if(n&&(n.includes("script.googleusercontent.com")||n.includes("/echo"))){window.showToast("⚠️ Echo URL detected! Please copy the Web App URL from Apps Script (Deploy > Manage deployments) ending in /exec.","warning",9e3);return}window.api&&window.api.setApiUrl(n),window.updateHeaderApiStatus(),window.closeModal(),window.showToast(n?"Google Apps Script Web App URL updated! Synchronizing data...":"Switched to Demo Mode.","success"),window.router&&window.router.handleRoute()}})};window.testModalApiConnection=async function(){const o=document.getElementById("modal-api-url"),t=document.getElementById("btn-modal-test-api"),e=document.getElementById("modal-api-test-result"),n=o?o.value.trim():"";if(!n){e&&(e.style.display="block",e.style.background="var(--danger-light)",e.style.color="var(--danger-text)",e.style.border="1px solid var(--danger-border)",e.textContent="❌ Please enter a Google Apps Script Web App URL.");return}if(n.includes("script.googleusercontent.com")||n.includes("/echo")){e&&(e.style.display="block",e.style.background="var(--warning-light)",e.style.color="var(--warning-text)",e.style.border="1px solid var(--warning-border)",e.innerHTML='⚠️ <strong>Redirected Echo URL detected!</strong><br>When you open the Web App URL in your browser, Google redirects to <code>script.googleusercontent.com</code>.<br><br>👉 <strong>How to get the correct URL:</strong><br>1. In Google Apps Script, click <strong>Deploy → Manage deployments</strong>.<br>2. Under "Web app", copy the <strong>URL</strong>.<br>3. It must start with: <code>https://script.google.com/macros/s/.../exec</code>');return}if(!n.startsWith("https://script.google.com/")){e&&(e.style.display="block",e.style.background="var(--danger-light)",e.style.color="var(--danger-text)",e.style.border="1px solid var(--danger-border)",e.textContent="❌ Please enter a valid Google Apps Script Web App URL (starts with https://script.google.com/macros/s/.../exec).");return}t&&(t.disabled=!0,t.textContent="Testing..."),e&&(e.style.display="block",e.style.background="var(--surface-alt)",e.style.color="var(--text-main)",e.style.border="1px solid var(--border)",e.textContent="⏳ Pinging Google Apps Script endpoint...");const a=window.api.getApiUrl();window.api.setApiUrl(n);try{const i=await window.api.ping();if(i&&i.success)e&&(e.style.background="var(--success-light)",e.style.color="var(--success-text)",e.style.border="1px solid var(--success-border)",e.innerHTML=`✅ <strong>Connected successfully!</strong> Database responded at ${i.timestamp||new Date().toLocaleTimeString()}. Click "Save & Synchronize" below to activate.`);else throw new Error((i==null?void 0:i.message)||"Ping was not acknowledged.")}catch(i){window.api.setApiUrl(a),e&&(e.style.background="var(--danger-light)",e.style.color="var(--danger-text)",e.style.border="1px solid var(--danger-border)",e.innerHTML=`❌ <strong>Connection failed:</strong> ${i.message}<br><small style="color: var(--text-muted);">Ensure the Web App deployment is configured with <em>"Who has access: Anyone"</em>.</small>`)}finally{t&&(t.disabled=!1,t.textContent="Test Ping")}};const Lt=new Rt;window.router=Lt;Lt.init();window.showToast=function(o,t="info"){let e=document.getElementById("toast-container");e||(e=document.createElement("div"),e.id="toast-container",e.className="toast-container",document.body.appendChild(e));const n=document.createElement("div");n.className=`toast toast-${t}`;const a=t==="success"?'<svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>':t==="error"?'<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>':t==="warning"?'<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>';n.innerHTML=`${a}<span>${o}</span>`,e.appendChild(n),setTimeout(()=>{n.style.transition="opacity 0.3s ease, transform 0.3s ease",n.style.opacity="0",n.style.transform="translateX(100%)",setTimeout(()=>n.remove(),300)},3500)};window.openModal=function({title:o,body:t,primaryText:e="Confirm",onPrimary:n=null}){let a=document.getElementById("modal-backdrop");a||(a=document.createElement("div"),a.id="modal-backdrop",a.className="modal-backdrop",a.innerHTML=`
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title" id="modal-title">Dialog</div>
          <button class="modal-close-btn" onclick="window.closeModal()">✕</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer" id="modal-footer"></div>
      </div>
    `,document.body.appendChild(a),a.addEventListener("click",l=>{l.target===a&&window.closeModal()})),document.getElementById("modal-title").textContent=o,document.getElementById("modal-body").innerHTML=t;const i=document.getElementById("modal-footer");i.innerHTML=`
    <button class="btn btn-secondary btn-sm" onclick="window.closeModal()">Cancel</button>
    <button class="btn btn-primary btn-sm" id="modal-primary-btn">${e}</button>
  `,document.getElementById("modal-primary-btn").onclick=()=>{n?n():window.closeModal()},a.classList.add("open")};window.closeModal=function(){const o=document.getElementById("modal-backdrop");o&&o.classList.remove("open")};window.handleLoginSubmit=async function(o){var i,l,r;o.preventDefault();const t=(i=document.getElementById("login-username"))==null?void 0:i.value,e=(l=document.getElementById("login-password"))==null?void 0:l.value,n=(r=document.getElementById("login-remember"))==null?void 0:r.checked,a=document.getElementById("btn-login-submit");a&&(a.disabled=!0,a.innerHTML='<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Authenticating...');try{const s=await v.login(t,e,n);a&&(a.disabled=!1,a.textContent="Sign In to Portal"),s.success?(window.showToast(`Welcome back, ${s.user.fullName}!`,"success"),window.router.navigate("dashboard")):window.showToast(s.message,"error")}catch(s){a&&(a.disabled=!1,a.textContent="Sign In to Portal"),window.showToast(s.message||"Authentication failed.","error")}};window.quickLogin=function(o){var l;const t={admin:["admin","admin123"],manager:["manager","mgr123"],viewer:["viewer","view123"]},[e,n]=t[o]||["admin","admin123"],a=document.getElementById("login-username"),i=document.getElementById("login-password");a&&i&&(a.value=e,i.value=n,(l=document.getElementById("login-form"))==null||l.dispatchEvent(new Event("submit",{cancelable:!0})))};window.togglePasswordVisibility=function(){const o=document.getElementById("login-password");o&&(o.type=o.type==="password"?"text":"password")};
