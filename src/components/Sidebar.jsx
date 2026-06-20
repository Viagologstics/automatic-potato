import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout }) {
  return (
    <aside style={{ width: '280px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8', marginBottom: '2px' }}>Viago Core</h2>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '24px' }}>
        Logged in: <b style={{ color: '#38bdf8' }}>{currentUser.username}</b>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'dashboard' ? '#1e293b' : 'transparent', color: '#fff', fontWeight: '700' }}>📊 Fleet Console</button>
        <button onClick={() => setActiveTab('googlesheet')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'googlesheet' ? '#1e293b' : 'transparent', color: '#fff', fontWeight: '700' }}>📋 Connected Sheets</button>
        
        {currentUser.role === 'admin' && (
          <button onClick={() => setActiveTab('adminpanel')} style={{ padding: '12px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'adminpanel' ? '#1e293b' : 'transparent', color: '#e2e8f0', fontWeight: '700', borderLeft: '3px solid #38bdf8' }}>⚙️ Super Admin</button>
        )}
      </nav>
      <button onClick={onLogout} style={{ backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>🔒 Logout</button>
    </aside>
  );
}
