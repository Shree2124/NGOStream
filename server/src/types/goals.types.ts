import mongoose from "mongoose";

export interface IGoals extends mongoose.Document {
    name: String;
    describe: String;
    targetAmount: Number;
    currentAmount: Number;
    startDate: Date;
    status: String;
    donations: mongoose.Schema.Types.ObjectId[];
}