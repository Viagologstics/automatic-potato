import React, { useState } from 'react';

export default function AdminPanel({ ALL_COLUMNS, users, setUsers, dynamicLinks, setDynamicLinks }) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserCols, setNewUserCols] = useState([]);
  const [newUserImport, setNewUserImport] = useState(false);
  const [newUserExport, setNewUserExport] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserPass) return;
    
    // Normalize user to avoid case-sensitivity lookup issues
    setUsers([...users, {
      username: newUserName.trim(),
      password: newUserPass,
      role: 'staff',
      allowedColumns: newUserCols.length ? newUserCols : ['vehicleNo', 'truckType'],
      canImport: newUserImport,
      canExport: newUserExport
    }]);
    
    setNewUserName(''); setNewUserPass(''); setNewUserCols([]); setNewUserImport(false); setNewUserExport(false);
    alert(`Account context for "${newUserName}" created and cached.`);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkName || !newLinkUrl) return;

    setDynamicLinks([...dynamicLinks, { 
      id: `link_${Date.now()}`, 
      name: newLinkName, 
      url: newLinkUrl 
    }]);
    
    setNewLinkName(''); setNewLinkUrl('');
    alert(`Dynamic workspace view registered and mounted into sidebar navigation layout.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Super Admin Security</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Configure user matrices and external data pipeline links</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Provision Access Token</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Username" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>Column Privileges:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {ALL_COLUMNS.map(col => (
                  <label key={col.id} style={{ fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={newUserCols.includes(col.id)} onChange={(e) => {
                      if (e.target.checked) setNewUserCols([...newUserCols, col.id]);
                      else setNewUserCols(newUserCols.filter(c => c !== col.id));
                    // 1. Compute the active totals using only the rows currently visible after filtering
const totals = visibleRows.reduce((acc, row) => {
  // Helper function to cleanly remove currency symbols, commas, spaces, and 'km' metrics
  const parseNum = (val) => {
    if (!val) return 0;
    return Number(val.toString().replace(/[₹\s,km\-]/g, '')) || 0;
  };

  return {
    kms: acc.kms + parseNum(row.kms),
    revenue: acc.revenue + parseNum(row.revenue),
    cost: acc.cost + parseNum(row.cost),
    emi: acc.emi + parseNum(row.emi),
    netProfit: acc.netProfit + parseNum(row.netProfit),
    received: acc.received + parseNum(row.received),
    pending: acc.pending + parseNum(row.pending)
  };
}, { kms: 0, revenue: 0, cost: 0, emi: 0, netProfit: 0, received: 0, pending: 0 });
                    }} /> {col.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label><input type="checkbox" checked={newUserImport} onChange={e => setNewUserImport(e.target.checked)} /> Can Import</label>
              <label><input type="checkbox" checked={newUserExport} onChange={e => setNewUserExport(e.target.checked)} /> Can Export</label>
            </div>
            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Create User Instance</button>
          </form>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Mount External Layouts</h3>
          <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="View Name (e.g., Sub-Sheet View)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            <input type="url" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Google Sheets Embed URL Link" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Mount Live Link</button>
          </form>
        </div>
      </div>
    </div>
  );
}
