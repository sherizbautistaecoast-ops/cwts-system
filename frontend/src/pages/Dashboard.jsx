import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudents } from '../api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await getStudents();
      const allStudents = response.data;
      const results = allStudents.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container">
      <h1>📋 CWTS Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Welcome, <strong>{user?.username}</strong> ({user?.role})
      </p>

      {/* Search Section */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
        <h3>🔍 Quick Search</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or ID number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '300px', padding: '12px' }}
          />
          <button 
            onClick={handleSearch} 
            className="button" 
            disabled={searching}
            style={{ padding: '12px 24px' }}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
            }} 
            className="button back"
            style={{ padding: '12px 24px' }}
          >
            Clear
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Search Results ({searchResults.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.map(student => (
                <div key={student.serial_no} style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  background: '#fff', 
                  borderRadius: '5px',
                  borderLeft: '4px solid #007bff'
                }}>
                  <strong>{student.id_number}</strong> - {student.last_name}, {student.first_name}
                  <span style={{ float: 'right', color: '#6c757d' }}>
                    {student.course} | {student.campus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-container">
        <Link to="/students" className="card">
          <div>👨‍🎓</div>
          <div>Manage Students</div>
        </Link>
        
        <Link to="/attendance" className="card">
          <div>📝</div>
          <div>Take Attendance</div>
        </Link>
        
        <Link to="/attendance/report" className="card">
          <div>📊</div>
          <div>Attendance Reports</div>
        </Link>
        
        <Link to="/attendance/alerts" className="card">
          <div>⚠️</div>
          <div>Absence Alerts</div>
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={handleLogout} className="button logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;