import React, { useState, useEffect } from 'react';

// ⚠️ PASTE YOUR COPIED GOOGLE APPS SCRIPT URL HERE
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

export default function App() {
  const [activePage, setActivePage] = useState('vehicles'); 
  const [timePeriod, setTimePeriod] = useState('overall');  
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveVehicleData, setLiveVehicleData] = useState([]);

  // Form State matching your sheet's explicit Column names
  const [formData, setFormData] = useState({
    "Date": '2026-05-01', "Vehicle No.": '', "Type Of Truck": '17ft Canter', 
    "Consignor Name": 'NIPPON DEDICATED VEHICLES', "Unlaoding Date": '2026-05-31', 
    "Trip Status": 'DEDICATED', "Transportation Charges": 0, "Halting Charges": 0,
    "Payment Received": 0, "Opening kms": 0, "Closing kms": 0, "Contract Kms": 3000, 
    "Extra KM Cost": 20, "Fixed Vehicle Charges": 107000, "Cost": 0, "EMI": 0, 
    "Parking cost": 0, "Fastag-Toll": 0, "Others": 0, "Customer Email": ''
  });

  useEffect(() => {
    fetchDataFromSheets();
  }, []);

  const fetchDataFromSheets = () => {
    setIsLoading(true);
    fetch(GOOGLE_SHEETS_API_URL)
      .then(res => res.json())
      .then(data => {
        // Safe mapping that mirrors your sheet formulas
        const parsed = data.map(item => {
          const rawDate = item["Date"] || '';
          const isDedicated = String(item["Trip Status"]).toUpperCase() === 'DEDICATED';

          // Kms calculation: = Closing kms - Opening kms
          const openKms = parseFloat(String(item["Opening kms"] || '0').replace(/,/g, '')) || 0;
          const closeKms = parseFloat(String(item["Closing kms"] || '0').replace(/,/g, '')) || 0;
          const kmsRun = closeKms > openKms ? (closeKms - openKms) : (parseFloat(String(item["Kms"] || '0').replace(/,/g, '')) || 0);

          // Billing logic matching your columns M and BK (Final Billing)
          let revenue = 0;
          if (isDedicated) {
            // Dedicated formula logic from your sample columns
            const contractKms = parseFloat(String(item["Contract Kms"] || '0').replace(/,/g, '')) || 0;
            const extraKmRate = parseFloat(String(item["Extra KM Cost"] || '0').replace(/,/g, '')) || 0;
            const extraKms = kmsRun > contractKms ? (kmsRun - contractKms) : 0;
            const extraKmCharges = extraKms * extraKmRate;
            const fixedCharges = parseFloat(String(item["Fixed Vehicle Charges"] || '0').replace(/,/g, '')) || 0;
            
            const parking = parseFloat(String(item["Parking cost"] || '0').replace(/,/g, '')) || 0;
            const toll = parseFloat(String(item["Fastag-Toll"] || '0').replace(/,/g, '')) || 0;
            const others = parseFloat(String(item["Others"] || '0').replace(/,/g, '')) || 0;

            revenue = parseFloat(String(item["Final Billing Per Vehicle"] || '0').replace(/,/g, '')) || 
                      (fixedCharges + extraKmCharges + parking + toll + others);
          } else {
            // Ad-hoc formula logic: = Transportation Charges + Halting Charges
            const transCharges = parseFloat(String(item["Transportation Charges"] || '0').replace(/,/g, '')) || 0;
            const haltCharges = parseFloat(String(item["Halting Charges"] || '0').replace(/,/g, '')) || 0;
            revenue = parseFloat(String(item["Total"] || '0').replace(/,/g, '')) || (transCharges + haltCharges);
          }

          const cost = parseFloat(String(item["Cost"] || '0').replace(/,/g, '')) || 0;
          const emi = parseFloat(String(item["EMI"] || '0').replace(/,/g, '')) || 0;
          const received = parseFloat(String(item["Payment Received"] || '0').replace(/,/g, '')) || 0;

          return {
            ...item,
            cleanDate: rawDate,
            vehicleNo: item["Vehicle No."] || 'UNKNOWN',
            truckType: item["Type Of Truck"] || 'Other',
            customer: item["Consignor Name"] || 'NIPPON DEDICATED',
            status: item["Trip Status"] || 'COMPLETE',
            kms: kmsRun,
            revenue,
            cost,
            emi,
            received,
            pending: revenue - received
          };
        }).filter(item => item.vehicleNo !== 'UNKNOWN');

        setLiveVehicleData(parsed);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Sheet parsing sync issue:", err);
        setIsLoading(false);
      });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  // Time Window Filtering Logic
  //const filteredTrips = liveVehicleData.filter(trip => {
   // if (timePeriod === 'overall') return true;
  //  return trip.cleanDate >= startDate && trip.cleanDate <= endDate;
 // });
// Updated Time Window Filtering Logic
  const filteredTrips = liveVehicleData.filter(trip => {
    if (timePeriod === 'overall') return true;
    
    // Normalizes both sheet dates and input dates into comparable numbers
    const cleanRawDate = String(trip.cleanDate).replace(/[\/-]/g, ''); // converts "01-05-2026" or "01/05/2026" to "01052026"
    const cleanStart = String(startDate).replace(/[\/-]/g, '');
    const cleanEnd = String(endDate).replace(/[\/-]/g, '');

    // Rearrange DDMMYYYY string to YYYYMMDD for correct mathematical chronological comparison
    const targetDateNum = parseInt(cleanRawDate.split('').reverse().join(''), 10); 
    
    // If your sheet formats dates natively as YYYY-MM-DD, a fallback helper:
    const toStandardFormat = (str) => {
      const parts = str.split(/[\/-]/);
      if (parts[0].length === 4) return parts.join(''); // YYYYMMDD
      return parts[2] + parts[1] + parts[0]; // DDMMYYYY -> YYYYMMDD
    };

    try {
      const tripScore = parseInt(toStandardFormat(String(trip.cleanDate)), 10);
      const startScore = parseInt(toStandardFormat(startDate), 10);
      const endScore = parseInt(toStandardFormat(endDate), 10);
      return tripScore >= startScore && tripScore <= endScore;
    } catch(e) {
      return true; // Fallback to show row if date parsing acts up
    }
  });
  
  // Consolidate data view values dynamically matching your Dashboard View rules
  const vehicleMap = {};
  filteredTrips.forEach(trip => {
    if (!vehicleMap[trip.vehicleNo]) {
      vehicleMap[trip.vehicleNo] = { id: trip.vehicleNo, type: trip.truckType, customer: trip.customer, status: trip.status, kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, tripsCount: 0 };
    }
    vehicleMap[trip.vehicleNo].kms += trip.kms;
    vehicleMap[trip.vehicleNo].revenue += trip.revenue;
    vehicleMap[trip.vehicleNo].cost += trip.cost;
    vehicleMap[trip.vehicleNo].emi += trip.emi;
    vehicleMap[trip.vehicleNo].received += trip.received;
    vehicleMap[trip.vehicleNo].pending += trip.pending;
    vehicleMap[trip.vehicleNo].tripsCount += 1;
  });
  const consolidatedRows = Object.values(vehicleMap);

  // Grand System Summary Row Accumulator
  const summaryTotals = consolidatedRows.reduce((acc, curr) => {
    acc.kms += curr.kms; acc.revenue += curr.revenue; acc.cost += curr.cost; acc.emi += curr.emi; acc.received += curr.received; acc.pending += curr.pending; acc.trips += curr.tripsCount;
    return acc;
  }, { kms: 0, revenue: 0, cost: 0, emi: 0, received: 0, pending: 0, trips: 0 });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData["Vehicle No."].trim()) return alert("Vehicle No. cannot be left blank.");
    
    setIsLoading(true);
    fetch(GOOGLE_SHEETS_API_URL, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify(formData)
    })
    .then(() => {
      fetchDataFromSheets();
      setShowForm(false);
    })
    .catch(() => {
      alert("Error committing manual ledger row.");
      setIsLoading(false);
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, system-ui, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* SYSTEM NAVIGATION PANES */}
      <aside style={{ width: '265px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#38bdf8', marginBottom: '32px', tracking: '0.05em' }}>Viago Central Console</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActivePage('vehicles')} style={{ padding: '12px 16px', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', backgroundColor: '#1e293b', color: '#38bdf8', fontWeight: '700' }}>📊 Live Metrics Dashboard</button>
        </nav>
      </aside>

      {/* CORE FRAME LAYOUT */}
      <main style={{ flex: 1, padding: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Operational Fleet Ledger</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Compiling live formula tracks from primary spreadsheet database</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
            {showForm ? '✖ Close Input Console' : '➕ Append Raw Matrix Entry'}
          </button>
        </header>

        {isLoading && (
          <div style={{ padding: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
            🔄 Recalculating sheet formulas and matrix dependencies...
          </div>
        )}

        {/* DATA SUBMISSION COMPONENT */}
        {showForm && (
          <form onSubmit={handleFormSubmit} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Date (DD/MM/YYYY)</label><input type="text" placeholder="01/05/2026" value={formData["Date"]} onChange={e => setFormData({...formData, "Date": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Vehicle No.</label><input type="text" placeholder="KA01AL 7384" value={formData["Vehicle No."]} onChange={e => setFormData({...formData, "Vehicle No.": e.target.value.toUpperCase()})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Type Of Truck</label><input type="text" value={formData["Type Of Truck"]} onChange={e => setFormData({...formData, "Type Of Truck": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Consignor Name</label><input type="text" value={formData["Consignor Name"]} onChange={e => setFormData({...formData, "Consignor Name": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Contract Type</label><select value={formData["Trip Status"]} onChange={e => setFormData({...formData, "Trip Status": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}><option>DEDICATED</option><option>COMPLETE</option></select></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Opening kms</label><input type="number" value={formData["Opening kms"]} onChange={e => setFormData({...formData, "Opening kms": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Closing kms</label><input type="number" value={formData["Closing kms"]} onChange={e => setFormData({...formData, "Closing kms": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Fixed Vehicle Charges</label><input type="number" value={formData["Fixed Vehicle Charges"]} onChange={e => setFormData({...formData, "Fixed Vehicle Charges": e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>Commit Entry Row</button></div>
          </form>
        )}

        {/* TIME CONFIG PANEL */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '500', color: '#334155' }}>
            <option value="overall">All Synced Records Ledger View</option>
            <option value="custom">Isolate Timeline Window</option>
          </select>
          {timePeriod === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
              <span style={{ color: '#64748b' }}>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
            </div>
          )}
        </div>

        {/* DYNAMIC METRICS OUTPUT FRAME */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                <th style={{ padding: '14px 16px' }}>Vehicle No.</th>
                <th style={{ padding: '14px 16px' }}>Specification</th>
                <th style={{ padding: '14px 16px' }}>Contract Status</th>
                <th style={{ padding: '14px 16px' }}>Total Distance</th>
                <th style={{ padding: '14px 16px' }}>Calculated Revenue</th>
                <th style={{ padding: '14px 16px' }}>Operating Cost</th>
                <th style={{ padding: '14px 16px' }}>EMI Share</th>
                <th style={{ padding: '14px 16px' }}>Net Earnings</th>
                <th style={{ padding: '14px 16px' }}>Collected</th>
                <th style={{ padding: '14px 16px' }}>Outstandings</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedRows.map((row, index) => {
                const netProfit = row.revenue - row.cost - row.emi;
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>{row.id}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{row.type}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '600' }}><span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: row.status === 'DEDICATED' ? '#f0fdf4' : '#f8fafc', color: row.status === 'DEDICATED' ? '#16a34a' : '#475569' }}>{row.status}</span></td>
                    <td style={{ padding: '14px 16px' }}>{formatCurrency(row.kms)} km</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#16a34a' }}>₹{formatCurrency(row.revenue)}</td>
                    <td style={{ padding: '14px 16px', color: '#ef4444' }}>₹{formatCurrency(row.cost)}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>₹{formatCurrency(row.emi)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: netProfit >= 0 ? '#16a34a' : '#ef4444' }}>₹{formatCurrency(netProfit)}</td>
                    <td style={{ padding: '14px 16px' }}>₹{formatCurrency(row.received)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: row.pending > 0 ? '#ea580c' : '#64748b' }}>₹{formatCurrency(row.pending)}</td>
                  </tr>
                );
              })}
              
              {/* ACCUMULATED GRAND SYSTEM SUMMARY SUMMARY LINE */}
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '3px solid #0f172a' }}>
                <td colSpan="3" style={{ padding: '16px' }}>Total System Volume ({summaryTotals.trips} rows)</td>
                <td>{formatCurrency(summaryTotals.kms)} km</td>
                <td style={{ color: '#16a34a' }}>₹{formatCurrency(summaryTotals.revenue)}</td>
                <td style={{ color: '#ef4444' }}>₹{formatCurrency(summaryTotals.cost)}</td>
                <td style={{ color: '#64748b' }}>₹{formatCurrency(summaryTotals.emi)}</td>
                <td style={{ color: (summaryTotals.revenue - summaryTotals.cost - summaryTotals.emi) >= 0 ? '#16a34a' : '#ef4444' }}>₹{formatCurrency(summaryTotals.revenue - summaryTotals.cost - summaryTotals.emi)}</td>
                <td>₹{formatCurrency(summaryTotals.received)}</td>
                <td style={{ color: '#ea580c' }}>₹{formatCurrency(summaryTotals.pending)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
