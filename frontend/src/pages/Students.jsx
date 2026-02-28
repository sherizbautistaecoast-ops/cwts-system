import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentsGrouped, deleteStudent, restoreStudent, getDeletedStudents } from '../api';

function Students() {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [filter, setFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await getStudentsGrouped();
      setGroupedStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadDeleted = async () => {
    try {
      const response = await getDeletedStudents();
      setDeletedStudents(response.data);
    } catch (error) {
      console.error('Error loading deleted students:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        loadStudents();
        alert('Student deleted successfully');
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreStudent(id);
      loadDeleted();
      alert('Student restored successfully');
    } catch (error) {
      alert('Error restoring student');
    }
  };

  const groupOptions = ['all', ...Object.keys(groupedStudents)];

  return (
    <div className="container">
      <h1>👨‍🎓 Students List</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to="/" className="button back">⬅ Back to Dashboard</Link>
        {user?.role === 'admin' && (
          <Link to="/students/add" className="button">➕ Add Student</Link>
        )}
        <button
          onClick={() => {
            setShowDeleted(!showDeleted);
            if (!showDeleted) loadDeleted();
          }}
          className="button back"
        >
          {showDeleted ? '👥 Active Students' : '🗑️ Deleted Students'}
        </button>
      </div>

      {showDeleted ? (
        <div>
          <h2>Deleted Students</h2>
          {deletedStudents.length === 0 ? (
            <p>No deleted students.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Campus</th>
                  <th>Deleted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedStudents.map(s => (
                  <tr key={s.serial_no}>
                    <td>{s.id_number}</td>
                    <td>{s.last_name}, {s.first_name}</td>
                    <td>{s.course}</td>
                    <td>{s.campus}</td>
                    <td>{new Date(s.deleted_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleRestore(s.serial_no)} className="button">
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Filter by Group: </strong></label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {groupOptions.map(key => (
                <option key={key} value={key}>
                  {key === 'all' ? 'All Groups' : key.replace(/\|/g, ' - ')}
                </option>
              ))}
            </select>
          </div>

          {Object.entries(groupedStudents)
            .filter(([key]) => filter === 'all' || key === filter)
            .map(([groupKey, students]) => {
              const [nstp, sy, campus] = groupKey.split('|');
              return (
                <div key={groupKey} style={{ marginBottom: '30px' }}>
                  <h3>📚 NSTP {nstp} - A.Y. {sy} - {campus} Campus</h3>

                  {Object.entries(students.reduce((acc, s) => {
                    if (!acc[s.course]) acc[s.course] = [];
                    acc[s.course].push(s);
                    return acc;
                  }, {})).map(([course, courseStudents]) => (
                    <div key={course} style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: '#495057' }}>Course: {course}</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>ID Number</th>
                            <th>Name</th>
                            <th>Status</th>
                            {user?.role === 'admin' && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {courseStudents.map(student => (
                            <tr key={student.serial_no}>
                              <td>{student.id_number}</td>
                              <td>{student.last_name}, {student.first_name}</td>
                              <td>{student.academic_status || 'Active'}</td>
                              {user?.role === 'admin' && (
                                <td>
                                  <Link
                                    to={`/students/edit/${student.serial_no}`}
                                    className="button"
                                    style={{ marginRight: '5px' }}
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(student.serial_no)}
                                    className="button delete"
                                  >
                                    Delete
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

export default Students;