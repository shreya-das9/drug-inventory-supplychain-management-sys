import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const saveAuth = (u, at, rt) => {
    setUser(u);
    setAccessToken(at);
    setRefreshToken(rt);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('accessToken', at);
    localStorage.setItem('refreshToken', rt);
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken('');
    setRefreshToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const signup = async (payload) => {
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      const { user: u, accessToken: at, refreshToken: rt } = data.data;
      saveAuth(u, at, rt);
      return u;
    } catch (e) {
      setError(e.message); throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const { user: u, accessToken: at, refreshToken: rt } = data.data;
      saveAuth(u, at, rt);
      return u;
    } catch (e) {
      setError(e.message); throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  // Optional: auto-restore profile if token still valid
  useEffect(() => {
    // no-op; we rely on localStorage restore above
  }, []);

  const value = useMemo(() => ({
    user, accessToken, refreshToken, isLoading, error, signup, login, logout
  }), [user, accessToken, refreshToken, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
