// Manajemen user (web admin) & kategori SOP
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { errorResponse } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();
const VALID_ROLES = ["SUPERADMIN", "MANAGER", "ASSISTANT", "FOREMAN", "WORKER"];
const publicUser = { id: true, nik: true, name: true, role: true, division: true, estate: true, isActive: true, createdAt: true };

export async function listUsers(req, res, next) {
  try {
    const { role, estate, division } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(estate ? { estate: { contains: estate } } : {}),
        ...(division ? { division: { contains: division } } : {}),
      },
      select: publicUser,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
}

export async function createUser(req, res, next) {
  try {
    const { nik, name, password, role, division, estate } = req.body;
    if (!nik || !name || !password) return res.status(400).json(errorResponse(400, "nik, name, dan password wajib diisi"));
    if (role && !VALID_ROLES.includes(role)) return res.status(400).json(errorResponse(400, `Role tidak valid. Pilihan: ${VALID_ROLES.join(", ")}`));

    const user = await prisma.user.create({
      data: { nik, name, role: role || "WORKER", division, estate, password: await bcrypt.hash(password, 10) },
      select: publicUser,
    });
    res.status(201).json({ success: true, data: user });
  } catch (e) { next(e); }
}

export async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, password, role, division, estate } = req.body;
    if (role && !VALID_ROLES.includes(role)) return res.status(400).json(errorResponse(400, `Role tidak valid. Pilihan: ${VALID_ROLES.join(", ")}`));

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        ...(role ? { role } : {}),
        ...(division !== undefined ? { division } : {}),
        ...(estate !== undefined ? { estate } : {}),
      },
      select: publicUser,
    });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

export async function changeStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json(errorResponse(400, "isActive harus boolean"));
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { isActive },
      select: publicUser,
    });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

// ===== Kategori =====
export async function listCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { sopDocuments: true } } },
      orderBy: { code: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (e) { next(e); }
}

export async function createCategory(req, res, next) {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json(errorResponse(400, "code dan name wajib diisi"));
    const category = await prisma.category.create({ data: { code, name, description } });
    res.status(201).json({ success: true, data: category });
  } catch (e) { next(e); }
}
