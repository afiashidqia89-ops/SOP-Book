"use client";
// Hook autentikasi sederhana berbasis localStorage (cocok untuk internal tool)
import { useEffect, useState, createContext, useContext } from "react";
import { api, User } from "./api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (nik: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState>({
  user: null, loading: true, login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("esop_user");
    if (raw) try { setUser(JSON.parse(raw)); } catch {}
    setLoading(false);
  }, []);

  const login = async (nik: string, password: string) => {
    const { data } = await api.post("/auth/login", { nik, password });
    localStorage.setItem("esop_access_token", data.data.accessToken);
    localStorage.setItem("esop_refresh_token", data.data.refreshToken);
    localStorage.setItem("esop_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

/** Nilai role untuk membatasi tampilan menu web admin */
export const canManageSop = (u: User | null) =>
  u && ["SUPERADMIN", "MANAGER", "ASSISTANT"].includes(u.role);
