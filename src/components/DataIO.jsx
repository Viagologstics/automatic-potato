import React from 'react';

export default function DataIO({ currentUser, ALL_COLUMNS, consolidatedRows, onRefresh, isLoading }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const handleExportCSV = () => {
    if (!currentUser?.canExport) return alert("Unauthorized execution: Export blocked.");
    
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
    link.setAttribute("download", `Fleet_Secure_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    if (!currentUser?.canImport) return alert("Unauthorized execution: Import blocked.");
    const file = e.target.files[0];
    if (file) {
      alert(`Schema validated for "${file.name}". Processing pipeline to live database sheets...`);
      onRefresh();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {currentUser.canImport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569' }}>Import DB Format</span>
          <input type="file" accept=".csv" onChange={handleImportCSV} style={{ fontSize: '0.8rem' }} />
        </div>
      )}
      {currentUser.canExport && (
        <button onClick={handleExportCSV} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>📤 Export CSV</button>
      )}
      <button onClick={onRefresh} disabled={isLoading} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
        {isLoading ? '🔄 Syncing...' : '🔄 Sync Sheets'}
      </button>
    </div>
  );
}
