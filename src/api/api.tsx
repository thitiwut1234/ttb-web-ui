import axios from 'axios';

// Create the custom axios instance called api
const api = axios.create({
  baseURL: 'https://api.example.com', // Replace with your backend URL
  timeout: 10000,                     // Set a 10-second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Optional: Request Interceptor (e.g., to add auth tokens)
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

// Optional: Response Interceptor (e.g., global error handling)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
