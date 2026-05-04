import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // Режим мока — нет Supabase
      const savedUser = localStorage.getItem('work-crm-user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
      return;
    }

    // Supabase v2: onAuthStateChange вызывается сразу с текущей сессией,
    // поэтому getSession() отдельно не нужен — это устраняет race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      const mockUser = { id: '1', email };
      setUser(mockUser);
      localStorage.setItem('work-crm-user', JSON.stringify(mockUser));
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email! });
    }
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      localStorage.removeItem('work-crm-user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
