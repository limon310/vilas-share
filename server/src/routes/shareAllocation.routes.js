import { Router } from "express";

import {
  getShareAllocations,
  postShareAllocation,
} from "../controllers/shareAllocation.controller.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getShareAllocations);
router.post("/", adminOnly, postShareAllocation);

export default router;