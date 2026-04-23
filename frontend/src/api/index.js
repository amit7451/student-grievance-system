import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('student');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerStudent = (data) => API.post('/api/register', data);
export const loginStudent = (data) => API.post('/api/login', data);
export const getMe = () => API.get('/api/me');

// Grievances
export const submitGrievance = (data) => API.post('/api/grievances', data);
export const getAllGrievances = (params) => API.get('/api/grievances', { params });
export const getGrievanceById = (id) => API.get(`/api/grievances/${id}`);
export const updateGrievance = (id, data) => API.put(`/api/grievances/${id}`, data);
export const deleteGrievance = (id) => API.delete(`/api/grievances/${id}`);
export const searchGrievances = (title) => API.get('/api/grievances/search', { params: { title } });

export default API;
