import mongoose, { Model, Types } from "mongoose";
import { IImpact } from "../types/impact.types";

const impactSchema = new mongoose.Schema<IImpact>(
  {
    eventId: {
      type: Types.ObjectId,
      ref: "Event",
    },
    goalId: {
      type: Types.ObjectId,
      ref: "Goal",
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Impact: Model<IImpact> = mongoose.model<IImpact>("Impact", impactSchema)
