import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ManageStudent from './pages/ManageStudent';
import Attendance from './pages/Attendance';
import AttendanceReport from './pages/AttendanceReport';
import AbsenceAlerts from './pages/AbsenceAlerts';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
      <Route path="/students/add" element={<PrivateRoute><ManageStudent /></PrivateRoute>} />
      <Route path="/students/edit/:id" element={<PrivateRoute><ManageStudent /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
      <Route path="/attendance/report" element={<PrivateRoute><AttendanceReport /></PrivateRoute>} />
      <Route path="/attendance/alerts" element={<PrivateRoute><AbsenceAlerts /></PrivateRoute>} />
    </Routes>
  );
}

export default App;