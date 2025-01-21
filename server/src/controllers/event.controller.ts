import { Response } from "express";
import { Event } from "../models/events.model";
import { Member } from "../models/member.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";

const createEvent = asyncHandler(async (req: any, res: Response) => {
  const {
    name,
    date,
    description,
    location,
    eventType,
    participants,
  } = req.body;

  console.log(req.body);

  if (
    [name, date, description, location, eventType].some((e) => e?.trim() === "")
  )
    throw new ErrorResponse(400, "All fields are required");

  if (!Array.isArray(participants) || participants.length === 0)
    throw new ErrorResponse(400, "At least one participant is required");

  for (const participant of participants) {
    if (!participant.memberId || !participant.role)
      throw new ErrorResponse(
        400,
        "Each participant must have a memberId and a role"
      );

    if (
      !["Organizer", "Volunteer", "Attendee", "Speaker"].includes(
        participant.role
      )
    )
      throw new ErrorResponse(400, `Invalid role: ${participant.role}`);
  }

  const participantIds = participants.map((p) => p.memberId);
  const members = await Member.find({ _id: { $in: participantIds } });

  if (members.length !== participantIds.length)
    throw new ErrorResponse(400, "One or more participants not found");

  const now = new Date();
  const eventDate = new Date(date);
  let status = "Upcoming";

  if (eventDate.toDateString() === now.toDateString()) {
    status = "Happening";
  } else if (eventDate < now) {
    status = "Completed";
  }

  const event = await Event.create({
    name,
    date: eventDate,
    description,
    location,
    eventType,
    status,
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

  return res
    .status(201)
    .json(new SuccessResponse(201, event, "Event created successfully"));
});

const getAllEvents = asyncHandler(async (req: any, res: Response) => {
  const now = new Date();

  await Event.updateMany(
    {
      date: { $lt: now },
    },
    { $set: { status: "Completed" } }
  );

  await Event.updateMany(
    {
      date: { $gt: now },
    },
    {
      $set: { status: "Upcoming" },
    }
  );

  await Event.updateMany(
    {
      date: {
        $gte: new Date(now.toISOString().split("T")[0]),
        $lt: now,
      },
    },
    {
      $set: { status: "Happening" },
    }
  );

  const events = await Event.aggregate([
    {
      $lookup: {
        from: "members",
        localField: "participants.memberId",
        foreignField: "_id",
        as: "participantDetails",
      },
    },
    {
      $addFields: {
        participants: {
          $map: {
            input: "$participants",
            as: "participant",
            in: {
              memberId: "$$participant.memberId",
              role: "$$participant.role",
              addedAt: "$$participant.addedAt",
              memberDetails: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      as: "detail",
                      cond: { $eq: ["$$detail._id", "$$participant.memberId"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        participantDetails: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);

  if (events.length <= 0) throw new ErrorResponse(400, "Events not found");

  return res
    .status(200)
    .json(new SuccessResponse(200, events, "Events fetched successfully"));
});


export { createEvent, getAllEvents };
