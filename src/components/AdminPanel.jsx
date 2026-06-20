import React, { useState } from 'react';

export default function AdminPanel({ ALL_COLUMNS, users, setUsers, dynamicLinks, setDynamicLinks }) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserCols, setNewUserCols] = useState([]);
  const [newUserPages, setNewUserPages] = useState(['dashboard']);
  const [newUserImport, setNewUserImport] = useState(false);
  const [newUserExport, setNewUserExport] = useState(false);
  
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Dropdown tracker state
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserPass) return;
    
    setUsers([...users, {
      username: newUserName.trim(),
      password: newUserPass,
      role: 'staff',
      allowedColumns: newUserCols.length ? newUserCols : ALL_COLUMNS.map(c => c.id),
      allowedPages: newUserPages,
      canImport: newUserImport,
      canExport: newUserExport
    }]);
    
    setNewUserName(''); setNewUserPass(''); setNewUserCols([]); setNewUserPages(['dashboard']); setNewUserImport(false); setNewUserExport(false);
    alert(`Account user "${newUserName}" successfully provisioned.`);
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
    alert(`Dynamic link mounted into navigation workspace view.`);
  };

  const activeReviewUser = users[selectedUserIndex] || users[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Super Admin Security</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Configure user matrices, pages, and external data pipeline links</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Creation Module */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Provision Access Token</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Username" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            
            {/* Page Access Management */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>Allowed Workspaces & Pages:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newUserPages.includes('dashboard')} onChange={(e) => {
                    if (e.target.checked) setNewUserPages([...newUserPages, 'dashboard']);
                    else setNewUserPages(newUserPages.filter(p => p !== 'dashboard'));
                  }} /> Fleet Console
                </label>
                {dynamicLinks.map(link => (
                  <label key={link.id} style={{ fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={newUserPages.includes(link.id)} onChange={(e) => {
                      if (e.target.checked) setNewUserPages([...newUserPages, link.id]);
                      else setNewUserPages(newUserPages.filter(p => p !== link.id));
                    }} /> {link.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>Column Privileges:</label>
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
            <div style={{ display: 'flex', gap: '20px' }}>
              <label><input type="checkbox" checked={newUserImport} onChange={e => setNewUserImport(e.target.checked)} /> Can Import</label>
              <label><input type="checkbox" checked={newUserExport} onChange={e => setNewUserExport(e.target.checked)} /> Can Export</label>
            </div>
            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Create User Instance</button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Link Mount Module */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Mount External Layouts</h3>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="View Name (e.g., Sub-Sheet View)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <input type="url" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Google Sheets Embed URL Link" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Mount Live Link</button>
            </form>
          </div>

          {/* User Tracking Dropdown Module */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Registered Operator Log Matrix</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px 0' }}>Review current profile contexts and assigned security configurations</p>
            
            <select value={selectedUserIndex} onChange={e => setSelectedUserIndex(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '16px', fontWeight: 'bold', color: '#0f172a' }}>
              {users.map((u, idx) => (
                <option key={idx} value={idx}>👤 {u.username} ({u.role.toUpperCase()})</option>
              ))}
            </select>

            {activeReviewUser && (
              <div style={{ border: '1px dashed #cbd5e1', padding: '14px', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '6px' }}>🔑 <b>Password Token:</b> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{activeReviewUser.password}</code></div>
                <div style={{ marginBottom: '6px' }}>📂 <b>Page Rights:</b> {activeReviewUser.allowedPages ? activeReviewUser.allowedPages.join(', ') : 'All Pages Default'}</div>
                <div style={{ marginBottom: '6px' }}>📊 <b>Column Count Access:</b> {activeReviewUser.allowedColumns ? activeReviewUser.allowedColumns.length : 0} active headers</div>
                <div>⚡ <b>Data Privileges:</b> {activeReviewUser.canImport ? 'Import [Yes]' : 'Import [No]'} | {activeReviewUser.canExport ? 'Export [Yes]' : 'Export [No]'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
