import axios from 'axios';

const api = axios.create({
  // Use Vite proxy in development, full URL in production
  baseURL: import.meta.env.PROD 
    ? 'https://plastech-backend.runasp.net/api' 
    : '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
