const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Helper: Run absence check
async function runAbsenceCheck() {
  try {
    // Get students with 3+ absences in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: absences } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('status', 'Absent')
      .gte('date', dateStr);

    // Count absences per student
    const counts = {};
    absences.forEach(a => {
      counts[a.student_id] = (counts[a.student_id] || 0) + 1;
    });

    // Insert/update alerts for students with 3+ absences
    for (const [studentId, count] of Object.entries(counts)) {
      if (count >= 3) {
        await supabase
          .from('absence_alerts')
          .upsert([{
            student_id: parseInt(studentId),
            absences: count,
            acknowledged: false
          }], { onConflict: 'student_id' });
      }
    }
  } catch (error) {
    console.error('Absence check error:', error);
  }
}

// Get attendance by date
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        attendance_id,
        student_id,
        date,
        status,
        created_at,
        students (
          id_number,
          last_name,
          first_name,
          course
        )
      `)
      .eq('date', date)
      .is('deleted_at', null);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance report (all dates with totals)
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by date
    const reports = {};
    data.forEach(record => {
      if (!reports[record.date]) {
        reports[record.date] = { total: 0, absents: 0, excused: 0, present: 0 };
      }
      reports[record.date].total++;
      if (record.status === 'Absent') reports[record.date].absents++;
      if (record.status === 'Excused') reports[record.date].excused++;
      if (record.status === 'Present') reports[record.date].present++;
    });

    // Convert to array
    const reportArray = Object.entries(reports).map(([date, stats]) => ({
      date,
      ...stats
    }));

    res.json(reportArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save attendance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, attendance } = req.body;

    if (!date || !attendance) {
      return res.status(400).json({ error: 'Date and attendance data required' });
    }

    for (const [studentId, status] of Object.entries(attendance)) {
      // Check if record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('attendance_id')
        .eq('student_id', studentId)
        .eq('date', date)
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('attendance')
          .update({ status, recorded_by: req.user.user_id })
          .eq('attendance_id', existing.attendance_id);
      } else {
        // Insert new
        await supabase
          .from('attendance')
          .insert([{
            student_id: parseInt(studentId),
            date,
            status,
            recorded_by: req.user.user_id
          }]);
      }
    }

    // Run absence check
    await runAbsenceCheck();

    res.json({ success: true, message: 'Attendance saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attendance by date (admin only)
router.delete('/date/:date', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('date', date);

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.user_id,
      action: 'DELETE_RANGE',
      entity: 'attendance',
      entity_id: 0,
      new_data: JSON.stringify({ date })
    }]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export attendance as CSV
router.get('/export/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        status,
        students (
          id_number,
          last_name,
          first_name
        )
      `)
      .eq('date', date)
      .is('deleted_at', null);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    let csv = 'ID Number,Name,Status\n';
    data.forEach(record => {
      const name = `${record.students?.last_name || ''}, ${record.students?.first_name || ''}`;
      csv += `${record.students?.id_number || ''},"${name}",${record.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ✅ MISSING PART - Get absence alerts (COMPLETE)
// =====================================================
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('absence_alerts')
      .select(`
        id,
        student_id,
        absences,
        acknowledged,
        created_at,
        students (
          last_name,
          first_name,
          course,
          campus
        )
      `)
      .order('absences', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge absence alert (admin only)
router.put('/alerts/:id/acknowledge', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('absence_alerts')
      .update({ acknowledged: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;