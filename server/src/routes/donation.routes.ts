import express from "express";
import { createCheckoutSession, getDonationInformation, handlePaymentSuccess, updateDonationStatus } from "../controllers/donation.controller";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

router.route("/checkout").post(upload.single("image"),createCheckoutSession);
router.route("/payment-success").post(handlePaymentSuccess);
router.route("/get-donation-info/:type").get(getDonationInformation)
router.route("/update-donation-status").put(updateDonationStatus)

export default router;