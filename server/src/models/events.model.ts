import mongoose, { Schema } from "mongoose";
import { IEvent } from "../types/event.types";

const EventSchema: Schema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    eventType: {
      type: String,
      enum: ["Fundraiser", "Workshop", "Outreach", "Seminar", "Training"],
    },
    participants: [
      {
        memberId: {
          type: mongoose.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        role: {
          type: String,
          enum: ["Organizer", "Volunteer", "Attendee", "Speaker"],
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    outcomes: { type: String },
    kpis: {
      attendance: { type: Number },
      fundsRaised: { type: Number },
      successMetrics: [{ type: String }],
    },
    feedback: [
      {
        participantId: {
          type: mongoose.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        feedbackText: { type: String },
        rating: { type: Number, min: 1, max: 5, validate: Number.isInteger },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", EventSchema);
