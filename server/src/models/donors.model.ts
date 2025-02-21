import mongoose, { Model, Types } from "mongoose";
import { IDonors } from "../types/donors.types";

const DonarSchema = new mongoose.Schema<IDonors>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      trim: true,
      required: true,
    },
    donations: [{ type: Types.ObjectId, ref: "Donation" }],
  },
  {
    timestamps: true,
  }
);

export const Donor: Model<IDonors> = mongoose.model<IDonors>(
  "Donor",
  DonarSchema
);
