"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authApi, ApiError, type User } from "@/lib/api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setState({ user: null, isLoading: false, isAuthenticated: false });
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
  }, []);

  const scheduleExpiry = useCallback((token: string) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const msUntilExpiry = expiry - Date.now() - 60_000; // 1 min buffer
    if (msUntilExpiry <= 0) {
      clearSession();
      return;
    }
    expiryTimerRef.current = setTimeout(clearSession, msUntilExpiry);
  }, [clearSession]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    const expiry = getTokenExpiry(token);
    if (expiry && expiry < Date.now()) {
      clearSession();
      return;
    }

    try {
      const { user } = await authApi.me();
      setState({ user, isLoading: false, isAuthenticated: true });
      scheduleExpiry(token);
    } catch {
      clearSession();
    }
  }, [clearSession, scheduleExpiry]);

  useEffect(() => {
    loadUser();
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem("token", token);
    setState({ user, isLoading: false, isAuthenticated: true });
    scheduleExpiry(token);
  };

  const signup = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const { user, token } = await authApi.signup({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    localStorage.setItem("token", token);
    setState({ user, isLoading: false, isAuthenticated: true });
    scheduleExpiry(token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API call fails
    }
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ApiError };
