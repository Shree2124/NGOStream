import mongoose, { Model } from "mongoose";
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
  },
  {
    timestamps: true,
  }
);

export const Donar: Model<IDonors> = mongoose.model<IDonors>(
  "Donar",
  DonarSchema
);
