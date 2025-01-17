import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  location: string;
  eventType: string;
  participants: {
    memberId: mongoose.Types.ObjectId;
    role: string;
    addedAt: Date;
  }[];
  outcomes?: string;
  kpis: {
    attendance: number;
    fundsRaised?: number;
    successMetrics?: string[];
  };
  donations: mongoose.Types.ObjectId[];
  feedback: {
    participantId: mongoose.Types.ObjectId;
    feedbackText: string;
    rating: number;
    date: Date;
  }[];
}
