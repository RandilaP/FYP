"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Consultant';
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const TOKEN_KEY = 'access_token';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch user info using the token
  const fetchUserInfo = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem(TOKEN_KEY, data.access_token);

      // Fetch user info
      const userResponse = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData: User = await userResponse.json();
      
      // Store user role in localStorage for quick access
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_name', userData.name);
      
      // Update state
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    setUser(null);
    router.push('/');
  };

  // Get dashboard route based on role
  const getDashboardRoute = (role: string): string => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'doctor':
        return '/dashboard/doctor';
      case 'consultant':
        return '/dashboard/consultant';
      default:
        return '/';
    }
  };

  // Check authentication on mount and when pathname changes
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Redirect to appropriate dashboard after successful authentication
  useEffect(() => {
    if (!isLoading && user && pathname.startsWith('/auth/')) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    }
  }, [user, isLoading, pathname]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    fetchUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
