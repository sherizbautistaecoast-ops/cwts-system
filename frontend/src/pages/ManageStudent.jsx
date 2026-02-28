import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addStudent, updateStudent, getStudent } from '../api';

function ManageStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    id_number: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    classification: 'Regular',
    campus: 'PU Urdaneta',
    course: '',
    nstp_term: 'NSTP 1',
    school_year: '2024-2025',
    birthdate: '',
    region: '',
    municipality: '',
    barangay: '',
    contact_no: '',
    academic_status: 'Active',
    previous_school: '',
    nstp_taken: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      const response = await getStudent(id);
      setFormData(response.data);
    } catch (error) {
      alert('Error loading student');
      navigate('/students');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateStudent(id, formData);
        alert('Student updated successfully');
      } else {
        await addStudent(formData);
        alert('Student added successfully');
      }
      navigate('/students');
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving student');
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? '✏️ Edit Student' : '➕ Add Student'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>ID Number *</label>
            <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Course *</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} required />
          </div>

          <div>
            <label>Last Name *</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>

          <div>
            <label>First Name *</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div>
            <label>Middle Name</label>
            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} />
          </div>

          <div>
            <label>Classification</label>
            <select name="classification" value={formData.classification} onChange={handleChange}>
              <option value="Regular">Regular</option>
              <option value="Irregular">Irregular</option>
              <option value="Failed">Failed</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          <div>
            <label>Campus *</label>
            <select name="campus" value={formData.campus} onChange={handleChange} required>
              <option value="PU Urdaneta">PU Urdaneta</option>
              <option value="PU Tayug">PU Tayug</option>
            </select>
          </div>

          <div>
            <label>NSTP Term *</label>
            <select name="nstp_term" value={formData.nstp_term} onChange={handleChange} required>
              <option value="NSTP 1">NSTP 1</option>
              <option value="NSTP 2">NSTP 2</option>
            </select>
          </div>

          <div>
            <label>School Year *</label>
            <select name="school_year" value={formData.school_year} onChange={handleChange} required>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
            </select>
          </div>

          <div>
            <label>Academic Status</label>
            <select name="academic_status" value={formData.academic_status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          <div>
            <label>Birthdate *</label>
            <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
          </div>

          <div>
            <label>Contact Number *</label>
            <input type="text" name="contact_no" value={formData.contact_no} onChange={handleChange} placeholder="09XXXXXXXXX" required />
          </div>

          <div>
            <label>Region *</label>
            <input type="text" name="region" value={formData.region} onChange={handleChange} required />
          </div>

          <div>
            <label>Municipality *</label>
            <input type="text" name="municipality" value={formData.municipality} onChange={handleChange} required />
          </div>

          <div>
            <label>Barangay *</label>
            <input type="text" name="barangay" value={formData.barangay} onChange={handleChange} required />
          </div>
        </div>

        <div className="actions" style={{ marginTop: '20px' }}>
          <button type="submit" className="button">
            {isEdit ? 'Save Changes' : 'Add Student'}
          </button>
          <button type="button" onClick={() => navigate('/students')} className="button back">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ManageStudent;