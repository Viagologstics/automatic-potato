import React, { useState } from 'react';

// ==========================================
// [CODE: A1] GLOBAL STATIC DATA & SUMMARY SOURCE
// ==========================================
const VEHICLE_RAW_DATA = [
  // Current Month Trips (June 2026)
  { date: '2026-06-15', type: '20ftAdhoc', id: 'KA03AE 8109', trips: 1, revenue: 4000, cost: 2311, emi: 0, received: 0, pending: 4000, kms: 75 },
  { date: '2026-06-19', type: '20ftAdhoc', id: 'KA03AE 8109', trips: 1, revenue: 4000, cost: 2312, emi: 0, received: 0, pending: 4000, kms: 75 },
  { date: '2026-06-05', type: '20ftAdhoc', id: 'KA03AF 2710', trips: 3, revenue: 36250, cost: 33888, emi: 0, received: 0, pending: 36250, kms: 1350 },
  { date: '2026-06-10', type: '32ftAdhoc', id: 'KA52C 7717', trips: 6, revenue: 191070, cost: 215846, emi: 50250, received: 148970, pending: 42100, kms: 5083 },
  { date: '2026-06-12', type: '32ftAdhoc', id: 'KA52C 7719', trips: 3, revenue: 129500, cost: 152996, emi: 50250, received: 65900, pending: 63600, kms: 3900 },
  { date: '2026-06-14', type: 'ReeferAdhoc', id: 'KA52C 7856', trips: 16, revenue: 64302, cost: 64215, emi: 27750, received: 14500, pending: 49802, kms: 1473 },
  
  // Previous Month Trips (May 2026)
  { date: '2026-05-02', type: '20ftAdhoc', id: 'KA03AF 2710', trips: 10, revenue: 121340, cost: 116309, emi: 0, received: 38340, pending: 83000, kms: 3675 },
  { date: '2025-05-15', type: '32ftAdhoc', id: 'KA52C 7717', trips: 5, revenue: 140300, cost: 189006, emi: 67000, received: 122275, pending: 18025, kms: 3417 },
  { date: '2026-05-18', type: '32ftAdhoc', id: 'KA52C 7719', trips: 11, revenue: 242700, cost: 285701, emi: 67000, received: 226474, pending: 16226, kms: 6496 },
  { date: '2026-05-20', type: 'ReeferAdhoc', id: 'KA52C 7856', trips: 8, revenue: 32000, cost: 28062, emi: 9250, received: 0, pending: 32000, kms: 597 },
];

const CUSTOMER_RAW_DATA = [
  { name: 'ABLE COLD CHAIN LOGISTICS', trips: 20, revenue: 80000, cost: 73201.58, emi: 27750, received: 4000, pending: 76000 },
  { name: 'BLACKBUCK', trips: 20, revenue: 522460, cost: 633773.92, emi: 167500, received: 434259, pending: 88201 },
  { name: 'NIPPON EXPRESS', trips: 12, revenue: 118500, cost: 108624.57, emi: 0, received: 0, pending: 118500 },
  { name: 'FREIGHT TIGER', trips: 3, revenue: 100500, cost: 99824.8, emi: 16750, received: 76900, pending: 23600 },
  { name: 'FIRST CLUB', trips: 2, revenue: 10500, cost: 0, emi: 0, received: 10500, pending: 0 },
  { name: 'HARISH TRANSPORT', trips: 1, revenue: 7000, cost: 4342.68, emi: 0, received: 0, pending: 7000 },
  { name: 'SS TRANSPORT', trips: 1, revenue: 33000, cost: 28757, emi: 16750, received: 33000, pending: 0 },
  { name: 'LOBB', trips: 1, revenue: 25000, cost: 4321, emi: 0, received: 0, pending: 25000 },
  { name: 'SHIVOM LOGISTCS', trips: 1, revenue: 43700, cost: 55812.6, emi: 16750, received: 38800, pending: 4900 },
  { name: 'Moglix', trips: 1, revenue: 19000, cost: 62912, emi: 16750, received: 19000, pending: 0 },
];

