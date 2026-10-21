import { Router } from "express";
import { listUsers, createUser, updateUser, changeStatus, listCategories, createCategory } from "../controllers/user.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
const categoryRouter = Router();

// Manajemen user — khusus web admin
router.use(authenticate);
router.get("/", requireRole("ASSISTANT", "MANAGER", "SUPERADMIN"), listUsers);
router.post("/", requireRole("SUPERADMIN"), createUser);
router.put("/:id", requireRole("SUPERADMIN"), updateUser);
router.patch("/:id/status", requireRole("SUPERADMIN"), changeStatus);

// Kategori SOP
categoryRouter.use(authenticate);
categoryRouter.get("/", listCategories);
categoryRouter.post("/", requireRole("SUPERADMIN"), createCategory);

export { categoryRouter as categoriesRouter, router as usersRouter };
