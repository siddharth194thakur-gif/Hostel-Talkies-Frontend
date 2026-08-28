import axios from 'axios';

const getActiveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '');
    // Fix stale Render service name if missing -1
    if (clean === 'https://hostel-talkies-backend.onrender.com') {
      return 'https://hostel-talkies-backend-1.onrender.com';
    }
    return clean;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://hostel-talkies-backend-1.onrender.com';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getActiveApiUrl();

// ── Debug: visible in browser console ──────────────────────────────────────
console.info('[HostelTalkies] VITE_API_URL (raw):', import.meta.env.VITE_API_URL);
console.info('[HostelTalkies] API_BASE_URL (resolved):', API_BASE_URL);
console.info('[HostelTalkies] Axios baseURL:', `${API_BASE_URL}/api`);
// ───────────────────────────────────────────────────────────────────────────

export const getMediaUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login?session_expired=1';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