export default function App() {
  // ==========================================
  // [CODE: A2] APP STATE MANAGER
  // ==========================================
  const [activePage, setActivePage] = useState('vehicles'); // 'vehicles' | 'customers'
  const [timePeriod, setTimePeriod] = useState('current');  // 'current' | 'previous' | 'overall' | 'custom'
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  // ==========================================
  // [CODE: A3] GENERAL UTILITY FUNCTIONS
  // ==========================================
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);

  // ==========================================
  // [CODE: B1] DATE RANGE FILTER LOGIC
  // ==========================================
  const getFilteredTrips = () => {
    let start = startDate;
    let end = endDate;

    if (timePeriod === 'current') {
      start = '2026-06-01';
      end = '2026-06-30';
    } else if (timePeriod === 'previous') {
      start = '2026-05-01';
      end = '2026-05-31';
    } else if (timePeriod === 'overall') {
      start = '2026-05-01';
      end = '2026-06-26';
    }

    // Filter individual data objects across dates
    return VEHICLE_RAW_DATA.filter(trip => trip.date >= start && trip.date <= end);
  };

  // ==========================================
  // [CODE: B2] CALCULATIONS: CONSOLIDATE BY UNIQUE VEHICLE
  // ==========================================
  const filteredTrips = getFilteredTrips();
  
  const vehicleMap = {};
  filteredTrips.forEach(trip => {
    if (!vehicleMap[trip.id]) {
      vehicleMap[trip.id] = { ...trip, trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0 };
    }
    vehicleMap[trip.id].trips += trip.trips;
    vehicleMap[trip.id].revenue += trip.revenue;
    vehicleMap[trip.id].cost += trip.cost;
    vehicleMap[trip.id].emi += trip.emi;
    vehicleMap[trip.id].received += trip.received;
    vehicleMap[trip.id].pending += trip.pending;
    vehicleMap[trip.id].kms += trip.kms;
  });
  const consolidatedVehicleRows = Object.values(vehicleMap);

  // ==========================================
  // [CODE: B3] CALCULATIONS: GRAND TOTALS
  // ==========================================
  const vehicleTotals = consolidatedVehicleRows.reduce((acc, row) => {
    acc.trips += row.trips; acc.revenue += row.revenue; acc.cost += row.cost;
    acc.emi += row.emi; acc.received += row.received; acc.pending += row.pending; acc.kms += row.kms;
    return acc;
  }, { trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0 });

  const customerTotals = CUSTOMER_RAW_DATA.reduce((acc, row) => {
    acc.trips += row.trips; acc.revenue += row.revenue; acc.cost += row.cost;
    acc.emi += row.emi; acc.received += row.received; acc.pending += row.pending;
    return acc;
  }, { trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0 });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* ==========================================
          [CODE: C1] UI PRESENTATION: SIDEBAR
         ========================================== */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '32px', color: '#38bdf8' }}>Viago Express</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActivePage('vehicles')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', backgroundColor: activePage === 'vehicles' ? '#1e293b' : 'transparent', color: activePage === 'vehicles' ? '#38bdf8' : '#94a3b8', fontWeight: activePage === 'vehicles' ? 'bold' : 'normal' }}>🚚 Adhoc Vehicles Summary</button>
          <button onClick={() => setActivePage('customers')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', backgroundColor: activePage === 'customers' ? '#1e293b' : 'transparent', color: activePage === 'customers' ? '#38bdf8' : '#94a3b8', fontWeight: activePage === 'customers' ? 'bold' : 'normal' }}>👥 Customer Ad-hoc Summary</button>
        </nav>
      </aside>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, padding: '32px' }}>
        
        {/* ==========================================
            [CODE: C2] UI PRESENTATION: MAIN HEADER
           ========================================== */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {activePage === 'vehicles' ? 'Ad-hoc Vehicles Performance' : 'Customer Ad-hoc Performance Overview'}
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
              Timeline View: {timePeriod === 'custom' ? `${startDate} to ${endDate}` : `${timePeriod.toUpperCase()} PRESET`}
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '20px' }}>Data Last Updated: 20/06/2026</span>
        </header>

        {/* ==========================================
            [CODE: C3] UI PRESENTATION: FILTER CONTROLS
           ========================================== */}
        <div style={{ display: 'flex', gap: '16px', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
            {['current', 'previous', 'overall', 'custom'].map((p) => (
              <button key={p} onClick={() => setTimePeriod(p)} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', backgroundColor: timePeriod === p ? '#fff' : 'transparent', color: timePeriod === p ? '#0f172a' : '#64748b' }}>
                {p === 'current' ? 'Current Month' : p === 'previous' ? 'Previous Month' : p === 'overall' ? 'Overall' : 'Custom Range'}
              </button>
            ))}
          </div>

          {timePeriod === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <span style={{ color: '#64748b' }}>to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          )}
        </div>

        {/* ==========================================
            [CODE: D1] VIEW PANEL: VEHICLES TABLE
           ========================================== */}
        {activePage === 'vehicles' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                  <th style={{ padding: '14px 16px' }}>Vehicle Type</th>
                  <th style={{ padding: '14px 16px' }}>Vehicle No.</th>
                  <th style={{ padding: '14px 16px' }}>Trip Count</th>
                  <th style={{ padding: '14px 16px' }}>Revenue</th>
                  <th style={{ padding: '14px 16px' }}>Cost</th>
                  <th style={{ padding: '14px 16px' }}>EMI</th>
                  <th style={{ padding: '14px 16px' }}>Net Profit</th>
                  <th style={{ padding: '14px 16px' }}>Received</th>
                  <th style={{ padding: '14px 16px' }}>Pending</th>
                  <th style={{ padding: '14px 16px' }}>Kms</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedVehicleRows.map((row) => {
                  const netProfit = row.revenue - row.cost - row.emi;
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{row.type}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{row.id}</td>
                      <td style={{ padding: '14px 16px' }}>{row.trips}</td>
                      <td style={{ padding: '14px 16px', color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>
                      <td style={{ padding: '14px 16px', color: '#e11d48' }}>₹{formatCurrency(row.cost)}</td>
                      <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.emi)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: netProfit >= 0 ? '#16a34a' : '#e11d48' }}>
                        {netProfit < 0 ? '-' : ''}₹{formatCurrency(Math.abs(netProfit))}
                      </td>
                      <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.received)}</td>
                      <td style={{ padding: '14px 16px', color: row.pending > 0 ? '#d97706' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>
                      <td style={{ padding: '14px 16px' }}>{formatCurrency(row.kms)}</td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
                  <td colSpan="2" style={{ padding: '16px' }}>Grand Total</td>
                  <td>{vehicleTotals.trips}</td>
                  <td style={{ color: '#16a34a' }}>₹{formatCurrency(vehicleTotals.revenue)}</td>
                  <td style={{ color: '#e11d48' }}>₹{formatCurrency(vehicleTotals.cost)}</td>
                  <td>₹{formatCurrency(vehicleTotals.emi)}</td>
                  <td style={{ color: (vehicleTotals.revenue - vehicleTotals.cost - vehicleTotals.emi) >= 0 ? '#16a34a' : '#e11d48' }}>
                    ₹{formatCurrency(vehicleTotals.revenue - vehicleTotals.cost - vehicleTotals.emi)}
                  </td>
                  <td>₹{formatCurrency(vehicleTotals.received)}</td>
                  <td style={{ color: '#d97706' }}>₹{formatCurrency(vehicleTotals.pending)}</td>
                  <td>{formatCurrency(vehicleTotals.kms)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            [CODE: D2] VIEW PANEL: CUSTOMERS TABLE
           ========================================== */}
        {activePage === 'customers' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                  <th style={{ padding: '14px 16px' }}>Sl No.</th>
                  <th style={{ padding: '14px 16px' }}>Customer Name</th>
                  <th style={{ padding: '14px 16px' }}>Trip Count</th>
                  <th style={{ padding: '14px 16px' }}>Total Revenue</th>
                  <th style={{ padding: '14px 16px' }}>Cost</th>
                  <th style={{ padding: '14px 16px' }}>EMI Allocation</th>
                  <th style={{ padding: '14px 16px' }}>Net after EMI</th>
                  <th style={{ padding: '14px 16px' }}>Payment Received</th>
                  <th style={{ padding: '14px 16px' }}>Payment Pending</th>
                </tr>
              </thead>
              <tbody>
                {CUSTOMER_RAW_DATA.map((row, idx) => {
                  const netProfit = row.revenue - row.cost - row.emi;
                  return (
                    <tr key={row.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{idx + 1}.</td>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{row.name}</td>
                      <td>{row.trips}</td>
                      <td style={{ color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>
                      <td style={{ color: '#e11d48' }}>₹{formatCurrency(row.cost)}</td>
                      <td>₹{formatCurrency(row.emi)}</td>
                      <td style={{ fontWeight: '600', color: netProfit >= 0 ? '#16a34a' : '#e11d48' }}>
                        {netProfit < 0 ? '-' : ''}₹{formatCurrency(Math.abs(netProfit))}
                      </td>
                      <td>₹{formatCurrency(row.received)}</td>
                      <td style={{ color: row.pending > 0 ? '#d97706' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
                  <td colSpan="2" style={{ padding: '16px' }}>Grand Total</td>
                  <td>{customerTotals.trips}</td>
                  <td style={{ color: '#16a34a' }}>₹{formatCurrency(customerTotals.revenue)}</td>
                  <td style={{ color: '#e11d48' }}>₹{formatCurrency(customerTotals.cost)}</td>
                  <td>₹{formatCurrency(customerTotals.emi)}</td>
                  <td style={{ color: (customerTotals.revenue - customerTotals.cost - customerTotals.emi) >= 0 ? '#16a34a' : '#e11d48' }}>
                    ₹{formatCurrency(customerTotals.revenue - customerTotals.cost - customerTotals.emi)}
                  </td>
                  <td>₹{formatCurrency(customerTotals.received)}</td>
                  <td style={{ color: '#d97706' }}>₹{formatCurrency(customerTotals.pending)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}