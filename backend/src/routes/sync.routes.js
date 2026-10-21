import { Router } from "express";
import { manifest, download, report } from "../controllers/sync.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate); // seluruh endpoint sync butuh login
router.get("/manifest", manifest);
router.get("/files/:id", download);
router.post("/logs", report);

export default router;
