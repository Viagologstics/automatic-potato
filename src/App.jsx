import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

const ALL_COLUMNS = [
  { id: 'id', label: 'Vehicle Nosss' },
  { id: 'type', label: 'Truck Type' },
  { id: 'status', label: 'Current Status' },
  { id: 'kms', label: 'KMs Covered' },
  { id: 'revenue', label: 'Gross Revenue' },
  { id: 'cost', label: 'Trip Cost' },
  { id: 'emi', label: 'EMI Amount' },
  { id: 'netProfit', label: 'Net Profit' },
  { id: 'received', label: 'Payment Received' },
  { id: 'pending', label: 'Balance Outstanding' }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [consolidatedRows, setConsolidatedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🎛️ Modern Resizable Sidebar: default open but can be collapsed to 0
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // New: hover-expand for ultra-minimal mode
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  
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

  const handleRefreshPipeline = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}?action=read_fleet`);
      const data = await response.json();
      if (data && data.records) {
        setConsolidatedRows(data.records);
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

  // Compute actual width: if closed, but hovered -> expand to 220px, else 0
  const sidebarWidth = isSidebarOpen ? '280px' : (isSidebarHovered ? '240px' : '0px');
  const sidebarOpacity = (isSidebarOpen || isSidebarHovered) ? 1 : 0;

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0f172a', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', backgroundColor: '#1e293b', color: '#fff' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '-1px' }}>Viago Core</h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0, maxWidth: '500px', lineHeight: '1.6' }}>
            Enterprise Fleet Management Matrix & Live Pipeline Console. Secure operator access gateway.
          </p>
        </div>
        <div style={{ width: '480px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', boxSizing: 'border-box' }}>
          <form onSubmit={handleLoginSubmit} style={{ width: '100%', maxWidth: '360px' }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.8rem' }}>Operator Sign In</h2>
            <p style={{ margin: '0 0 32px 0', color: '#64748b', fontSize: '0.9rem' }}>Please input your secure database token nodes.</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Username</label>
              <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Password</label>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Authenticate Node</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Sidebar with hover-expand when closed */}
      <aside 
        onMouseEnter={() => { if (!isSidebarOpen) setIsSidebarHovered(true); }}
        onMouseLeave={() => { if (!isSidebarOpen) setIsSidebarHovered(false); }}
        style={{ 
          width: sidebarWidth,
          opacity: sidebarOpacity,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease',
          overflow: 'hidden',
          backgroundColor: '#1e293b', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRight: (isSidebarOpen || isSidebarHovered) ? '1px solid #334155' : 'none',
          flexShrink: 0,
          position: 'relative',
          zIndex: 20,
          boxShadow: (isSidebarOpen || isSidebarHovered) ? '2px 0 12px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #334155', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Viago Logistics</h1>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Operator: {currentUser?.username}</span>
        </div>
        
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {(currentUser?.allowedPages || []).includes('dashboard') && (
            <button onClick={() => setActiveTab('dashboard')} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'dashboard' ? '#0284c7' : 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s' }}>📊 Fleet Dashboard</button>
          )}

          {currentUser?.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'admin' ? '#0284c7' : 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s' }}>⚙️ Admin Panel</button>
          )}

          <div style={{ height: '1px', backgroundColor: '#334155', margin: '8px 0' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', paddingLeft: '12px' }}>Connected Sheets</span>

          {dynamicLinks.map(link => {
            const hasAccess = (currentUser?.allowedPages || []).includes(link.id) || currentUser?.role === 'admin';
            if (!hasAccess) return null;
            return (
              <button key={link.id} onClick={() => setActiveTab(link.id)} style={{ width: '100%', padding: '12px', textAlign: 'left', borderRadius: '6px', border: 'none', backgroundColor: activeTab === link.id ? '#334155' : 'transparent', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.15s' }}>📋 {link.name}</button>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #334155', whiteSpace: 'nowrap' }}>
          <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>🚪 Log Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '16px 24px 24px 24px',
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Floating Toggle + Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.15s'
            }}
          >
            {isSidebarOpen ? '◀ Collapse' : '▶ Expand'}
          </button>
          
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#64748b', marginLeft: '4px' }}>
            {!isSidebarOpen ? '⚡ Hover left edge to peek' : '📐 Sidebar visible'}
          </span>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                const event = new CustomEvent('zoomDashboard', { detail: { direction: 'in' } });
                window.dispatchEvent(event);
              }}
              style={{ padding: '6px 14px', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}
            >🔍+</button>
            <button 
              onClick={() => {
                const event = new CustomEvent('zoomDashboard', { detail: { direction: 'out' } });
                window.dispatchEvent(event);
              }}
              style={{ padding: '6px 14px', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}
            >🔍−</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', width: '100%' }}>
          {activeTab === 'dashboard' && (currentUser?.allowedPages || []).includes('dashboard') && (
            <div style={{ width: '100%', height: '100%' }}>
              <Dashboard 
                currentUser={currentUser}
                ALL_COLUMNS={ALL_COLUMNS}
                consolidatedRows={consolidatedRows}
                onRefresh={handleRefreshPipeline}
                isLoading={isLoading}
                apiEndpoint={API_ENDPOINT}
                dynamicLinks={dynamicLinks}
              />
            </div>
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
              <AdminPanel 
                ALL_COLUMNS={ALL_COLUMNS}
                users={users}
                setUsers={setUsers}
                dynamicLinks={dynamicLinks}
                setDynamicLinks={setDynamicLinks}
              />
            </div>
          )}

          {dynamicLinks.map(link => {
            const isPagePermitted = (currentUser?.allowedPages || []).includes(link.id) || currentUser?.role === 'admin';
            if (activeTab === link.id && isPagePermitted) {
              return (
                <div key={link.id} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
                  <iframe 
                    src={link.url} 
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    title={link.name}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </main>
    </div>
  );
}
