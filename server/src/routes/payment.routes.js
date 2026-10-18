
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
// import { postManualPayment } from "../controllers/payment.controller.js";
import {
    postManualPayment,
    getPayments,
    reviewPaymentStatus,
    getPaymentSummaryController,
    searchPaymentShareholdersController,
    initiateGatewayPaymentController,
} from "../controllers/payment.controller.js";

const router = Router();

router.use(protect, adminOnly);

router.post(
    "/gateway/initiate",
    initiateGatewayPaymentController
);

router.get(
    "/shareholders",
    searchPaymentShareholdersController
);

router.get("/summary", getPaymentSummaryController);
router.get("/", getPayments);
router.post("/", postManualPayment);
router.patch("/:paymentId/review", reviewPaymentStatus);

// Only authenticated admins can record manual payments.
router.post("/", protect, adminOnly, postManualPayment);

export default router;
