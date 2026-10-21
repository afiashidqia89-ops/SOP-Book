// Utilitas path & checksum — dipakai controller SOP dan sync
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import env from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.join(__dirname, "..", "..");

/** Ubah fileUrl relatif (mis. "uploads/sop/x.pdf") menjadi path absolut di disk */
export function getUploadAbsolutePath(fileUrl) {
  return path.join(BACKEND_ROOT, fileUrl);
}

/** Checksum SHA-256 file — dipakai klien Android untuk verifikasi integritas */
export function sha256File(absPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
}

/** Checksum SHA-256 dari buffer (file di memory) — mode simpan di database */
export function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
