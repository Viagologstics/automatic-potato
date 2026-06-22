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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Super Admin Security</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Configure user matrices, pages, and external data pipeline links</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', width: '100%', alignItems: 'start' }}>
        
        {/* Left Form: Provision New Tokens */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>Provision Access Token</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Username" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }} required />
            <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} placeholder="Password" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }} required />
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Allowed Workspaces & Pages:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newUserPages.includes('dashboard')} onChange={(e) => {
                    if (e.target.checked) setNewUserPages([...newUserPages, 'dashboard']);
                    else setNewUserPages(newUserPages.filter(p => p !== 'dashboard'));
                  }} /> Fleet Console
                </label>
                {dynamicLinks.map(link => (
                  <label key={link.id} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newUserPages.includes(link.id)} onChange={(e) => {
                      if (e.target.checked) setNewUserPages([...newUserPages, link.id]);
                      else setNewUserPages(newUserPages.filter(p => p !== link.id));
                    }} /> {link.name}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', marginTop: '8px', transition: 'background-color 0.2s' }}>Create User Instance</button>
          </form>
        </div>

        {/* Right Form: Interactive Operator Modification Log Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>Registered Operator Log Matrix</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px 0' }}>Select an operator below to grant features, modify visibility, or edit data download scopes.</p>
            
            <select value={selectedUserIndex} onChange={e => setSelectedUserIndex(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
              {users.map((u, idx) => (
                <option key={idx} value={idx}>👤 {u?.username} ({u?.role?.toUpperCase()})</option>
              ))}
            </select>

            {activeReviewUser && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Active Access Token:</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a', letterSpacing: '0.5px' }}>🔑 {activeReviewUser.password || 'None Set'}</strong>
              </div>
            )}

            {activeReviewUser && (
              <div style={{ border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '24px', backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={editImport} disabled={activeReviewUser.role === 'admin'} onChange={e => setEditImport(e.target.checked)} /> Can Import</label>
                  <label style={{ fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={editExport} disabled={activeReviewUser.role === 'admin'} onChange={e => setEditExport(e.target.checked)} /> Can Export (Download Option)</label>
                </div>

                {/* Conditional Sub-panel: Only displays configuration choices if "Can Export" is checked */}
                {editExport && activeReviewUser.role !== 'admin' && (
                  <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', color: '#065f46', fontSize: '0.85rem' }}>Admin Authorized Export Limit Scope:</label>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" name="exportScope" value="full" checked={editExportScope === 'full'} onChange={() => setEditExportScope('full')} /> Full Database Dump
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" name="exportScope" value="selective" checked={editExportScope === 'selective'} onChange={() => setEditExportScope('selective')} /> Restrict to Sheet Names
                      </label>
                    </div>

                    {editExportScope === 'selective' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px', borderLeft: '2px solid #059669' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065f46', marginBottom: '4px' }}>Check Allowed Sheet Data Targets:</span>
                        {dynamicLinks.map(link => (
                          <label key={link.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
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
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Column Visibility Privileges:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '150px', overflowY: 'auto', backgroundColor: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    {ALL_COLUMNS.map(col => (
                      <label key={col.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={editCols.includes(col.id)} disabled={activeReviewUser.role === 'admin'} onChange={e => {
                          if (e.target.checked) setEditCols([...editCols, col.id]);
                          else setEditCols(editCols.filter(c => c !== col.id));
                        }} /> {col.label}
                      </label>
                    ))}
                  </div>
                </div>

                {activeReviewUser.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="button" onClick={handleSaveModifications} style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>💾 Save Modifications</button>
                    <button type="button" onClick={handleVoidUser} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>🗑️ Void User</button>
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
