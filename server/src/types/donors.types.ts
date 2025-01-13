import mongoose, { Types } from "mongoose";

export interface IDonors extends mongoose.Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  donations: Types.ObjectId[];
}
