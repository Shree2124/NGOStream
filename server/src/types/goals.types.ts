import mongoose, { Types } from "mongoose";

export interface IGoals extends mongoose.Document {
    name: String;
    image?: String;
    description: String;
    targetAmount: Number | any;
    currentAmount: Number;
    startDate: Date;
    status: String;
    donations: { donationId: Types.ObjectId }[];
}