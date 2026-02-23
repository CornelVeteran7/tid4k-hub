import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSession } from '@/types';
import * as authApi from '@/api/auth';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (telefon: string, pin: string) => Promise<void>;
  qrLogin: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi.validateSession().then((session) => {
      if (session) setUser(session);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (telefon: string, pin: string) => {
    setIsLoading(true);
    try {
      const session = await authApi.login({ telefon, pin });
      setUser(session);
      localStorage.setItem('tid4k_session', JSON.stringify(session));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const qrLogin = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const session = await authApi.qrLogin(sessionId);
      setUser(session);
      localStorage.setItem('tid4k_session', JSON.stringify(session));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutFn = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem('tid4k_session');
    localStorage.removeItem('tid4k_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, qrLogin, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
