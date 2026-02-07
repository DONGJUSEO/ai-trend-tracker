"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const SITE_PASSWORD = "test1234";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ainssa-auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const login = useCallback((password: string) => {
    if (password === SITE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("ainssa-auth", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem("ainssa-auth");
  }, []);

  if (checking) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
