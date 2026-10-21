// Entry point Backend API e-SOP Sawit
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Pastikan folder upload ada
const uploadDir = path.join(__dirname, "..", env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Endpoint kesehatan server — dipakai Android untuk cek konektivitas
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "e-SOP Sawit API", time: new Date().toISOString() })
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🌴 e-SOP Sawit API berjalan di http://localhost:${env.PORT}/api`);
});
