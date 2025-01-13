import mongoose, { Model, Schema } from "mongoose";
import { IMember } from "../types/member.types";

const memberSchema: Schema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Volunteer", "Staff", "Coordinator", "Board Member"],
    },
    participationHistory: [
      {
        eventId: mongoose.Types.ObjectId,
        role: String,
        participationDate: Date,
      },
    ],
  },
  { timestamps: true }
);

export const Member: Model<IMember> = mongoose.model<IMember>("Member", memberSchema);