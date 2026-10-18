
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { postManualPayment } from "../controllers/payment.controller.js";

const router = Router();

// Only authenticated admins can record manual payments.
router.post("/", protect, adminOnly, postManualPayment);

export default router;
