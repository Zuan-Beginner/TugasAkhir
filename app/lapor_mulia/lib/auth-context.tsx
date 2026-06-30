'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'user';

type AuthUser = {
  name: string;
  role: UserRole;
  avatar: string;
  gender?: string;
  nim?: string;
  faculty?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (name: string, role: UserRole, avatar: string, gender?: string, nim?: string, faculty?: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'muliaAuthUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse auth user:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const login = (name: string, role: UserRole, avatar: string, gender?: string, nim?: string, faculty?: string) => {
    const newUser: AuthUser = { name, role, avatar, gender, nim, faculty };
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {isLoaded && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
