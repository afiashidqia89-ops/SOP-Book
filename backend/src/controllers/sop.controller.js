// Controller dokumen SOP — CRUD + upload PDF + versioning otomatis + checksum SHA-256
// Isi PDF disimpan di database (kolom file_data) → aman untuk hosting disk-sementara
import { PrismaClient } from "@prisma/client";
import { errorResponse } from "../middleware/errorHandler.js";
import { sha256Buffer } from "../utils/paths.js";
import { uniqueFileName } from "../middleware/upload.js";

const prisma = new PrismaClient();

export async function list(req, res, next) {
  try {
    const { status, categoryId, q } = req.query;
    const where = {
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId: parseInt(categoryId, 10) } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] } : {}),
    };
    const sops = await prisma.sopDocument.findMany({
      where,
      include: { category: true, author: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, data: sops });
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const sop = await prisma.sopDocument.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { category: true, author: { select: { name: true } } },
    });
    if (!sop) return res.status(404).json(errorResponse(404, "SOP tidak ditemukan"));
    res.json({ success: true, data: sop });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { code, title, description, categoryId } = req.body;
    if (!code || !title || !categoryId || !req.file) {
      return res.status(400).json(errorResponse(400, "code, title, categoryId, dan file PDF wajib diisi"));
    }
    const logicalPath = `uploads/sop/${uniqueFileName(req.file.originalname)}`;
    const sop = await prisma.sopDocument.create({
      data: {
        code, title, description, categoryId: parseInt(categoryId, 10),
        status: "DRAFT",
        fileName: req.file.originalname,
        fileUrl: logicalPath,
        fileSize: req.file.size,
        mimeType: "application/pdf",
        fileData: req.file.buffer, // isi PDF → PostgreSQL (tidak bergantung disk)
        checksum: sha256Buffer(req.file.buffer),
        authorId: req.user.id,
      },
    });
    res.status(201).json({ success: true, data: sop });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.sopDocument.findUnique({ where: { id } });
    if (!existing) return res.status(404).json(errorResponse(404, "SOP tidak ditemukan"));

    const { title, description, categoryId } = req.body;
    let fileFields = {};
    if (req.file) {
      fileFields = {
        fileName: req.file.originalname,
        fileUrl: `uploads/sop/${uniqueFileName(req.file.originalname)}`,
        fileSize: req.file.size,
        mimeType: "application/pdf",
        fileData: req.file.buffer, // isi PDF → PostgreSQL (tidak bergantung disk)
        checksum: sha256Buffer(req.file.buffer),
        // Revisi file mengembalikan status ke DRAFT agar di-review ulang
        status: "DRAFT",
      };
    }

    const sop = await prisma.sopDocument.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(categoryId ? { categoryId: parseInt(categoryId, 10) } : {}),
        ...fileFields,
      },
    });
    res.json({ success: true, data: sop });
  } catch (e) { next(e); }
}

/** Publikasi: naikkan versi, catat waktu publish. SOP inilah yang diunduh perangkat Android. */
export async function publish(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.sopDocument.findUnique({ where: { id } });
    if (!existing) return res.status(404).json(errorResponse(404, "SOP tidak ditemukan"));
    if (!existing.fileUrl) return res.status(400).json(errorResponse(400, "SOP belum memiliki file PDF"));

    const sop = await prisma.sopDocument.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        version: existing.status === "PUBLISHED" ? existing.version + 1 : existing.version,
      },
    });
    res.json({ success: true, data: sop });
  } catch (e) { next(e); }
}

/** Arsipkan: SOP ditarik dari peredaran — klien Android akan menghapusnya saat sync manifest (deleted=true) */
export async function archive(req, res, next) {
  try {
    const sop = await prisma.sopDocument.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { status: "ARCHIVED" },
    });
    res.json({ success: true, data: sop });
  } catch (e) { next(e); }
}
