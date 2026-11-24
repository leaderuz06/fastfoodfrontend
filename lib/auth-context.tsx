"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  authApi,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  type RegisterPayload,
  type User,
} from "@/lib/api";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Sahifa ochilganda saqlangan token bo'yicha sessiyani tiklaymiz.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getAccessToken() && !getRefreshToken()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await authApi.profile();
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;
        // Server javob berib rad etgan bo'lsa tokenlar yaroqsiz; tarmoq xatosida esa tokenlarni saqlab qolamiz.
        if (error instanceof ApiError) clearTokens();
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    const onExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    restore();
    window.addEventListener("auth:expired", onExpired);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    setTokens(tokens.accessToken, tokens.refreshToken);
    try {
      // Login javobida role yo'q — role'ni profildan olamiz.
      const me = await authApi.profile();
      setUser(me);
      setStatus("authenticated");
      return me;
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      // Ro'yxatdan o'tgach avtomatik tizimga kiritamiz.
      return login(payload.email, payload.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.signout();
    } catch {
      /* server javob bermasa ham mahalliy sessiyani tugatamiz */
    }
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
