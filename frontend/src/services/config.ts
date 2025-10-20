// Purpose: A SINGLE, configured axios instance for the entire application

import axios from 'axios';

// helper function to get the token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // needed for session cookies (Google OAuth)
});

// use an interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging but don't auto-redirect
    // Let individual components or ProtectedRoute handle auth failures
    if (error.response?.status === 401) {
      console.warn('Authentication error: 401 Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;