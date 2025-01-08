import mongoose, { Types } from "mongoose";

export interface IDonors extends mongoose.Document {
    name: string;
    email: string;
    phone: string;
    address: string;
    donations: { donationId: Types.ObjectId }[];
}