import mongoose, { Model } from "mongoose";
import { IGoals } from "../types/goals.types";

const goalSchema = new mongoose.Schema<IGoals>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    describe: {
      type: String,
    },
    targetAmount: {
      type: Number,
    },
    currentAmount: {
      type: Number,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed"],
      default: "Active",
    },
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donar"
      }
    ],
  },
  {
    timestamps: true,
  }
);

export const Goal: Model<IGoals> = mongoose.model<IGoals>("Goal", goalSchema);
