import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { parseVehicleData } from './utils/dataParser';

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [liveVehicleData, setLiveVehicleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Safe JSON Parsing for Links to eliminate white screens
  const [dynamicLinks, setDynamicLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('viago_links');
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse links:", e);
    }
    return [
      { id: 'link_0', name: "Master Spreadsheet", url: "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?usp=sharing" }
    ];
  });

  // Safe JSON Parsing for Users to eliminate white screens
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('viago_users');
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse users:", e);
    }
    return [
      { username: 'viago', password: 'admin123', role: 'admin', allowedColumns: ALL_COLUMNS.map(c => c.id), canImport: true, canExport: true },
      { username: 'operator1', password: 'user123', role: 'staff', allowedColumns: ['vehicleNo', 'truckType', 'status', 'kms'], canImport: false, canExport: true }
    ];
  });

  // Keep Storage Synchronized safely
  useEffect(() => {
    try {
      localStorage.setItem('viago_users', JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users:", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('viago_links', JSON.stringify(dynamicLinks));
    } catch (e) {
      console.error("Failed to save links:", e);
    }
  }, [dynamicLinks]);

  useEffect(() => {
    if (isAuthenticated) fetchDataFromSheets();
  }, [isAuthenticated]);

  const fetchDataFromSheets = () => {
    setIsLoading(true);
    fetch(`${GOOGLE_SHEETS_API_URL}?_cb=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        setLiveVehicleData(parseVehicleData(data));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Data fetch error:", err);
        setIsLoading(false);
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    const matched = users.find(u => 
      u && u.username && u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid identity credentials.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '360px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <h3 style={{ margin: '0 0 4px 0', textAlign: 'center', fontSize: '1.4rem', color: '#0f172a' }}>Viago Express</h3>
          <p style={{ margin: '0 0 20px 0', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>Secure Fleet Operations Console Login</p>
          
          {loginError && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>{loginError}</p>}
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>Operator ID</label>
            <input type="text" placeholder="Enter user identity" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>Access Password</label>
            <input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Authenticate Node</button>
        </form>
      </div>
    );
  }

  const currentDynamicLink = dynamicLinks.find(link => link && link.id === activeTab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <Sidebar 
  activeTab={activeTab} 
  setActiveTab={setActiveTab} 
  currentUser={currentUser} 
  dynamicLinks={dynamicLinks} 
  onLogout={() => setIsAuthenticated(false)} 
/>
      {/* --- Navigation Workspace View Router --- */}
<main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#f1f5f9' }}>
  
  {/* Fleet Console Workspace */}
  {activeTab === 'dashboard' && (currentUser?.allowedPages || []).includes('dashboard') && (
    <Dashboard 
      currentUser={currentUser}
      ALL_COLUMNS={ALL_COLUMNS}
      consolidatedRows={consolidatedRows}
      onRefresh={handleRefreshPipeline}
      isLoading={isLoading}
      apiEndpoint={API_ENDPOINT}
      dynamicLinks={dynamicLinks}
    />
  )}

  {/* Admin Control Tower Panel */}
  {activeTab === 'admin' && currentUser?.role === 'admin' && (
    <AdminPanel 
      ALL_COLUMNS={ALL_COLUMNS}
      users={users}
      setUsers={setUsers}
      dynamicLinks={dynamicLinks}
      setDynamicLinks={setDynamicLinks}
    />
  )}

  {/* Dynamically Mounted Connected Sheets pages */}
  {dynamicLinks.map(link => {
    const isPagePermitted = (currentUser?.allowedPages || []).includes(link.id) || currentUser?.role === 'admin';
    if (activeTab === link.id && isPagePermitted) {
      return (
        <div key={link.id} style={{ width: '100%', height: '100%', minHeight: '80vh' }}>
          <iframe 
            src={link.url} 
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
            title={link.name}
          />
        </div>
      );
    }
    return null;
  })}
</main>        {activeTab === 'dashboard' && (
          <Dashboard liveVehicleData={liveVehicleData} currentUser={currentUser} ALL_COLUMNS={ALL_COLUMNS} onRefresh={fetchDataFromSheets} isLoading={isLoading} apiEndpoint={GOOGLE_SHEETS_API_URL} />
        )}
        {currentDynamicLink && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>{currentDynamicLink.name}</h1>
            <iframe src={currentDynamicLink.url} style={{ width: '100%', height: 'calc(100vh - 160px)', border: 'none', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} title={currentDynamicLink.name} />
          </div>
        )}
        {activeTab === 'adminpanel' && currentUser && currentUser.role === 'admin' && (
          <AdminPanel ALL_COLUMNS={ALL_COLUMNS} users={users} setUsers={setUsers} dynamicLinks={dynamicLinks} setDynamicLinks={setDynamicLinks} />
        )}
      </main>
    </div>
  );
}
