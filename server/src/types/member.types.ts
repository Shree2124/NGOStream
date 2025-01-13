import mongoose from "mongoose";

export interface IMember extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "Volunteer" | "Staff" | "Coordinator" | "Board Member";
  participationHistory: {
    eventId: mongoose.Types.ObjectId;
    role: string;
    participationDate: Date;
  }[];
}
