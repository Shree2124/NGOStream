import { Types } from "mongoose";

export interface IBeneficiary extends Document {
    name: string;
    age: number;
    gender: string;
    address: string;
    phoneNumber: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    enrolledSchemes: Types.ObjectId[];
    benefitedSchemes: Types.ObjectId[];
  }