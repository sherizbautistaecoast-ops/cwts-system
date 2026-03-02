import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // 👈 add this

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); // 👈 use this instead
  };

  return (
    <div className="container">
      <h1>📋 CWTS Dashboard</h1>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Welcome, <strong>{user?.username}</strong> ({user?.role})
      </p>

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