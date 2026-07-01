import axios from 'axios';

let activeAccessToken: string | null = null;

const isProduction = import.meta.env.MODE === 'production';
export const BACKEND_URL = (import.meta.env.VITE_API_URL as string) || (isProduction ? '' : 'http://localhost:5000');

export const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const setAccessToken = (token: string | null) => {
  activeAccessToken = token;
};

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to automatically inject Bearer Authorization headers
api.interceptors.request.use(
  (config) => {
    if (activeAccessToken) {
      config.headers.Authorization = `Bearer ${activeAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle silent token rotation on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isRefreshRequest = originalRequest.url?.includes('auth/refresh');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(`${BACKEND_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        
        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and dispatch global logout event
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
