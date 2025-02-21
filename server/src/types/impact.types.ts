import mongoose, { Document } from "mongoose";

export interface IImpact extends Document {
    eventId?: mongoose.Types.ObjectId;
    beneficiaryId?: mongoose.Types.ObjectId;
    goalId?: mongoose.Types.ObjectId;
    description: string;
    images: string[];
    donationType: "In-Kind" | "Monetary"
}