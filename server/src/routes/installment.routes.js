import { Router } from "express";

import {
  createInstallmentController,
  getInstallmentsController,
} from "../controllers/installment.controller.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

// Both endpoints require an authenticated admin.
router.use(protect, adminOnly);

router.get("/", getInstallmentsController);
router.post("/", createInstallmentController);

export default router;