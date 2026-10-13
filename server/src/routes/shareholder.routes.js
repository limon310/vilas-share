
import { Router } from "express";
import {
  listShareholders,
  getShareholder,
  createShareholder,
  updateShareholder,
} from "../controllers/shareholder.controller.js";
import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", listShareholders);
router.get("/:id", getShareholder);

// Only administrators can modify shareholder records.
router.post("/", adminOnly, createShareholder);
router.patch("/:id", adminOnly, updateShareholder);

export default router;
