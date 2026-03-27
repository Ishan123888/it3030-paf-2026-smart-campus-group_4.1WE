import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...res.data, token });
    } catch (err) {
      console.error("fetchProfile failed:", err.response?.status);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false); // always runs after setUser
    }
  };

  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('token', token);
    setLoading(true); // show loading while fetching profile
    await fetchProfile(token); // await ensures user is set before navigation
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN') ?? false;
  const isTechnician = () => user?.roles?.includes('ROLE_TECHNICIAN') ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, isAdmin, isTechnician }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;