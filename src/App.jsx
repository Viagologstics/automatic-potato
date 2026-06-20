import React, { useState } from 'react';

// ==========================================
// [CODE: A1] INITIAL SEED DATA
// ==========================================
const INITIAL_VEHICLE_RAW_DATA = [
  { date: '2026-06-15', type: '20ftAdhoc', id: 'KA03AE 8109', customer: 'ABLE COLD CHAIN LOGISTICS', trips: 1, revenue: 4000, cost: 2311, emi: 0, received: 0, pending: 4000, kms: 75 },
  { date: '2026-06-19', type: '20ftAdhoc', id: 'KA03AE 8109', customer: 'ABLE COLD CHAIN LOGISTICS', trips: 1, revenue: 4000, cost: 2312, emi: 0, received: 0, pending: 4000, kms: 75 },
  { date: '2026-06-05', type: '20ftAdhoc', id: 'KA03AF 2710', customer: 'BLACKBUCK', trips: 3, revenue: 36250, cost: 33888, emi: 0, received: 0, pending: 36250, kms: 1350 },
  { date: '2026-06-10', type: '32ftAdhoc', id: 'KA52C 7717', customer: 'BLACKBUCK', trips: 6, revenue: 191070, cost: 215846, emi: 50250, received: 148970, pending: 42100, kms: 5083 },
  { date: '2026-06-12', type: '32ftAdhoc', id: 'KA52C 7719', customer: 'NIPPON EXPRESS', trips: 3, revenue: 129500, cost: 152996, emi: 50250, received: 65900, pending: 63600, kms: 3900 },
  { date: '2026-06-14', type: 'ReeferAdhoc', id: 'KA52C 7856', customer: 'FREIGHT TIGER', trips: 16, revenue: 64302, cost: 64215, emi: 27750, received: 14500, pending: 49802, kms: 1473 },
  { date: '2026-05-02', type: '20ftAdhoc', id: 'KA03AF 2710', customer: 'BLACKBUCK', trips: 10, revenue: 121340, cost: 116309, emi: 0, received: 38340, pending: 83000, kms: 3675 },
  { date: '2026-05-15', type: '32ftAdhoc', id: 'KA52C 7717', customer: 'BLACKBUCK', trips: 5, revenue: 140300, cost: 189006, emi: 67000, received: 122275, pending: 18025, kms: 3417 },
  { date: '2026-05-18', type: '32ftAdhoc', id: 'KA52C 7719', customer: 'NIPPON EXPRESS', trips: 11, revenue: 242700, cost: 285701, emi: 67000, received: 226474, pending: 16226, kms: 6496 },
  { date: '2026-05-20', type: 'ReeferAdhoc', id: 'KA52C 7856', customer: 'FREIGHT TIGER', trips: 8, revenue: 32000, cost: 28062, emi: 9250, received: 0, pending: 32000, kms: 597 },
];

