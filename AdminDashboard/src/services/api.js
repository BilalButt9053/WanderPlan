import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_FALLBACK_API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response || error);

    const requestConfig = error.config || {};
    const originalBaseURL = requestConfig.baseURL || API_BASE_URL;
    const canRetryWithLocal =
      error.request &&
      !requestConfig.__retriedWithLocal &&
      originalBaseURL !== LOCAL_FALLBACK_API_URL;

    // Retry network-level failures once against local API for expired ngrok tunnels.
    if (canRetryWithLocal) {
      try {
        return await api({
          ...requestConfig,
          baseURL: LOCAL_FALLBACK_API_URL,
          __retriedWithLocal: true,
        });
      } catch (retryError) {
        error = retryError;
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Don't redirect immediately, let the component handle it
      // window.location.href = '/sign-in';
    }
    
    // Enhance error message
    if (error.response) {
      error.message = error.response.data?.message || error.message;
    } else if (error.request) {
      error.message = 'No response from server. Please verify your API URL or local server is running on http://localhost:5000.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
