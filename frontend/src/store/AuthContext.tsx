import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken } from '../services/api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateToken = (token: string | null) => {
    setTokenState(token);
    setAccessToken(token);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    updateToken(data.accessToken);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post('/auth/register', { name, email, password });
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await api.post('/auth/logout', { accessToken });
      }
    } catch (e) {
      // Ignore failures during logout
    } finally {
      setUser(null);
      updateToken(null);
    }
  };

  // Perform silent refresh on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        updateToken(data.accessToken);
        
        const profileRes = await api.get('/auth/profile');
        setUser(profileRes.data.user);
      } catch (err) {
        // No valid token, ignore
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for global logout events (triggered by 401 response interceptor)
    const handleGlobalLogout = () => {
      setUser(null);
      updateToken(null);
    };

    window.addEventListener('auth:logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
