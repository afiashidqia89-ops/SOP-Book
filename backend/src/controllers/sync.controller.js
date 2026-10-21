// Controller sinkronisasi — INTI dari strategi offline e-SOP Sawit
//
// 1. GET /sync/manifest?since=<ISO>  → meta semua SOP PUBLISHED yang berubah sejak `since`
// 2. GET /sync/files/:id             → unduh file PDF + audit log
// 3. POST /sync/logs                 → laporan hasil sync dari perangkat
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { errorResponse } from "../middleware/errorHandler.js";
import { getUploadAbsolutePath } from "../utils/paths.js";

const prisma = new PrismaClient();

export async function manifest(req, res, next) {
  try {
    const since = req.query.since ? new Date(req.query.since) : null;
    if (since && isNaN(since.getTime())) {
      return res.status(400).json(errorResponse(400, "Parameter since bukan tanggal ISO yang valid"));
    }

    const items = await prisma.sopDocument.findMany({
      where: { updatedAt: { gt: since || new Date(0) } },
      select: {
        id: true, code: true, title: true, description: true,
        categoryId: true, version: true, status: true,
        fileName: true, fileSize: true, checksum: true, updatedAt: true,
      },
      orderBy: { updatedAt: "asc" },
    });

    // Tandai arsip sebagai "deleted" agar klien menghapusnya dari perangkat
    const payload = items.map((i) => ({
      ...i,
      deleted: i.status !== "PUBLISHED",
    }));

    res.json({
      success: true,
      data: { serverTime: new Date().toISOString(), items: payload },
    });
  } catch (e) { next(e); }
}

export async function download(req, res, next) {
  try {
    const sop = await prisma.sopDocument.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!sop || !sop.fileUrl) return res.status(404).json(errorResponse(404, "SOP atau file tidak ditemukan"));

    // Audit: catat perangkat apa saja yang mengunduh SOP
    await prisma.syncLog.create({
      data: {
        userId: req.user.id,
        sopId: sop.id,
        deviceId: req.headers["x-device-id"] || "unknown",
        action: "DOWNLOAD",
      },
    });

    res.setHeader("X-File-Checksum", sop.checksum || "");
    res.setHeader("X-Sop-Version", String(sop.version));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(sop.fileName || `sop-${sop.id}.pdf`).replace(/"/g, "")}"`
    );

    // Sumber utama: isi PDF dari database (aman untuk hosting disk-sementara)
    if (sop.fileData) {
      res.setHeader("Content-Length", sop.fileData.length);
      return res.send(Buffer.from(sop.fileData));
    }

    // Fallback: data lama yang masih berbasis file di disk (VPS / Docker volume)
    const absPath = getUploadAbsolutePath(sop.fileUrl);
    if (!fs.existsSync(absPath)) return res.status(404).json(errorResponse(404, "File tidak ada di server"));
    return res.download(absPath, sop.fileName || `sop-${sop.id}.pdf`);
  } catch (e) { next(e); }
}

export async function report(req, res, next) {
  try {
    const { deviceId, action, syncedItems } = req.body || {};
    if (!action) return res.status(400).json(errorResponse(400, "Field action wajib diisi (contoh: SYNC_OK)"));

    const rows = (syncedItems || [null]).map((sopId) => ({
      userId: req.user.id,
      sopId: sopId ?? null,
      deviceId: deviceId || "unknown",
      action,
    }));
    await prisma.syncLog.createMany({ data: rows });
    res.status(201).json({ success: true, data: { logged: rows.length } });
  } catch (e) { next(e); }
}
