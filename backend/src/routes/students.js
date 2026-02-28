const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .is('deleted_at', null)
      .order('last_name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students grouped by NSTP/Campus/Year
router.get('/grouped', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .is('deleted_at', null)
      .order('nstp_term', { ascending: true })
      .order('school_year', { ascending: true })
      .order('campus')
      .order('course')
      .order('last_name');

    if (error) throw error;

    // Group by nstp_term|school_year|campus
    const grouped = {};
    data.forEach(student => {
      const key = `${student.nstp_term}|${student.school_year}|${student.campus}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(student);
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('serial_no', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Student not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add student
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      id_number, last_name, first_name, middle_name, 
      classification, campus, course, nstp_term, school_year,
      birthdate, region, municipality, barangay, contact_no,
      academic_status, previous_school, nstp_taken
    } = req.body;

    const { data, error } = await supabase
      .from('students')
      .insert([{
        id_number, 
        last_name, 
        first_name, 
        middle_name,
        classification: classification || 'Regular',
        campus, 
        course, 
        nstp_term, 
        school_year,
        birthdate, 
        region, 
        municipality, 
        barangay, 
        contact_no,
        academic_status: academic_status || 'Active',
        previous_school,
        nstp_taken
      }])
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.user_id,
      action: 'CREATE',
      entity: 'students',
      entity_id: data.serial_no,
      new_data: JSON.stringify(data)
    }]);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get old data
    const { data: oldData } = await supabase
      .from('students')
      .select('*')
      .eq('serial_no', id)
      .single();

    if (!oldData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { data, error } = await supabase
      .from('students')
      .update(req.body)
      .eq('serial_no', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.user_id,
      action: 'UPDATE',
      entity: 'students',
      entity_id: id,
      old_data: JSON.stringify(oldData),
      new_data: JSON.stringify(data)
    }]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft delete student
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: oldData } = await supabase
      .from('students')
      .select('*')
      .eq('serial_no', id)
      .single();

    const { error } = await supabase
      .from('students')
      .update({ deleted_at: new Date().toISOString() })
      .eq('serial_no', id);

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.user_id,
      action: 'DELETE',
      entity: 'students',
      entity_id: id,
      old_data: JSON.stringify(oldData)
    }]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore student
router.post('/restore/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('students')
      .update({ deleted_at: null })
      .eq('serial_no', id);

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.user_id,
      action: 'RESTORE',
      entity: 'students',
      entity_id: id
    }]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deleted students
router.get('/deleted/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;