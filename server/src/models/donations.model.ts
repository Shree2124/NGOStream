import { model, Schema, Types } from "mongoose";
import { IDonation } from "../types/donations.types";

const DonationSchema = new Schema<IDonation>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: "Donor", required: true },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    paymentStatus: { type: String, enum: ["Successful", "Failed"], required: true },
    paymentMethod: { type: String, required: true },
    stripePaymentId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Donation = model<IDonation>("Donation", DonationSchema);
