import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import api from '../api/client';
import { User } from '../types';

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { access: string; refresh: string }, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Start loading=true so we never flash the login page before checking tokens
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Guard: only run the startup fetch once even in StrictMode double-invoke
  const initializedRef = useRef(false);

  // ── Restore user from server (or clear if genuinely invalid) ────────────────
  const fetchCurrentUser = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    // No tokens at all → not logged in
    if (!accessToken && !refreshToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<User>('/auth/me/');
      setUser(response.data);
      // Keep cached copy fresh for other tabs
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err: any) {
      const status: number | undefined = err?.response?.status;

      if (status === 403) {
        // Blocked / suspended account — keep user object so UI can show the block screen
        setUser(err.response.data.user || null);
      } else if (!status) {
        // Network error / Render cold-start / offline — do NOT destroy a valid session.
        // Try to restore from the locally cached user object instead.
        const cached = localStorage.getItem('user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        // 401 after the Axios interceptor already tried to refresh → session truly expired
        // The interceptor has already cleared localStorage; nothing to do here except reflect that.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── On mount: restore session ────────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ── Cross-tab logout sync via localStorage event ─────────────────────────────
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'ht_auth_event' && event.newValue?.startsWith('logout:')) {
        // Another tab logged out
        setUser(null);
      }
      if (event.key === 'access_token' && !event.newValue) {
        // Token was removed in another tab
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Login: store tokens + set user ──────────────────────────────────────────
  const login = useCallback(
    (tokens: { access: string; refresh: string }, userData: User) => {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    },
    []
  );

  // ── Logout: clear everything and call the backend logout endpoint ────────────
  const logout = useCallback(() => {
    // Fire logout to backend (best-effort; don't block on it)
    api.post('/auth/logout/').catch(() => {});

    // Clear local session
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Signal other tabs
    try { localStorage.setItem('ht_auth_event', `logout:${Date.now()}`); } catch {}

    setUser(null);
  }, []);

  // ── Update user in memory and cache ─────────────────────────────────────────
  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // ── Re-fetch user from backend (e.g. after profile update) ──────────────────
  const refreshUserProfile = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
