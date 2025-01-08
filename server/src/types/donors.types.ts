import mongoose from "mongoose";

export interface IDonors extends mongoose.Document {
    name: string;
    email: string;
    phone: string;
    address: string;
    donations: mongoose.Schema.Types.ObjectId[]
}