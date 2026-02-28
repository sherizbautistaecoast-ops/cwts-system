import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const login = (username, password) => api.post('/auth/login', { username, password });
export const getMe = () => api.get('/auth/me');

// Students
export const getStudents = () => api.get('/students');
export const getStudentsGrouped = () => api.get('/students/grouped');
export const getStudent = (id) => api.get(`/students/${id}`);
export const addStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const restoreStudent = (id) => api.post(`/students/restore/${id}`);
export const getDeletedStudents = () => api.get('/students/deleted/all');

// Attendance
export const getAttendance = (date) => api.get(`/attendance?date=${date}`);
export const saveAttendance = (date, attendance) => api.post('/attendance', { date, attendance });
export const getAttendanceReport = () => api.get('/attendance/report');
export const deleteAttendance = (date) => api.delete(`/attendance/date/${date}`);
export const exportAttendance = (date) => `${API_URL}/api/attendance/export/${date}`;
export const getAbsenceAlerts = () => api.get('/attendance/alerts');
export const acknowledgeAlert = (id) => api.put(`/attendance/alerts/${id}/acknowledge`);