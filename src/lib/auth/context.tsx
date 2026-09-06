"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { AuthUser, AuthSession, LoginCredentials, RegisterData } from "./types";
import {
  getSession,
  login as supabaseLogin,
  register as supabaseRegister,
  logout as supabaseLogout,
  loginWithGoogle as supabaseLoginWithGoogle,
} from "./supabase-store";
import type { UserRole } from "./types";
import { createClient } from "@/lib/supabase/client";

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
    let mounted = true;

    getSession().then((session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Tiene lo stato sincronizzato anche su refresh token, logout da un'altra
    // tab, o ritorno dal redirect OAuth — non solo sulle chiamate esplicite qui sotto.
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        return;
      }
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        name: (session.user.user_metadata?.name as string) ?? session.user.email?.split("@")[0] ?? "Utente",
        role: (session.user.user_metadata?.role as UserRole) ?? "cliente",
        createdAt: session.user.created_at,
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await supabaseLogin(credentials);
    setUser(session.user);
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthSession> => {
    const session = await supabaseRegister(data);
    setUser(session.user);
    return session;
  }, []);

  const loginWithGoogle = useCallback(async (role?: UserRole) => {
    await supabaseLoginWithGoogle(role);
    // Il browser lascia la pagina per il redirect OAuth: nessuno stato da impostare qui.
  }, []);

  const logout = useCallback(() => {
    void supabaseLogout();
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
