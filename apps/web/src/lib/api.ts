// Klien HTTP terpusat untuk Backend API e-SOP Sawit
// Token JWT disimpan di localStorage dan dilampirkan otomatis ke setiap request.
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("esop_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token kedaluwarsa → paksa logout sederhana (upgrade: refresh token flow)
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("esop_access_token");
      localStorage.removeItem("esop_user");
      if (!window.location.pathname.includes("/login")) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ==== Helper types ====
export interface User {
  id: number;
  nik: string;
  name: string;
  role: "SUPERADMIN" | "MANAGER" | "ASSISTANT" | "FOREMAN" | "WORKER";
  division?: string;
  estate?: string;
  isActive: boolean;
}

export interface SopDocument {
  id: number;
  code: string;
  title: string;
  description?: string;
  categoryId: number;
  category: { id: number; code: string; name: string };
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  fileName?: string;
  fileSize?: number;
  checksum?: string;
  updatedAt: string;
  author?: { name: string };
}

export const ROLE_LABEL: Record<User["role"], string> = {
  SUPERADMIN: "Superadmin",
  MANAGER: "Manager / AED",
  ASSISTANT: "Asisten",
  FOREMAN: "Mandor / Kru",
  WORKER: "Pekerja",
};

export const STATUS_STYLE: Record<SopDocument["status"], string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-200 text-gray-600",
};
