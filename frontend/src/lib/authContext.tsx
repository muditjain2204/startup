'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getAuthToken, setAuthToken, removeAuthToken } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'CONTRACTOR' | 'USER';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'BLOCKED';
  contractorProfile?: {
    id: string;
    companyName: string;
    status: string;
    operatingRadiusKm: number;
    latitude: number;
    longitude: number;
    rating: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  switchDemoUser: (role: 'ADMIN' | 'CONTRACTOR_RAJPUT' | 'CONTRACTOR_DELHI' | 'CITIZEN') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await apiFetch<User>('/auth/me');
      setUser(data);
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    window.location.href = '/login';
  };

  const switchDemoUser = async (role: 'ADMIN' | 'CONTRACTOR_RAJPUT' | 'CONTRACTOR_DELHI' | 'CITIZEN'): Promise<User> => {
    let email = 'admin@smartroad.gov.in';
    let password = 'Admin@123';

    if (role === 'CONTRACTOR_RAJPUT') {
      email = 'info@rajputroadworks.com';
      password = 'Contractor@123';
    } else if (role === 'CONTRACTOR_DELHI') {
      email = 'contact@delhipaving.in';
      password = 'Contractor@123';
    } else if (role === 'CITIZEN') {
      email = 'aarav.sharma@gmail.com';
      password = 'Citizen@123';
    }

    return await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser }}>
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
