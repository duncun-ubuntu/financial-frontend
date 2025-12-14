import axios from 'axios';

// Environment-based configuration
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL_PRODUCTION
  : process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axiosInstance.post('token/refresh/', {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Enhanced file upload utility
export const uploadFile = (url, formData, config = {}) => {
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config.headers,
    },
    ...config,
  });
};

// Enhanced file download utility
export const downloadFile = (url, config = {}) => {
  return axiosInstance.get(url, {
    responseType: 'blob',
    ...config,
  });
};

export default axiosInstance;