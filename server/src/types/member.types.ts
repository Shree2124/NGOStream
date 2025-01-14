import mongoose from "mongoose";

export interface IMember extends Document {
  fullName: string;
  age: number;
  bio?: string;
  gender: "Male"|"Female"|"Other";
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  role: "Volunteer" | "Staff" | "Coordinator" | "Board Member";
  participationHistory: {
    eventId: mongoose.Types.ObjectId;
    role: string;
    participationDate: Date;
  }[];
}
