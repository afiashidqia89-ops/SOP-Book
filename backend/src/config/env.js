// Konfigurasi environment terpusat
import "dotenv/config";

const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-wajib-diganti-di-produksi",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "26214400", 10), // 25 MB
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

if (!env.DATABASE_URL) {
  console.error("❌ DATABASE_URL belum diisi di file .env — salin dari .env.example");
  process.exit(1);
}

export default env;
