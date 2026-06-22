import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

//const ALL_COLUMNS = [
 // { id: 'id', label: 'Vehicle No' },
 // { id: 'type', label: 'Truck Type' },
  //{ id: 'status', label: 'Current Status' },
  //{ id: 'kms', label: 'KMs Covered' },
  //{ id: 'revenue', label: 'Gross Revenue' },
  //{ id: 'cost', label: 'Trip Cost' },
  //{ id: 'emi', label: 'EMI Amount' },
  //{ id: 'netProfit', label: 'Net Profit' },
  //{ id: 'received', label: 'Payment Received' },
  //{ id: 'pending', label: 'Balance Outstanding' }
//];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [consolidatedRows, setConsolidatedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [dynamicLinks, setDynamicLinks] = useState([
    { id: 'sheet_north', name: 'North Zone Operations', url: 'https://docs.google.com/spreadsheets/d/1kq_PSEy0gO-f18FgjgIdVF6eaKX8-iz64P2KIqD6vks/edit?gid=0' },
    { id: 'sheet_south', name: 'South Hub Logistics', url: 'https://docs.google.com/spreadsheets/d/1kq_PSEy0gO-f18FgjgIdVF6eaKX8-iz64P2KIqD6vks/edit?gid=1534061845' }
  ]);

  const [users, setUsers] = useState([
    { 
      username: 'admin', 
      password: '123', 
      role: 'admin', 
      canExport: true, 
      exportScope: 'full', 
      allowedPages: ['dashboard', 'admin', 'sheet_north', 'sheet_south'],
      allowedColumns: ['id', 'type', 'status', 'kms', 'revenue', 'cost', 'emi', 'netProfit', 'received', 'pending']
    }
  ]);
// Place this around Line 45, right before handleRefreshPipeline
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT}?action=get_settings`);
        const data = await response.json();
        if (data && data.columns) {
          setColumns(data.columns);
        }
      } catch (err) {
        console.error("Error loading sheet column configurations:", err);
      }
    };
    
    fetchSettings();
  }, []);
  
const handleRefreshPipeline = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_ENDPOINT}?action=read_fleet`);
    const data = await response.json();
    if (data && data.records && data.records.length > 0) {
      setConsolidatedRows(data.records);
      
      // Extract keys dynamically from the first record
      const dynamicColumns = Object.keys(data.records[0]).map(key => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1) // Rough casing capitalization
      }));
      
      // If you create a state for columns, you would save it here:
      // setColumns(dynamicColumns);
    }
  } catch (err) {
    console.error("Pipeline Sync Error:", err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      handleRefreshPipeline();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const found = users.find(u => u.username === usernameInput && u.password === passwordInput);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      const initialPages = found.allowedPages || [];
      if (initialPages.includes('dashboard')) setActiveTab('dashboard');
      else if (initialPages.includes('admin') && found.role === 'admin') setActiveTab('admin');
      else if (initialPages.length > 0) setActiveTab(initialPages[0]);
    } else {
      alert("Invalid Operator Credentials.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <form onSubmit={handleLoginSubmit} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ margin: '0 0 24px 0', textAlign: 'center', color: '#1e293b', fontWeight: '800' }}>Fleet Console Login</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Username</label>
            <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Password</label>
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Authenticate</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Control Deck */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Viago Logistics</h1>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Operator: {currentUser?.username} ({currentUser?.role})</span>
        </div>
        
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(currentUser?.allowedPages || []).includes('dashboard') && (
            <button onClick={() => setActiveTab('dashboard')} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'dashboard' ? '#0284c7' : 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>📊 Fleet Dashboard</button>
          )}

          {currentUser?.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'admin' ? '#0284c7' : 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>⚙️ Admin Panel</button>
          )}

          <div style={{ height: '1px', backgroundColor: '#334155', margin: '8px 0' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', paddingLeft: '12px' }}>Connected Sheets</span>

          {dynamicLinks.map(link => {
            const hasAccess = (currentUser?.allowedPages || []).includes(link.id) || currentUser?.role === 'admin';
            if (!hasAccess) return null;
            return (
              <button key={link.id} onClick={() => setActiveTab(link.id)} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === link.id ? '#334155' : 'transparent', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}>📋 {link.name}</button>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>🚪 Log Out</button>
        </div>
      </aside>

      {/* Main Content Viewer */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#f1f5f9' }}>
        {activeTab === 'dashboard' && (currentUser?.allowedPages || []).includes('dashboard') && (
          <Dashboard 
            currentUser={currentUser}
            ALL_COLUMNS={columns}
            consolidatedRows={consolidatedRows}
            onRefresh={handleRefreshPipeline}
            isLoading={isLoading}
            apiEndpoint={API_ENDPOINT}
            dynamicLinks={dynamicLinks}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel 
            ALL_COLUMNS={columns}
            users={users}
            setUsers={setUsers}
            dynamicLinks={dynamicLinks}
            setDynamicLinks={setDynamicLinks}
          />
        )}

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
      </main>
    </div>
  );
}
