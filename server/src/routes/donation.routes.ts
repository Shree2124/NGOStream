import express from "express";
import { createCheckoutSession, handlePaymentSuccess } from "../controllers/donation.controller";

const router = express.Router();

router.route("/checkout").post(createCheckoutSession);
router.post("/payment-success", handlePaymentSuccess);

export default router;