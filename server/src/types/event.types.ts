import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  eventType: string;
  status: "Upcoming" | "Happening" | "Completed";
  participants: {
    memberId: mongoose.Types.ObjectId;
    role: string;
    addedAt?: Date;
  }[];
  outcomes?: string;
  kpis: {
    attendance: number;
    fundsRaised?: number;
    successMetrics?: string[];
  };
  donations: mongoose.Types.ObjectId[];
  feedback: {
    feedbackText: string;
    rating: number;
    date?: Date;
  }[];
  eventReport: string;
}
