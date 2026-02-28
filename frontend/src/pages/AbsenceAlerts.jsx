import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAbsenceAlerts, acknowledgeAlert } from '../api';

function AbsenceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await getAbsenceAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      loadAlerts();
      alert('Alert acknowledged');
    } catch (error) {
      alert('Error acknowledging alert');
    }
  };

  return (
    <div className="container">
      <h1>⚠️ Absence Alerts</h1>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Students with 3+ absences in the last 30 days
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="button back">⬅ Back to Dashboard</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : alerts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>✅ No absence alerts. All students are doing well!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Campus</th>
              <th>Absences</th>
              <th>Status</th>
              {user?.role === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>
                  {alert.students?.last_name}, {alert.students?.first_name}
                </td>
                <td>{alert.students?.course}</td>
                <td>{alert.students?.campus}</td>
                <td style={{ color: 'red', fontWeight: 'bold' }}>
                  {alert.absences}
                </td>
                <td>
                  {alert.acknowledged ? (
                    <span style={{ color: 'green' }}>✔ Acknowledged</span>
                  ) : (
                    <span style={{ color: 'orange' }}>⚠ Pending</span>
                  )}
                </td>
                {user?.role === 'admin' && (
                  <td>
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)} 
                        className="button"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AbsenceAlerts;