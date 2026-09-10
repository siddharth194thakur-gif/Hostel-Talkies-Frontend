import axios, { AxiosInstance } from 'axios';

// ─── Resolve production API base URL ────────────────────────────────────────
const getActiveApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const clean = envUrl.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '');
    // Normalize stale service name if ever encountered
    if (
      clean.includes('hostel-talkies-backend.onrender.com') &&
      !clean.includes('hostel-talkies-backend-1')
    ) {
      return 'https://hostel-talkies-backend-1.onrender.com';
    }
    return clean;
  }
  // Fallback for non-localhost production (e.g. Vercel preview without env var set)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://hostel-talkies-backend-1.onrender.com';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getActiveApiUrl();

// ─── Media URL helper ────────────────────────────────────────────────────────
export const getMediaUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

// ─── Axios instance ──────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 35000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers (no raw token logging) ───────────────────────────────────
const getAccessToken  = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const saveTokens = (access: string, refresh?: string) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  // Broadcast logout to other tabs
  try { localStorage.setItem('ht_auth_event', `logout:${Date.now()}`); } catch {}
};

// ─── Refresh-lock: prevent concurrent refresh storms ────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

// ─── Request interceptor: attach Bearer token ───────────────────────────────
api.interceptors.request.use(config => {
  // Skip auth header for public auth endpoints
  const isPublicEndpoint =
    config.url?.includes('/auth/login/') ||
    config.url?.includes('/auth/register/') ||
    config.url?.includes('/auth/token/refresh/');

  if (isPublicEndpoint) {
    if (config.headers) delete config.headers.Authorization;
    return config;
  }

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: refresh on 401, queue concurrent requests ─────────
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Don't intercept auth endpoints or network errors (Render cold-start, offline)
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login/') ||
      originalRequest?.url?.includes('/auth/register/') ||
      originalRequest?.url?.includes('/auth/token/refresh/');

    // Network error (no response) — do NOT clear session; backend may just be waking up
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = getRefreshToken();

      // No refresh token stored → clear and redirect
      if (!refreshToken) {
        clearSession();
        const onPublicPage =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register' ||
          window.location.pathname === '/' ||
          window.location.pathname === '/about' ||
          window.location.pathname === '/contact' ||
          window.location.pathname === '/guidelines';
        if (!onPublicPage) {
          window.location.href = '/login?session_expired=1';
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request until refresh resolves
      if (isRefreshing) {
        return new Promise<string>(resolve => {
          subscribeTokenRefresh(resolve);
        }).then(newToken => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use plain axios (not the intercepted instance) to avoid recursive intercept
        const refreshRes = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess: string = refreshRes.data.access;
        // IMPORTANT: save rotated refresh token if backend returned one
        const newRefresh: string | undefined = refreshRes.data.refresh;
        saveTokens(newAccess, newRefresh);

        isRefreshing = false;
        onTokenRefreshed(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);

      } catch {
        isRefreshing = false;
        onRefreshFailed();

        clearSession();

        const onPublicPage =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register' ||
          window.location.pathname === '/' ||
          window.location.pathname === '/about' ||
          window.location.pathname === '/contact' ||
          window.location.pathname === '/guidelines';

        if (!onPublicPage) {
          window.location.href = '/login?session_expired=1';
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
