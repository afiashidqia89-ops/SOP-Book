// Controller autentikasi — login NIK + password, JWT access & refresh token
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import env from "../config/env.js";
import { errorResponse } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, nik: user.nik, name: user.name, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, type: "refresh" }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export async function login(req, res, next) {
  try {
    const { nik, password } = req.body || {};
    if (!nik || !password) {
      return res.status(400).json(errorResponse(400, "Field nik dan password wajib diisi"));
    }

    const user = await prisma.user.findUnique({ where: { nik } });
    if (!user || !user.isActive) {
      return res.status(401).json(errorResponse(401, "NIK atau password salah, atau akun tidak aktif"));
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json(errorResponse(401, "NIK atau password salah"));

    res.json({
      success: true,
      data: {
        accessToken: signAccessToken(user),
        refreshToken: signRefreshToken(user),
        user: { id: user.id, nik: user.nik, name: user.name, role: user.role, division: user.division, estate: user.estate },
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json(errorResponse(400, "refreshToken wajib dikirim"));
    const payload = jwt.verify(refreshToken, env.JWT_SECRET);
    if (payload.type !== "refresh") return res.status(401).json(errorResponse(401, "Token bukan refresh token"));

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) return res.status(401).json(errorResponse(401, "Akun tidak ditemukan / tidak aktif"));

    res.json({ success: true, data: { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) } });
  } catch (e) {
    next(e);
  }
}

export async function profile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nik: true, name: true, role: true, division: true, estate: true },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}
