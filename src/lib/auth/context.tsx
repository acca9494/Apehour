"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { AuthUser, AuthSession, LoginCredentials, RegisterData } from "./types";
import {
  getSession,
  login as mockLogin,
  register as mockRegister,
  logout as mockLogout,
  loginWithGoogle as mockLoginWithGoogle,
} from "./mock-store";
import type { UserRole } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<AuthSession>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await mockLogin(credentials);
    setUser(session.user);
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthSession> => {
    const session = await mockRegister(data);
    setUser(session.user);
    return session;
  }, []);

  const loginWithGoogle = useCallback(async (role?: UserRole) => {
    const session = await mockLoginWithGoogle(role);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    mockLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
