import mongoose, { Types } from "mongoose";

export interface IDonation extends Document {
  donationType: "Monetary" | "In-Kind";
  donorId: mongoose.Types.ObjectId;
  monetaryDetails?: {
    amount: number;
    currency: string;
    paymentStatus: "Successful" | "Pending" | "Failed";
    paymentMethod: string;
    transactionId?: string;
  };
  inKindDetails?: {
    itemName: string;
    quantity: number;
    estimatedValue: number;
    description: string;
  };
  goalId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  beneficiaryId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentStatus: "Successful" | "Failed";
  paymentMethod: string;
  stripePaymentId: string;
  stripeSessionId: string;
}
