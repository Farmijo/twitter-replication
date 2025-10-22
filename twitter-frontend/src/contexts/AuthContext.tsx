'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if user is logged in on app start
        const savedUser = Cookies.get(STORAGE_KEYS.USER_DATA);
        const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);

        console.log('🔍 Initializing auth context...');
        console.log('Saved user data:', savedUser ? 'exists' : 'missing');
        console.log('Access token:', token ? 'exists' : 'missing');

        if (savedUser && token) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('✅ User restored from cookies:', parsedUser.username);
          } catch (error) {
            console.error('❌ Error parsing saved user data:', error);
            logout();
          }
        } else {
          console.log('ℹ️ No saved user data found');
        }
      } catch (error) {
        console.error('❌ Error during auth initialization:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        console.log('✅ Auth context initialized');
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });

      // Save tokens and user data
      Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      Cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register({ username, email, password });
      
      // Save tokens and user data
      Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      Cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all stored data
    Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(STORAGE_KEYS.USER_DATA);
    
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};