import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAttendanceReport, deleteAttendance, exportAttendance } from '../api';

function AttendanceReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceReport();
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (date) => {
    if (!window.confirm(`Delete all attendance records for ${date}?`)) return;

    try {
      await deleteAttendance(date);
      loadReports();
      alert('Attendance deleted successfully');
    } catch (error) {
      alert('Error deleting attendance');
    }
  };

  const handleExport = async (date) => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/api/attendance/export/${date}`;
  
  // Open with authentication
    window.open(`${url}?token=${token}`, '_blank');
  };

  return (
    <div className="container">
      <h1>📊 Attendance Reports</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to="/" className="button back">⬅ Back to Dashboard</Link>
        <Link to="/attendance" className="button">📝 Take Attendance</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Students</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Excused</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.date}>
                <td>{report.date}</td>
                <td>{report.total}</td>
                <td style={{ color: 'green' }}>{report.present || 0}</td>
                <td style={{ color: 'red' }}>{report.absents || 0}</td>
                <td style={{ color: 'orange' }}>{report.excused || 0}</td>
                <td>
                  <button
                    onClick={() => handleExport(report.date)}
                    className="button"
                    style={{ marginRight: '5px' }}
                  >
                    📥 Export
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(report.date)}
                      className="button delete"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceReport;