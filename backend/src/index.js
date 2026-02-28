require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CWTS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CWTS API Server running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/students`);
  console.log(`   - GET    /api/students/grouped`);
  console.log(`   - POST   /api/students`);
  console.log(`   - PUT    /api/students/:id`);
  console.log(`   - DELETE /api/students/:id`);
  console.log(`   - GET    /api/attendance?date=YYYY-MM-DD`);
  console.log(`   - POST   /api/attendance`);
  console.log(`   - GET    /api/attendance/report`);
  console.log(`   - GET    /api/attendance/alerts`);
});