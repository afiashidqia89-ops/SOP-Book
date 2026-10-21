// Registrasi seluruh route API
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import { usersRouter, categoriesRouter } from "./user.routes.js";
import sopRoutes from "./sop.routes.js";
import syncRoutes from "./sync.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/sops", sopRoutes);
router.use("/sync", syncRoutes);

export default router;
