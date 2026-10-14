import { Router } from "express";
import {
  getProject,
  updateProject,
} from "../controllers/project.controller.js";
import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getProject);
router.put("/", adminOnly, updateProject);

export default router;