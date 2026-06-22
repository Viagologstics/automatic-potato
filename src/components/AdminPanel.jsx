import React, { useState, useEffect } from 'react';

export default function AdminPanel({ ALL_COLUMNS, users, setUsers, dynamicLinks, setDynamicLinks }) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserCols, setNewUserCols] = useState([]);
  const [newUserPages, setNewUserPages] = useState(['dashboard']);
  const [newUserImport, setNewUserImport] = useState(false);
  const [newUserExport, setNewUserExport] = useState(false);
  
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const activeReviewUser = users[selectedUserIndex] || users[0];

  const [editPass, setEditPass] = useState('');
  const [editCols, setEditCols] = useState([]);
  const [editPages, setEditPages] = useState([]);
  const [editImport, setEditImport] = useState(false);
  const [editExport, setEditExport] = useState(false);
  const [editExportScope, setEditExportScope] = useState('full'); 
  const [editAllowedExportSheets, setEditAllowedExportSheets] = useState([]); 

  useEffect(() => {
    if (activeReviewUser) {
      setEditPass(activeReviewUser.password || '');
      setEditCols(activeReviewUser.allowedColumns || []);
      setEditPages(activeReviewUser.allowedPages || ['dashboard']);
      setEditImport(activeReviewUser.canImport || false);
      setEditExport(activeReviewUser.canExport || false);
      setEditExportScope(activeReviewUser.exportScope || 'full');
      setEditAllowedExportSheets(activeReviewUser.allowedExportSheets || []);
    }
  }, [selectedUserIndex, users]);

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
      canExport: newUserExport,
      exportScope: 'full', 
      allowedExportSheets: []
    }]);
    
    setNewUserName(''); setNewUserPass(''); setNewUserCols([]); setNewUserPages(['dashboard']); setNewUserImport(false); setNewUserExport(false);
    alert(`Account user "${newUserName}" successfully provisioned.`);
  };

  const handleSaveModifications = () => {
    if (!activeReviewUser) return;
    if (activeReviewUser.role === 'admin') return alert("System Guard: Root admin configuration properties cannot be modified.");

    const updatedUsers = users.map((u, idx) => {
      if (idx === selectedUserIndex) {
        return {
          ...u,
          password: editPass,
          allowedColumns: editCols,
          allowedPages: editPages,
          canImport: editImport,
          canExport: editExport,
          exportScope: editExportScope,
          allowedExportSheets: editAllowedExportSheets
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    alert(`Access Matrix updated successfully for node token: "${activeReviewUser.username}"`);
  };

  const handleVoidUser = () => {
    if (!activeReviewUser) return;
    if (activeReviewUser.role === 'admin') return alert("Security Violation: Administrative contexts cannot be wiped.");

    if (window.confirm(`Are you sure you want to void access rights for user "${activeReviewUser.username}"?`)) {
      const remainingUsers = users.filter((_, idx) => idx !== selectedUserIndex);
      setUsers(remainingUsers);
      setSelectedUserIndex(0);
      alert("Access authorization wiped cleanly.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Super Admin Security</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Configure user matrices, pages, and external data pipeline links</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Form: Provision New Tokens */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Provision Access Token</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Username" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            
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

            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create User Instance</button>
          </form>
        </div>

        {/* Right Form: Interactive Operator Modification Log Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Registered Operator Log Matrix</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px 0' }}>Select an operator below to grant features, modify visibility, or edit data download scopes.</p>
            
            <select value={selectedUserIndex} onChange={e => setSelectedUserIndex(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '16px', fontWeight: 'bold', color: '#0f172a' }}>
              {users.map((u, idx) => (
                <option key={idx} value={idx}>👤 {u?.username} ({u?.role?.toUpperCase()})</option>
              ))}
            </select>

            {activeReviewUser && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Active Access Token / Password:</span>
                <input 
                  type="text" 
                  value={editPass} 
                  disabled={activeReviewUser.role === 'admin'}
                  onChange={e => setEditPass(e.target.value)} 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#0f172a', backgroundColor: activeReviewUser.role === 'admin' ? '#e2e8f0' : '#fff' }} 
                />
              </div>
            )}

            {activeReviewUser && (
              <div style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'flex', gap: '16px', backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 'bold' }}><input type="checkbox" checked={editImport} disabled={activeReviewUser.role === 'admin'} onChange={e => setEditImport(e.target.checked)} /> Can Import</label>
                  <label style={{ fontWeight: 'bold', color: '#10b981' }}><input type="checkbox" checked={editExport} disabled={activeReviewUser.role === 'admin'} onChange={e => setEditExport(e.target.checked)} /> Can Export (Download Option)</label>
                </div>

                {editExport && activeReviewUser.role !== 'admin' && (
                  <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#065f46' }}>Admin Authorized Export Limit Scope:</label>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                      <label>
                        <input type="radio" name="exportScope" value="full" checked={editExportScope === 'full'} onChange={() => setEditExportScope('full')} /> Full Database Dump
                      </label>
                      <label>
                        <input type="radio" name="exportScope" value="selective" checked={editExportScope === 'selective'} onChange={() => setEditExportScope('selective')} /> Restrict to Sheet Names
                      </label>
                    </div>

                    {editExportScope === 'selective' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '10px', borderLeft: '2px solid #059669' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#065f46' }}>Check Allowed Sheet Data Targets:</span>
                        {dynamicLinks.map(link => (
                          <label key={link.id} style={{ fontSize: '0.8rem' }}>
                            <input type="checkbox" checked={editAllowedExportSheets.includes(link.id)} onChange={(e) => {
                              if (e.target.checked) setEditAllowedExportSheets([...editAllowedExportSheets, link.id]);
                              else setEditAllowedExportSheets(editAllowedExportSheets.filter(id => id !== link.id));
                            }} /> {link.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Column Visibility Privileges:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#fff', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    {ALL_COLUMNS.map(col => (
                      <label key={col.id} style={{ fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={editCols.includes(col.id)} disabled={activeReviewUser.role === 'admin'} onChange={e => {
                          if (e.target.checked) setEditCols([...editCols, col.id]);
                          else setEditCols(editCols.filter(c => c !== col.id));
                        }} /> {col.label}
                      </label>
                    ))}
                  </div>
                </div>

                {activeReviewUser.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="button" onClick={handleSaveModifications} style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Modifications</button>
                    <button type="button" onClick={handleVoidUser} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Void User</button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
