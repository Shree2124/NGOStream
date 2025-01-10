import express from "express";
import { createCheckoutSession, getDonationInformation, handlePaymentSuccess } from "../controllers/donation.controller";

const router = express.Router();

router.route("/checkout").post(createCheckoutSession);
router.route("/payment-success").post(handlePaymentSuccess);
router.route("/get-donation-info").get(getDonationInformation)

export default router;