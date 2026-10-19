
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
    getGatewayPaymentStatusController,
} from "../controllers/payment.controller.js";

import {
    gatewaySuccess,
    gatewayFail,
    gatewayCancel,
    gatewayIpn,
} from "../controllers/sslcommerz.controller.js";

const router = Router();

router.post("/gateway/success", gatewaySuccess);
router.get("/gateway/success", gatewaySuccess);

router.post("/gateway/fail", gatewayFail);
router.get("/gateway/fail", gatewayFail);

router.post("/gateway/cancel", gatewayCancel);
router.get("/gateway/cancel", gatewayCancel);

router.post("/gateway/ipn", gatewayIpn);

// All remaining payment-management routes stay protected.

router.use(protect, adminOnly);

router.post(
    "/gateway/initiate",
    initiateGatewayPaymentController
);

router.get(
    "/shareholders",
    searchPaymentShareholdersController
);

router.get(
  "/gateway/:paymentId/status",
  getGatewayPaymentStatusController
);

router.get("/summary", getPaymentSummaryController);
router.get("/", getPayments);
router.post("/", postManualPayment);
router.patch("/:paymentId/review", reviewPaymentStatus);

// Only authenticated admins can record manual payments.
router.post("/", protect, adminOnly, postManualPayment);

export default router;
