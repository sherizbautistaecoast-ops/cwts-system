import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentsGrouped, getAttendance, saveAttendance } from '../api';

function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState({});
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (date) {
      loadAttendance();
    }
  }, [date]);

  const loadStudents = async () => {
    try {
      const response = await getStudentsGrouped();
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      setSaved(false);
      const response = await getAttendance(date);
      const existing = {};
      response.data.forEach(record => {
        existing[record.student_id] = record.status;
      });
      setAttendance(existing);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status
    });
  };

  const handleSave = async () => {
    if (!window.confirm('Save attendance for this date?')) return;
    
    setLoading(true);
    try {
      await saveAttendance(date, attendance);
      setSaved(true);
      alert('Attendance saved successfully!');
    } catch (error) {
      alert('Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const getGroupedByCourse = () => {
    const grouped = {};
    Object.values(students).flat().forEach(student => {
      if (!grouped[student.course]) {
        grouped[student.course] = [];
      }
      grouped[student.course].push(student);
    });
    return grouped;
  };

  return (
    <div className="container">
      <h1>📝 Take Attendance</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="button back">⬅ Back to Dashboard</Link>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label><strong>Select Date: </strong></label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '10px', marginLeft: '10px' }}
        />
        {saved && <span style={{ marginLeft: '15px', color: 'green' }}>✓ Saved</span>}
      </div>

      {Object.keys(students).length === 0 ? (
        <p>No students found. Please add students first.</p>
      ) : (
        Object.entries(getGroupedByCourse()).map(([course, courseStudents]) => (
          <div key={course} style={{ marginBottom: '30px' }}>
            <h3>📚 {course}</h3>
            <table>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courseStudents.map(student => (
                  <tr key={student.serial_no}>
                    <td>{student.id_number}</td>
                    <td>{student.last_name}, {student.first_name}</td>
                    <td>
                      <select
                        value={attendance[student.serial_no] || 'Present'}
                        onChange={(e) => handleStatusChange(student.serial_no, e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {Object.keys(students).length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={handleSave} 
            className="button" 
            disabled={loading}
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            {loading ? 'Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Attendance;