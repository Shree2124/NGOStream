import { Response } from "express";
import { Event } from "../models/events.model";
import { Member } from "../models/member.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";

const createEvent = asyncHandler(async (req: any, res: Response) => {
  const { name, date, description, location, eventType, participants } = req.body;

  console.log(req.body);
  

  if ([name, date, description, location, eventType].some((e) => e?.trim() === ""))
    throw new ErrorResponse(400, "All fields are required");

  if (!Array.isArray(participants) || participants.length === 0)
    throw new ErrorResponse(400, "At least one participant is required");

  for (const participant of participants) {
    if (!participant.memberId || !participant.role)
      throw new ErrorResponse(400, "Each participant must have a memberId and a role");

    if (!["Organizer", "Volunteer", "Attendee", "Speaker"].includes(participant.role))
      throw new ErrorResponse(400, `Invalid role: ${participant.role}`);
  }

  const participantIds = participants.map((p) => p.memberId);
  const members = await Member.find({ _id: { $in: participantIds } });

  if (members.length !== participantIds.length)
    throw new ErrorResponse(400, "One or more participants not found");

  const event = await Event.create({
    name,
    date,
    description,
    location,
    eventType,
    participants: participants.map((p) => ({
      memberId: p.memberId,
      role: p.role,
      addedAt: new Date(),
    })),
  });

  await Member.updateMany(
    { _id: { $in: participantIds } },
    { $push: { participationHistory: event._id } }
  );

  return res.status(201).json(new SuccessResponse(201, event, "Event created successfully"));
});

export { createEvent };
