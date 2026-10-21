// Konfigurasi upload file PDF via multer — MODE MEMORY
//
// Mengapa memoryStorage?
// Hosting gratis (Render, Railway, Koyeb, dsb.) menggunakan disk SEMENTARA —
// file yang ditulis ke disk hilang saat service restart/redeploy.
// Solusi: isi PDF disimpan langsung ke PostgreSQL (kolom sop_documents.file_data),
// sehingga dokumen SOP tidak pernah hilang di mana pun backend di-deploy.
// Disk masih dipakai sebagai fallback baca untuk data lama berbasis file.
import multer from "multer";
import crypto from "crypto";
import path from "path";
import env from "../config/env.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(Object.assign(new Error("Hanya file PDF yang diizinkan"), { status: 400 }));
  },
});

/** Nama file unik logis (metadata di database): timestamp-random.pdf */
export function uniqueFileName(originalname) {
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  return `${unique}${path.extname(originalname).toLowerCase()}`;
}
