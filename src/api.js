import axios from 'axios';

// An axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
  timeout: 10000,
});

// A request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;