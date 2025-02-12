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
    status: "Donated" | "Pending";
  };
  goalId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  beneficiaryId?: mongoose.Types.ObjectId;
  currency: string;
  paymentStatus: "Successful" | "Pending" | "Failed";
  paymentMethod: string;
  sendReceipt: boolean;
  stripePaymentId: string;
  stripeSessionId: string;
}
