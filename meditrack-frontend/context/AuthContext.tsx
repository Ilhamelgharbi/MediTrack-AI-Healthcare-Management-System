import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('meditrack_token');
    if (token) {
      // Verify token and fetch user data
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          id: userData.id.toString(),
          fullName: userData.full_name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          avatar: userData.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
        };
        setUser(user);
        setIsAuthenticated(true);
        return user;
      } else {
        // Token invalid, remove it
        localStorage.removeItem('meditrack_token');
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('meditrack_token');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      console.log('Attempting login for:', email);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, got token');
        localStorage.setItem('meditrack_token', data.access_token);
        const userData = await fetchUserData(data.access_token);
        console.log('User data fetched:', userData);
        return userData; // Return user for role-based redirect
      } else {
        const error = await response.json();
        console.error('Login failed:', error);
        throw new Error(error.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: { fullName: string; email: string; phone?: string; password: string; role?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: userData.role || 'patient'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Registration successful - don't auto-login to avoid extra API calls
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};