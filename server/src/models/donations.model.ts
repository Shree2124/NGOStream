import mongoose, { model, Schema, Types } from "mongoose";
import { IDonation } from "../types/donation.types";

const DonationSchema: Schema = new Schema<IDonation>(
  {
    donationType: {
      type: String,
      enum: ["Monetary", "In-Kind"],
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
      index: true,
    },
    monetaryDetails: {
      amount: {
        type: Number,
        required: function () {
          return this.donationType === "Monetary";
        },
      },
      currency: {
        type: String,
        default: function () {
          return this.donationType === "Monetary" ? "USD" : null;
        },
      },
      paymentStatus: {
        type: String,
        enum: ["Successful", "Pending", "Failed"],
        default: function () {
          return this.donationType === "Monetary" ? "Pending" : null;
        },
      },
      paymentMethod: {
        type: String,
        enum: ["Card", "Bank Transfer", "Cash"],
        required: function () {
          return this.donationType === "Monetary";
        },
      },
      transactionId: { type: String },
    },
    inKindDetails: {
      itemName: {
        type: String,
        required: function () {
          return this.donationType === "In-Kind";
        },
      },
      image: {
        type: String,
      },
      quantity: {
        type: Number,
        required: function () {
          return this.donationType === "In-Kind";
        },
      },
      estimatedValue: { type: Number },
      description: { type: String },
      status: {
        type: String,
        enum: ["Donated", "Pending"],
        default: "Pending",
      },
    },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", index: true },
    currency: { type: String },
    stripePaymentId: { type: String },
    stripeSessionId: { type: String },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "Beneficiary" },
    sendReceipt: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Donation = model<IDonation>("Donation", DonationSchema);
