import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { parseVehicleData } from './utils/dataParser';

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwNIO5hWPBBPriE0GcyHiOFEorI6fXgRZDEChhsHddFBEq5azLu6bjhv-wERedNIzXRpw/exec";

const ALL_COLUMNS = [
  { id: 'vehicleNo', label: 'Vehicle No.' },
  { id: 'truckType', label: 'Specification' },
  { id: 'status', label: 'Contract Status' },
  { id: 'kms', label: 'Total Distance' },
  { id: 'revenue', label: 'Calculated Revenue' },
  { id: 'cost', label: 'Operating Cost' },
  { id: 'emi', label: 'EMI Share' },
  { id: 'netProfit', label: 'Net Earnings' },
  { id: 'received', label: 'Collected' },
  { id: 'pending', label: 'Outstandings' }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [liveVehicleData, setLiveVehicleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dynamicLinks, setDynamicLinks] = useState([
    { name: "Master Spreadsheet", url: "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?usp=sharing" },
    { name: "Contract Sub-Sheet View", url: "https://docs.google.com/spreadsheets/d/14df7O7yZp5dBXaNKucWAXuDAB7YWwyIr6n2_e5s5Jzg/edit?gid=1098332403#gid=1098332403" }
  ]);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);

  const [users, setUsers] = useState([
    { username: 'viago', password: 'admin123', role: 'admin', allowedColumns: ALL_COLUMNS.map(c => c.id), canImport: true, canExport: true },
    { username: 'operator1', password: 'user123', role: 'staff', allowedColumns: ['vehicleNo', 'truckType', 'status', 'kms'], canImport: false, canExport: true }
  ]);

  useEffect(() => {
    if (isAuthenticated) fetchDataFromSheets();
  }, [isAuthenticated]);

  const fetchDataFromSheets = () => {
    setIsLoading(true);
    fetch(`${GOOGLE_SHEETS_API_URL}?_cb=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        setLiveVehicleData(parseVehicleData(data));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const matched = users.find(u => u.username === username.trim() && u.password === password);
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid identity credentials.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '360px' }}>
          <h3>Viago Access Gateway</h3>
          {loginError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{loginError}</p>}
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }} required />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Authenticate</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setIsAuthenticated(false)} />
      <main style={{ flex: 1, padding: '32px' }}>
        {activeTab === 'dashboard' && <Dashboard liveVehicleData={liveVehicleData} currentUser={currentUser} ALL_COLUMNS={ALL_COLUMNS} onRefresh={fetchDataFromSheets} isLoading={isLoading} />}
        {activeTab === 'googlesheet' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <select value={selectedLinkIndex} onChange={e => setSelectedLinkIndex(parseInt(e.target.value))} style={{ padding: '10px', marginBottom: '12px', maxWidth: '300px' }}>
              {dynamicLinks.map((link, i) => <option key={i} value={i}>{link.name}</option>)}
            </select>
            <iframe src={dynamicLinks[selectedLinkIndex]?.url} style={{ width: '100%', height: '650px', border: 'none', borderRadius: '8px', backgroundColor: '#fff' }} title="Sheet Hub" />
          </div>
        )}
        {activeTab === 'adminpanel' && currentUser.role === 'admin' && (
          <AdminPanel ALL_COLUMNS={ALL_COLUMNS} users={users} setUsers={setUsers} dynamicLinks={dynamicLinks} setDynamicLinks={setDynamicLinks} />
        )}
      </main>
    </div>
  );
}
