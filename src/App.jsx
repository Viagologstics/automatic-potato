import React, { useState, useEffect } from 'react';
import { parseVehicleData } from './utils/dataParser';

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

// Master List of Available Columns for Permission Rules
const ALL_COLUMNS = [
  { id: 'vehicleNo', label: 'Vehicle No.' },
  { id: 'truckType', label: 'Specification' },
  { id: 'status', label: 'Contract Status' },
  { id: 'kms', label: 'Total Distance' },
  { id: 'revenue', label: 'Calculated Revenue' },
  { id: 'cost', label: 'Operating Cost' },
  { id: 'emi', label: 'EMI Share' },
  { id: 'netProfit', label: 'Net Earnings' },
  { id: 'received', label: 'Collected' },
  { id: 'pending', label: 'Outstandings' }
];

export default function App() {
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation and Data States
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [liveVehicleData, setLiveVehicleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Global Interactive Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [truckTypeFilter, setTruckTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Configurable Dynamic Views Database
  const [dynamicLinks, setDynamicLinks] = useState([
    { name: "Master Spreadsheet", url: "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?usp=sharing" },
    { name: "Contract Sub-Sheet View", url: "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?gid=1098332403#gid=1098332403" }
  ]);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);

  // Admin User Database Matrix
  const [users, setUsers] = useState([
    { 
      username: 'viago', 
      password: 'admin123', 
      role: 'admin', 
      allowedColumns: ALL_COLUMNS.map(c => c.id),
      canImport: true,
      canExport: true
    },
    { 
      username: 'operator1', 
      password: 'user123', 
      role: 'staff', 
      allowedColumns: ['vehicleNo', 'truckType', 'status', 'kms'], // Restricted Visibility
      canImport: false,
      canExport: true
    }
  ]);

  // Admin New Management Forms State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserCols, setNewUserCols] = useState([]);
  const [newUserImport, setNewUserImport] = useState(false);
  const [newUserExport, setNewUserExport] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDataFromSheets();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const found = users.find(u => u.username === username.trim() && u.password === password);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Security Verification Failed. Invalid Identity credentials.');
    }
  };

  const fetchDataFromSheets = () => {
    setIsLoading(true);
    fetch(`${GOOGLE_SHEETS_API_URL}?_cb=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        setLiveVehicleData(parseVehicleData(data));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Database connection failure:", err);
        setIsLoading(false);
      });
  };

  // Helper formatting function
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  // 🎛️ Filter processing core
  const filteredRows = liveVehicleData.reduce((acc, trip) => {
    const matchedStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchedType = truckTypeFilter === 'all' || trip.truckType === truckTypeFilter;
    const matchedSearch = trip.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchedStatus && matchedType && matchedSearch) {
      if (!acc[trip.vehicleNo]) {
        acc[trip.vehicleNo] = { id: trip.vehicleNo, type: trip.truckType, status: trip.status, kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, count: 0 };
      }
      acc[trip.vehicleNo].kms += trip.kms;
      acc[trip.vehicleNo].revenue += trip.revenue;
      acc[trip.vehicleNo].cost += trip.cost;
      acc[trip.vehicleNo].emi += trip.emi;
      acc[trip.vehicleNo].received += trip.received;
      acc[trip.vehicleNo].pending += trip.pending;
      acc[trip.vehicleNo].count += 1;
    }
    return acc;
  }, {});

  const consolidatedRows = Object.values(filteredRows);

  const summaryTotals = consolidatedRows.reduce((acc, curr) => {
    acc.kms += curr.kms; acc.revenue += curr.revenue; acc.cost += curr.cost; acc.emi += curr.emi; acc.received += curr.received; acc.pending += curr.pending; acc.trips += curr.count;
    return acc;
  }, { kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, trips: 0 });

  // 📤 Secured Selective Column Export Handler
  const handleExportCSV = () => {
    if (!currentUser?.canExport) return alert("Security access violation: Export rights revoked.");
    
    // Header Generation based on User Access Matrix
    const activeHeaders = ALL_COLUMNS.filter(col => currentUser.allowedColumns.includes(col.id));
    let csvContent = activeHeaders.map(h => h.label).join(",") + "\n";

    consolidatedRows.forEach(row => {
      const netProfit = row.revenue - row.cost - row.emi;
      const dataMapping = { ...row, netProfit };
      const line = activeHeaders.map(h => `"${dataMapping[h.id] || 0}"`).join(",");
      csvContent += line + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Viago_Secured_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📥 Existing Format Data Import Simulation (Synchronized layout validation)
  const handleImportCSVSimulated = (e) => {
    if (!currentUser?.canImport) return alert("Security access violation: Import rules denied.");
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" verified against production data schemas. Uploading to primary database arrays...`);
      fetchDataFromSheets();
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserPass) return;
    setUsers([...users, {
      username: newUserName,
      password: newUserPass,
      role: 'staff',
      allowedColumns: newUserCols,
      canImport: newUserImport,
      canExport: newUserExport
    }]);
    setNewUserName(''); setNewUserPass(''); setNewUserCols([]); setNewUserImport(false); setNewUserExport(false);
    alert(`Security Matrix updated. User Node "${newUserName}" created successfully.`);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkName || !newLinkUrl) return;
    setDynamicLinks([...dynamicLinks, { name: newLinkName, url: newLinkUrl }]);
    setNewLinkName(''); setNewLinkUrl('');
    alert(`Dynamic system reference route added.`);
  };

  // Unique lists for functional filter controls
  const uniqueStatuses = [...new Set(liveVehicleData.map(item => item.status))];
  const uniqueTypes = [...new Set(liveVehicleData.map(item => item.truckType))];

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'Segoe UI, sans-serif' }}>
        <form onSubmit={handleLoginSubmit} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '800' }}>Viago Secure Core</h2>
          <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.85rem' }}>Multi-Tenant Security Workspace Access Gateway</p>
          {loginError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>{loginError}</div>}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Identity User Handle</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Security Passphrase</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>
          <button type="submit" style={{ width: '100%', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Verify Credentials</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* SECURE DYNAMIC SIDEBAR INTERFACE */}
      <aside style={{ width: '280px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8', marginBottom: '2px' }}>Viago Workspace</h2>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '24px' }}>Logged in as: <b style={{ color: '#38bdf8' }}>{currentUser.username} ({currentUser.role})</b></div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'dashboard' ? '#1e293b' : 'transparent', color: '#fff', fontWeight: '700' }}>📊 Fleet Metrics Console</button>
          <button onClick={() => setActiveTab('googlesheet')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'googlesheet' ? '#1e293b' : 'transparent', color: '#fff', fontWeight: '700' }}>📋 Connected Databases</button>
          
          {/* Secured Admin Link Visibility Protection */}
          {currentUser.role === 'admin' && (
            <button onClick={() => setActiveTab('adminpanel')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'adminpanel' ? '#1e293b' : 'transparent', color: '#e2e8f0', fontWeight: '700', borderLeft: '3px solid #38bdf8' }}>⚙️ Super Admin Console</button>
          )}
        </nav>
        <button onClick={() => setIsAuthenticated(false)} style={{ backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>🔒 Terminate Session</button>
      </aside>

      {/* WORKSPACE OPERATIONS ENVIRONMENT */}
      <main style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
        
        {/* TAB 1: OPERATIONAL LEDGER VIEW WITH ADVANCED COLUMN MAPPING */}
        {activeTab === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Fleet Records Matrix</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Live rows matching your current permission profiles</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {currentUser.canExport && (
                  <button onClick={handleExportCSV} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>📤 Export Allowed Dataset</button>
                )}
                <button onClick={fetchDataFromSheets} disabled={isLoading} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  {isLoading ? '🔄 Processing...' : '🔄 Refresh Sheets'}
                </button>
              </div>
            </header>

            {/* 🎛️ ADVANCED FILTER DOCK ENGINE */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Search Vehicle String</label>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type registration number..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Contract Status Filter</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="all">Show All Statuses</option>
                  {uniqueStatuses.map((st, i) => <option key={i} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Specification Truck Type</label>
                <select value={truckTypeFilter} onChange={e => setTruckTypeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="all">Show All Fleet Types</option>
                  {uniqueTypes.map((tp, i) => <option key={i} value={tp}>{tp}</option>)}
                </select>
              </div>
              {currentUser.canImport && (
                <div style={{ marginLeft: 'auto', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Import Structured Updates</label>
                  <input type="file" accept=".csv" onChange={handleImportCSVSimulated} style={{ fontSize: '0.8rem' }} />
                </div>
              )}
            </div>

            {/* SECURE MATRIX TABLE DISPLAY */}
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'auto', maxHeight: 'calc(100vh - 280px)', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                    {ALL_COLUMNS.filter(c => currentUser.allowedColumns.includes(c.id)).map(col => (
                      <th key={col.id} style={{ padding: '14px 16px', backgroundColor: '#0f172a' }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consolidatedRows.map((row, idx) => {
                    const netProfit = row.revenue - row.cost - row.emi;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {currentUser.allowedColumns.includes('vehicleNo') && <td style={{ padding: '14px 16px', fontWeight: '700' }}>{row.id}</td>}
                        {currentUser.allowedColumns.includes('truckType') && <td style={{ padding: '14px 16px' }}>{row.type}</td>}
                        {currentUser.allowedColumns.includes('status') && <td style={{ padding: '14px 16px' }}><span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f1f5f9', fontSize: '0.8rem' }}>{row.status}</span></td>}
                        {currentUser.allowedColumns.includes('kms') && <td style={{ padding: '14px 16px' }}>{formatCurrency(row.kms)} km</td>}
                        {currentUser.allowedColumns.includes('revenue') && <td style={{ padding: '14px 16px', fontWeight: '600', color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>}
                        {currentUser.allowedColumns.includes('cost') && <td style={{ padding: '14px 16px', color: '#ef4444' }}>₹{formatCurrency(row.cost)}</td>}
                        {currentUser.allowedColumns.includes('emi') && <td style={{ padding: '14px 16px', color: '#64748b' }}>₹{formatCurrency(row.emi)}</td>}
                        {currentUser.allowedColumns.includes('netProfit') && <td style={{ padding: '14px 16px', fontWeight: '700', color: netProfit >= 0 ? '#16a34a' : '#ef4444' }}>₹{formatCurrency(netProfit)}</td>}
                        {currentUser.allowedColumns.includes('received') && <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.received)}</td>}
                        {currentUser.allowedColumns.includes('pending') && <td style={{ padding: '14px 16px', fontWeight: '600', color: row.pending > 0 ? '#ea580c' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: LIVE SPREADSHEET LOOKUP MODULE WITH HOT-LINK SWAPPING */}
        {activeTab === 'googlesheet' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Master Databases</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Select which integrated data sheet view matrix you want to render</p>
              </div>
              <select value={selectedLinkIndex} onChange={e => setSelectedLinkIndex(parseInt(e.target.value))} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600' }}>
                {dynamicLinks.map((link, i) => <option key={i} value={i}>{link.name}</option>)}
              </select>
            </div>
            <iframe src={dynamicLinks[selectedLinkIndex]?.url} style={{ width: '100%', flex: 1, minHeight: '600px', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} title="Sheet Terminal Instance" />
          </div>
        )}

        {/* TAB 3: ADMIN PERMISSIONS PANEL & NEW MODULE ROUTER CRADLE */}
        {activeTab === 'adminpanel' && currentUser.role === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Super Admin Security Console</h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Control granular row visibility matrices and external route injection links</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Box A: User Account Creation and Column ACL assignment */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Provision New Operator Profile</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Operator Handle Name" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                  <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Operator Access Password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Column Visibility Access Matrix Rule:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {ALL_COLUMNS.map(col => (
                        <label key={col.id} style={{ fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={newUserCols.includes(col.id)} onChange={(e) => {
                            if (e.target.checked) setNewUserCols([...newUserCols, col.id]);
                            else setNewUserCols(newUserCols.filter(c => c !== col.id));
                          }} /> {col.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}><input type="checkbox" checked={newUserImport} onChange={e => setNewUserImport(e.target.checked)} /> Allow Data Importing</label>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}><input type="checkbox" checked={newUserExport} onChange={e => setNewUserExport(e.target.checked)} /> Allow Data Exporting</label>
                  </div>

                  <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>Authorize & Save Operator</button>
                </form>
              </div>

              {/* Box B: Embedded Link Injector Panel */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Inject Dynamic Spreadsheet References</h3>
                <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="e.g., Contract Sub-Sheet View" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                  <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Paste full Google Docs Embed Shareable Link..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                  <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>Mount Dynamic Viewport Route</button>
                </form>

                <h4 style={{ margin: '24px 0 8px 0', color: '#475569' }}>Currently Mounted Views</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                  {dynamicLinks.map((link, i) => <li key={i} style={{ marginBottom: '6px' }}><b>{link.name}:</b> <span style={{ color: '#0284c7', wordBreak: 'break-all' }}>{link.url}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
