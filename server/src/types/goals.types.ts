import mongoose, { Types } from "mongoose";

export interface IGoals extends mongoose.Document {
    name: String;
    describe: String;
    targetAmount: Number;
    currentAmount: Number;
    startDate: Date;
    status: String;
    donations: { donationId: Types.ObjectId }[];
}