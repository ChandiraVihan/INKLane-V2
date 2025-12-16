import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if there's a token in localStorage when the app loads
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      api.post('/users/verify-token', {})
      .then(response => {
        setIsLoggedIn(true);
        setUserId(response.data.userId);
      })
      .catch(() => {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userId) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserId(null);
  };

  const value = {
    isLoggedIn,
    loading,
    userId,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};