import React, { useState, useEffect } from 'react';

// 🔗 Core Infrastructure Webhook Endpoints
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

// ⚠️ PASTE YOUR EMBED LINKS HERE BELOW:
const GOOGLE_SHEETS_EMBED_URL = "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?usp=sharing";

export default function App() {
  // Authentication & Security Gate Layers
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Primary Navigation Configuration
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'googlesheet'
  const [timePeriod, setTimePeriod] = useState('overall');  
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [isLoading, setIsLoading] = useState(true);
  const [liveVehicleData, setLiveVehicleData] = useState([]);

  // Full Screen Mode State
  const [isSheetFullScreen, setIsSheetFullScreen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDataFromSheets();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === 'viago' && password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid security credentials. Verification failed.');
    }
  };

  const fetchDataFromSheets = () => {
    setIsLoading(true);
    fetch(`${GOOGLE_SHEETS_API_URL}?_cb=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(item => {
          const rawDate = String(item["Date"] || '');
          const parseSheetNum = (val) => parseFloat(String(val || '0').replace(/,/g, '')) || 0;

          const openKms = parseSheetNum(item["Opening kms"]);
          const closeKms = parseSheetNum(item["Closing kms"]);
          let kmsRun = parseSheetNum(item["Kms"]);
          if (closeKms > openKms && kmsRun === 0) {
            kmsRun = closeKms - openKms;
          }

          let revenue = parseSheetNum(item["Total"]);
          if (revenue === 0) {
            revenue = parseSheetNum(item["Transportation Charges"]) + parseSheetNum(item["Halting Charges"]);
          }

          const cost = parseSheetNum(item["Cost"]);
          const emi = parseSheetNum(item["EMI"]);
          const received = parseSheetNum(item["Payment Received"]);

          return {
            ...item,
            cleanDate: rawDate,
            vehicleNo: String(item["Vehicle No."] || '').trim(),
            truckType: item["Type Of Truck"] || 'Other',
            status: item["Contract Status"] || item["Trip Status"] || 'COMPLETE',
            kms: kmsRun,
            revenue,
            cost,
            emi,
            received,
            pending: revenue - received
          };
        }).filter(item => 
          item.vehicleNo !== 'UNKNOWN' && 
          item.vehicleNo !== '' && 
          item.vehicleNo !== 'Vehicle No.' && 
          !item.vehicleNo.toLowerCase().includes('total')
        );

        setLiveVehicleData(parsed);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Database sync fault:", err);
        setIsLoading(false);
      });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const parseToTimestamp = (dateStr) => {
    if (!dateStr) return 0;
    const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
    const clean = dateStr.toLowerCase().replace(/[\/-]/g, ' ');
    const parts = clean.split(' ');

    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthLabel = parts[1].substring(0, 3);
      const year = parseInt(parts[2], 10);
      const monthIdx = months[monthLabel] !== undefined ? months[monthLabel] : parseInt(monthLabel, 10) - 1;
      return new Date(year, monthIdx, day).getTime();
    }
    const parsedFallback = Date.parse(dateStr);
    return isNaN(parsedFallback) ? 0 : parsedFallback;
  };

  const filteredTrips = liveVehicleData.filter(trip => {
    if (timePeriod === 'overall') return true;
    const tripTime = parseToTimestamp(trip.cleanDate);
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    return tripTime >= startTime && tripTime <= endTime;
  });

  const vehicleMap = {};
  filteredTrips.forEach(trip => {
    if (!vehicleMap[trip.vehicleNo]) {
      vehicleMap[trip.vehicleNo] = { id: trip.vehicleNo, type: trip.truckType, status: trip.status, kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, count: 0 };
    }
    vehicleMap[trip.vehicleNo].kms += trip.kms;
    vehicleMap[trip.vehicleNo].revenue += trip.revenue;
    vehicleMap[trip.vehicleNo].cost += trip.cost;
    vehicleMap[trip.vehicleNo].emi += trip.emi;
    vehicleMap[trip.vehicleNo].received += trip.received;
    vehicleMap[trip.vehicleNo].pending += trip.pending;
    vehicleMap[trip.vehicleNo].count += 1;
  });
  const consolidatedRows = Object.values(vehicleMap);

  const summaryTotals = consolidatedRows.reduce((acc, curr) => {
    acc.kms += curr.kms; acc.revenue += curr.revenue; acc.cost += curr.cost; acc.emi += curr.emi; acc.received += curr.received; acc.pending += curr.pending; acc.trips += curr.count;
    return acc;
  }, { kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, trips: 0 });

  // 🚪 RENDER LAYER: Access Protection Gate
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'Segoe UI, sans-serif' }}>
        <form onSubmit={handleLoginSubmit} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>Viago Core</h2>
          <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.9rem' }}>Secure Fleet Operations Console Login</p>
          
          {loginError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>{loginError}</div>}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Operator ID</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter user identity" style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Access Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>
          <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}>Authenticate Node</button>
        </form>
      </div>
    );
  }

  // 📊 RENDER LAYER: Authenticated Workspace Command Center
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* GLOBAL APPLICATION CONTROL SIDEBAR */}
      {(!isSheetFullScreen || activeTab !== 'googlesheet') && (
        <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#38bdf8', marginBottom: '4px' }}>Viago Central</h2>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 32px 0' }}>Connected Infrastructure Node</p>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setActiveTab('dashboard')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'dashboard' ? '#1e293b' : 'transparent', color: activeTab === 'dashboard' ? '#38bdf8' : '#94a3b8', fontWeight: '700', width: '100%' }}>📊 Metrics Matrix</button>
              <button onClick={() => setActiveTab('googlesheet')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'googlesheet' ? '#1e293b' : 'transparent', color: activeTab === 'googlesheet' ? '#38bdf8' : '#94a3b8', fontWeight: '700', width: '100%' }}>📋 Master Spreadsheet</button>
            </nav>
          </div>
          
          <button onClick={() => setIsAuthenticated(false)} style={{ backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }}>🔒 Sever Terminal Session</button>
        </aside>
      )}

      {/* PRIMARY WORKSPACE MONITOR DISPLAY */}
      <main style={{ flex: 1, padding: isSheetFullScreen && activeTab === 'googlesheet' ? '0' : '32px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* VIEW TAB 1: OPERATIONAL LEDGER VIEW */}
        {activeTab === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Operational Fleet Ledger</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Compiling live formula tracks from primary spreadsheet database</p>
              </div>
              
              <button 
                onClick={fetchDataFromSheets} 
                disabled={isLoading}
                style={{ 
                  backgroundColor: isLoading ? '#cbd5e1' : '#0284c7', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: '6px', 
                  fontWeight: '700', 
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {isLoading ? '🔄 Syncing...' : '🔄 Refresh Data'}
              </button>
            </header>

            {isLoading && (
              <div style={{ padding: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
                🔄 Re-indexing data arrays...
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
              <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="overall">All Synced Records Ledger View</option>
                <option value="custom">Isolate Timeline Window</option>
              </select>
              {timePeriod === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
                  <span style={{ color: '#64748b' }}>to</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
                </div>
              )}
            </div>

            {/* 📋 FIXED HEIGHT SCROLLABLE CONTAINER FOR THE LEDGER */}
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 240px)', // Keeps the viewport bound safely inside the screen
              position: 'relative'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#0f172a', 
                    color: '#fff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Vehicle No.</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Specification</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Contract Status</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Total Distance</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Calculated Revenue</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Operating Cost</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>EMI Share</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Net Earnings</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Collected</th>
                    <th style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>Outstandings</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedRows.map((row, index) => {
                    const netProfit = row.revenue - row.cost - row.emi;
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700' }}>{row.id}</td>
                        <td style={{ padding: '14px 16px' }}>{row.type}</td>
                        <td style={{ padding: '14px 16px' }}><span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>{row.status}</span></td>
                        <td style={{ padding: '14px 16px' }}>{formatCurrency(row.kms)} km</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>
                        <td style={{ padding: '14px 16px', color: '#ef4444' }}>₹{formatCurrency(row.cost)}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>₹{formatCurrency(row.emi)}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: netProfit >= 0 ? '#16a34a' : '#ef4444' }}>₹{formatCurrency(netProfit)}</td>
                        <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.received)}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: row.pending > 0 ? '#ea580c' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ 
                    backgroundColor: '#f8fafc', 
                    fontWeight: 'bold', 
                    borderTop: '2px solid #0f172a',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <td colSpan="3" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>Total System Volume ({summaryTotals.trips} trips)</td>
                    <td style={{ backgroundColor: '#f8fafc' }}>{formatCurrency(summaryTotals.kms)} km</td>
                    <td style={{ color: '#16a34a', backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.revenue)}</td>
                    <td style={{ color: '#ef4444', backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.cost)}</td>
                    <td style={{ color: '#64748b', backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.emi)}</td>
                    <td style={{ color: (summaryTotals.revenue - summaryTotals.cost - summaryTotals.emi) >= 0 ? '#16a34a' : '#ef4444', backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.revenue - summaryTotals.cost - summaryTotals.emi)}</td>
                    <td style={{ backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.received)}</td>
                    <td style={{ color: '#ea580c', backgroundColor: '#f8fafc' }}>₹{formatCurrency(summaryTotals.pending)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* VIEW TAB 2: LIVE SPREADSHEET LOOKUP MODULE */}
        {activeTab === 'googlesheet' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {!isSheetFullScreen && (
              <>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Master Database Terminal</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>Direct read/write viewport targeting your source spreadsheet</p>
              </>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              padding: '10px 16px', 
              backgroundColor: '#0f172a', 
              borderRadius: isSheetFullScreen ? '0' : '8px 8px 0 0',
              alignItems: 'center'
            }}>
              <button 
                onClick={() => setIsSheetFullScreen(!isSheetFullScreen)} 
                style={{ 
                  backgroundColor: '#38bdf8', 
                  color: '#0f172a', 
                  border: 'none', 
                  padding: '6px 14px', 
                  borderRadius: '4px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {isSheetFullScreen ? '📉 Exit Full Screen' : '🔲 Expand Full Screen'}
              </button>
            </div>

            <iframe 
              src={GOOGLE_SHEETS_EMBED_URL} 
              style={{ 
                width: '100%', 
                flex: 1, 
                minHeight: isSheetFullScreen ? 'calc(100vh - 42px)' : '650px',
                border: 'none', 
                borderRadius: isSheetFullScreen ? '0' : '0 0 8px 8px', 
                backgroundColor: '#fff', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
              }} 
              title="Google Sheets Frame" 
            />
          </div>
        )}

      </main>
    </div>
  );
}
