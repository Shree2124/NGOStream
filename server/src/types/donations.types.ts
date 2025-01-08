import mongoose, { Types } from "mongoose";

export interface IDonation extends Document {
    donorId: Types.ObjectId;
    goalId: Types.ObjectId;
    amount: number;
    currency: string;
    paymentStatus: "Successful" | "Failed";
    paymentMethod: string;
    stripePaymentId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }