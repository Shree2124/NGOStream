import mongoose, { Model, Types } from "mongoose";
import { IGoals } from "../types/goals.types";

const goalSchema = new mongoose.Schema<IGoals>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    targetAmount: {
      type: Number,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "Completed"],
      default: "Active",
    },
    donations: [ { type: Types.ObjectId, ref: "Donor" } ],
  },
  {
    timestamps: true,
  }
);

export const Goal: Model<IGoals> = mongoose.model<IGoals>("Goal", goalSchema);