export default function App() {
  // ==========================================
  // [CODE: A2] APP STATE MANAGER
  // ==========================================
  const [activePage, setActivePage] = useState('vehicles'); 
  const [timePeriod, setTimePeriod] = useState('current');  
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [showForm, setShowForm] = useState(false);

  // Live Mutable Database State
  const [liveVehicleData, setLiveVehicleData] = useState(INITIAL_VEHICLE_RAW_DATA);

  // [CODE: A2.1] Interactive Form State Hook
  const [formData, setFormData] = useState({
    date: '2026-06-20', type: '20ftAdhoc', id: '', customer: 'ABLE COLD CHAIN LOGISTICS',
    trips: 1, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0
  });

  // ==========================================
  // [CODE: A3] GENERAL UTILITY FUNCTIONS
  // ==========================================
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);

  // ==========================================
  // [CODE: B1] LIVE FILTERS & DATE BOUNDARIES
  // ==========================================
  const getFilteredTrips = () => {
    let start = startDate;
    let end = endDate;

    if (timePeriod === 'current') {
      start = '2026-06-01'; end = '2026-06-30';
    } else if (timePeriod === 'previous') {
      start = '2026-05-01'; end = '2026-05-31';
    } else if (timePeriod === 'overall') {
      start = '2026-05-01'; end = '2026-06-26';
    }
    return liveVehicleData.filter(trip => trip.date >= start && trip.date <= end);
  };

  const filteredTrips = getFilteredTrips();

  // ==========================================
  // [CODE: B2] CALCULATIONS: VEHICLE GROUPING
  // ==========================================
  const vehicleMap = {};
  filteredTrips.forEach(trip => {
    if (!vehicleMap[trip.id]) {
      vehicleMap[trip.id] = { ...trip, trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0 };
    }
    vehicleMap[trip.id].trips += Number(trip.trips);
    vehicleMap[trip.id].revenue += Number(trip.revenue);
    vehicleMap[trip.id].cost += Number(trip.cost);
    vehicleMap[trip.id].emi += Number(trip.emi);
    vehicleMap[trip.id].received += Number(trip.received);
    vehicleMap[trip.id].pending += Number(trip.pending);
    vehicleMap[trip.id].kms += Number(trip.kms);
  });
  const consolidatedVehicleRows = Object.values(vehicleMap);

  // ==========================================
  // [CODE: B2.1] CALCULATIONS: CUSTOMER GROUPING
  // ==========================================
  const customerMap = {};
  filteredTrips.forEach(trip => {
    const cName = trip.customer || 'UNKNOWN CUSTOMER';
    if (!customerMap[cName]) {
      customerMap[cName] = { name: cName, trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0 };
    }
    customerMap[cName].trips += Number(trip.trips);
    customerMap[cName].revenue += Number(trip.revenue);
    customerMap[cName].cost += Number(trip.cost);
    customerMap[cName].emi += Number(trip.emi);
    customerMap[cName].received += Number(trip.received);
    customerMap[cName].pending += Number(trip.pending);
  });
  const consolidatedCustomerRows = Object.values(customerMap);

  // ==========================================
  // [CODE: B3] GRAND TOTAL METRICS
  // ==========================================
  const vehicleTotals = consolidatedVehicleRows.reduce((acc, row) => {
    acc.trips += row.trips; acc.revenue += row.revenue; acc.cost += row.cost;
    acc.emi += row.emi; acc.received += row.received; acc.pending += row.pending; acc.kms += row.kms;
    return acc;
  }, { trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0 });

  const customerTotals = consolidatedCustomerRows.reduce((acc, row) => {
    acc.trips += row.trips; acc.revenue += row.revenue; acc.cost += row.cost;
    acc.emi += row.emi; acc.received += row.received; acc.pending += row.pending;
    return acc;
  }, { trips: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0 });

  // ==========================================
  // [CODE: E1] EVENT HANDLER: LOG NEW TRIP
  // ==========================================
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.id.trim()) return alert("Please enter a valid Vehicle Number.");
    
    // Auto calculate pending balance on submission
    const calculatedPending = Number(formData.revenue) - Number(formData.received);
    const newTrip = { ...formData, pending: calculatedPending };
    
    setLiveVehicleData([newTrip, ...liveVehicleData]);
    setShowForm(false);
    // Reset form field entries
    setFormData({ date: '2026-06-20', type: '20ftAdhoc', id: '', customer: 'ABLE COLD CHAIN LOGISTICS', trips: 1, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, kms: 0 });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* [CODE: C1] SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '32px', color: '#38bdf8' }}>Viago Express</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActivePage('vehicles')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', backgroundColor: activePage === 'vehicles' ? '#1e293b' : 'transparent', color: activePage === 'vehicles' ? '#38bdf8' : '#94a3b8', fontWeight: activePage === 'vehicles' ? 'bold' : 'normal' }}>🚚 Adhoc Vehicles Summary</button>
          <button onClick={() => setActivePage('customers')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', backgroundColor: activePage === 'customers' ? '#1e293b' : 'transparent', color: activePage === 'customers' ? '#38bdf8' : '#94a3b8', fontWeight: activePage === 'customers' ? 'bold' : 'normal' }}>👥 Customer Ad-hoc Summary</button>
        </nav>
      </aside>

      {/* MAIN LAYOUT BOX */}
      <main style={{ flex: 1, padding: '32px' }}>
        
        {/* [CODE: C2] MAIN HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {activePage === 'vehicles' ? 'Ad-hoc Vehicles Performance' : 'Customer Ad-hoc Performance Overview'}
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
              Timeline View: {timePeriod === 'custom' ? `${startDate} to ${endDate}` : `${timePeriod.toUpperCase()} PRESET`}
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            {showForm ? '✖ Close Form' : '➕ Add New Trip Entry'}
          </button>
        </header>

        {/* [CODE: D3] LIVE TRIP LOGGER FORM EXPANSION */}
        {showForm && (
          <form onSubmit={handleFormSubmit} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Date</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Vehicle Type</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}><option>20ftAdhoc</option><option>32ftAdhoc</option><option>ReeferAdhoc</option></select></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Vehicle No.</label><input type="text" placeholder="e.g. KA03AE 8109" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Customer Name</label><select value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}><option>ABLE COLD CHAIN LOGISTICS</option><option>BLACKBUCK</option><option>NIPPON EXPRESS</option><option>FREIGHT TIGER</option><option>Moglix</option></select></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Revenue (₹)</label><input type="number" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Cost (₹)</label><input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>EMI Allocation (₹)</label><input type="number" value={formData.emi} onChange={e => setFormData({...formData, emi: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Payment Received (₹)</label><input type="number" value={formData.received} onChange={e => setFormData({...formData, received: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Kms Traveled</label><input type="number" value={formData.kms} onChange={e => setFormData({...formData, kms: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Record Entry</button></div>
          </form>
        )}

        {/* [CODE: C3] UI PRESENTATION: FILTER CONTROLS */}
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

        {/* [CODE: D1] VIEW PANEL: VEHICLES TABLE */}
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
                {consolidatedVehicleRows.map((row, index) => {
                  const netProfit = row.revenue - row.cost - row.emi;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
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

        {/* [CODE: D2] VIEW PANEL: CUSTOMERS TABLE */}
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
                {consolidatedCustomerRows.map((row, idx) => {
                  const netProfit = row.revenue - row.cost - row.emi;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
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