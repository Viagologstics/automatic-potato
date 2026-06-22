import React, { useState } from 'react';
import DataIO from './DataIO';

export default function Dashboard({ liveVehicleData, currentUser, ALL_COLUMNS, onRefresh, isLoading, apiEndpoint }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [truckTypeFilter, setTruckTypeFilter] = useState('all');

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const filteredRows = liveVehicleData.reduce((acc, trip) => {
    const matchedStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchedType = truckTypeFilter === 'all' || trip.truckType === truckTypeFilter;
    const matchedSearch = trip.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchedStatus && matchedType && matchedSearch) {
      if (!acc[trip.vehicleNo]) {
        acc[trip.vehicleNo] = { id: trip.vehicleNo, type: trip.truckType, status: trip.status, kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0 };
      }
      acc[trip.vehicleNo].kms += trip.kms;
      acc[trip.vehicleNo].revenue += trip.revenue;
      acc[trip.vehicleNo].cost += trip.cost;
      acc[trip.vehicleNo].emi += trip.emi;
      acc[trip.vehicleNo].received += trip.received;
      acc[trip.vehicleNo].pending += trip.pending;
    }
    return acc;
  }, {});

  const consolidatedRows = Object.values(filteredRows);
  const uniqueStatuses = [...new Set(liveVehicleData.map(item => item.status))];
  const uniqueTypes = [...new Set(liveVehicleData.map(item => item.truckType))];

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Fleet Matrix</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Dynamic access controlled dashboard view</p>
        </div>
        <DataIO currentUser={currentUser} ALL_COLUMNS={ALL_COLUMNS} consolidatedRows={consolidatedRows} onRefresh={onRefresh} isLoading={isLoading} apiEndpoint={apiEndpoint} />
      </header>

      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', gap: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Search Registration</label>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter search..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Contract Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="all">All Statuses</option>
            {uniqueStatuses.map((st, i) => <option key={i} value={st}>{st}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>Fleet Specifications</label>
          <select value={truckTypeFilter} onChange={e => setTruckTypeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="all">All Types</option>
            {uniqueTypes.map((tp, i) => <option key={i} value={tp}>{tp}</option>)}
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#fff' }}>
              {ALL_COLUMNS.filter(c => currentUser.allowedColumns.includes(c.id)).map(col => (
                <th key={col.id} style={{ padding: '14px 16px' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consolidatedRows.map((row, idx) => {
              const netProfit = row.revenue - row.cost - row.emi;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {currentUser.allowedColumns.includes('vehicleNo') && <td style={{ padding: '14px 16px', fontWeight: '700' }}>{row.id}</td>}
                  {currentUser.allowedColumns.includes('truckType') && <td style={{ padding: '14px 16px' }}>{row.type}</td>}
                  {currentUser.allowedColumns.includes('status') && <td style={{ padding: '14px 16px' }}>{row.status}</td>}
                  {currentUser.allowedColumns.includes('kms') && <td style={{ padding: '14px 16px' }}>{formatCurrency(row.kms)} km</td>}
                  {currentUser.allowedColumns.includes('revenue') && <td style={{ padding: '14px 16px', color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>}
                  {currentUser.allowedColumns.includes('cost') && <td style={{ padding: '14px 16px', color: '#ef4444' }}>₹{formatCurrency(row.cost)}</td>}
                  {currentUser.allowedColumns.includes('emi') && <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.emi)}</td>}
                  {currentUser.allowedColumns.includes('netProfit') && <td style={{ padding: '14px 16px', fontWeight: '700', color: netProfit >= 0 ? '#16a34a' : '#ef4444' }}>₹{formatCurrency(netProfit)}</td>}
                  {currentUser.allowedColumns.includes('received') && <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.received)}</td>}
                  {currentUser.allowedColumns.includes('pending') && <td style={{ padding: '14px 16px', color: row.pending > 0 ? '#ea580c' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
