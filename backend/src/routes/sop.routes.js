import { Router } from "express";
import { list, getById, create, update, publish, archive } from "../controllers/sop.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Semua user login boleh membaca
router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);

// Input/revisi SOP: ASSISTANT ke atas
router.post("/", authenticate, requireRole("ASSISTANT", "MANAGER", "SUPERADMIN"), upload.single("file"), create);
router.put("/:id", authenticate, requireRole("ASSISTANT", "MANAGER", "SUPERADMIN"), upload.single("file"), update);

// Publikasi & arsip: MANAGER ke atas
router.post("/:id/publish", authenticate, requireRole("MANAGER", "SUPERADMIN"), publish);
router.patch("/:id/archive", authenticate, requireRole("MANAGER", "SUPERADMIN"), archive);

export default router;
