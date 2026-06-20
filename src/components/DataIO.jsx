import React, { useState } from 'react';

export default function DataIO({ 
  currentUser, 
  ALL_COLUMNS = [], 
  consolidatedRows = [], 
  onRefresh, 
  isLoading, 
  apiEndpoint, 
  dynamicLinks = [] 
}) {
  const [isSyncingDB, setIsSyncingDB] = useState(false);
  const [isFetchingDump, setIsFetchingDump] = useState(false);
  
  const safeLinks = dynamicLinks || [];
  const isRestrictedScope = currentUser?.role !== 'admin' && currentUser?.exportScope === 'selective';
  const approvedSheets = safeLinks.filter(link => currentUser?.allowedExportSheets?.includes(link.id));
  
  const [chosenSheetId, setChosenSheetId] = useState(approvedSheets[0]?.id || '');

  const handleFetchScriptDump = async () => {
    setIsFetchingDump(true);
    try {
      const targetUrl = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";
      const response = await fetch(`${targetUrl}?action=fetch_dump&operator=${encodeURIComponent(currentUser?.username || 'unknown')}`);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      if (!data || !data.rows) {
        alert("No valid data dump returned from the Apps Script engine.");
        return;
      }

      let csvContent = "";
      if (data.rows.length > 0) {
        csvContent += Object.keys(data.rows[0]).join(",") + "\n";
        data.rows.forEach(row => {
          const line = Object.values(row).map(val => `"${val !== undefined ? val : ''}"`).join(",");
          csvContent += line + "\n";
        });
      } else {
        csvContent = "No records found";
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.setAttribute("download", `Script_Central_Dump_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      alert("Success: Master script data dump successfully compiled and downloaded.");
    } catch (err) {
      console.error(err);
      alert("Error: Unable to fetch live database dump records from Google Script URL.");
    } finally {
      setIsFetchingDump(false);
    }
  };

  const handleExportDataPipeline = async () => {
    if (!currentUser?.canExport) return alert("Access denied: Export operations locked by admin.");
    
    let activeExportName = "Full_Database_Dump";
    
    if (isRestrictedScope) {
      const selectedSheetObj = approvedSheets.find(s => s.id === chosenSheetId);
      if (!selectedSheetObj) return alert("Select an approved sheet name template to download.");
      activeExportName = selectedSheetObj.name.replace(/\s+/g, '_');
    }

    const activeHeaders = (ALL_COLUMNS || []).filter(col => currentUser?.allowedColumns?.includes(col.id));
    let csvContent = activeHeaders.map(h => h.label).join(",") + "\n";

    (consolidatedRows || []).forEach(row => {
      const netProfit = (row.revenue || 0) - (row.cost || 0) - (row.emi || 0);
      const dataMapping = { ...row, netProfit, vehicleNo: row.id, truckType: row.type };
      const line = activeHeaders.map(h => `"${dataMapping[h.id] !== undefined ? dataMapping[h.id] : ''}"`).join(",");
      csvContent += line + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Fleet_${activeExportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsSyncingDB(true);
    try {
      await fetch(apiEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync_export', 
          operator: currentUser.username, 
          targetScope: isRestrictedScope ? 'selective_sheet' : 'full_dump',
          targetSheetName: isRestrictedScope ? approvedSheets.find(s => s.id === chosenSheetId)?.name : 'All',
          data: consolidatedRows 
        })
      });
      alert(`Local export generated. Synchronized copy sent under profile scope: [${activeExportName}].`);
      onRefresh();
    } catch (err) {
      alert("Local CSV generated successfully. Log broadcast encountered a network issue.");
    } finally {
      setIsSyncingDB(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
      
      {currentUser?.canExport && isRestrictedScope && approvedSheets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569' }}>Target Export Sheet:</span>
          <select value={chosenSheetId} onChange={e => setChosenSheetId(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
            {approvedSheets.map(s => <option key={s.id} value={s.id}>📋 {s.name}</option>)}
          </select>
        </div>
      )}

      {currentUser?.canExport && (
        <button onClick={handleExportDataPipeline} disabled={isSyncingDB} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
          {isSyncingDB ? '📤 Exporting...' : '📤 Export Data'}
        </button>
      )}

      {currentUser?.canExport && (
        <button onClick={handleFetchScriptDump} disabled={isFetchingDump} style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
          {isFetchingDump ? '📥 Downloading...' : '📥 Fetch Script Dump'}
        </button>
      )}

      <button onClick={onRefresh} disabled={isLoading} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
        {isLoading ? '🔄 Syncing...' : '🔄 Sync Sheets'}
      </button>
    </div>
  );
}
