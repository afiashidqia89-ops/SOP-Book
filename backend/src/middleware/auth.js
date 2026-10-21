// Middleware autentikasi & otorisasi berbasis role
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { errorResponse } from "./errorHandler.js";

/** Wajib login — verifikasi JWT dari header Authorization */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json(errorResponse(401, "Token tidak ditemukan, silakan login"));

  try {
    req.user = jwt.verify(token, env.JWT_SECRET); // { id, nik, role, name }
    next();
  } catch {
    return res.status(401).json(errorResponse(401, "Token tidak valid atau kedaluwarsa"));
  }
}

/**
 * Batasi endpoint untuk role tertentu.
 * Contoh: router.post("/sops", requireRole("ASSISTANT", "MANAGER", "SUPERADMIN"), handler)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json(errorResponse(401, "Belum terautentikasi"));
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(403, `Role ${req.user.role} tidak berhak mengakses endpoint ini`));
    }
    next();
  };
}
