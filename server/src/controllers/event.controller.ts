import { Response } from "express";
import { Event } from "../models/events.model";
import { Member } from "../models/member.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import { sendRegistrationMail } from "../utils/sendMail";

const createEvent = asyncHandler(async (req: any, res: Response) => {
  const {
    name,
    startDate,
    endDate,
    description,
    location,
    eventType,
    participants,
  } = req.body;

  console.log(req.body);

  if (
    [name, startDate, endDate, description, location, eventType].some(
      (e) => e?.trim() === ""
    )
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
  const eventStartDate = new Date(startDate);
  const eventEndDate = new Date(endDate);
  let status = "Upcoming";

  // Check the event status based on the start and end dates
  if (eventStartDate <= now && eventEndDate >= now) {
    status = "Happening";
  } else if (eventEndDate < now) {
    status = "Completed";
  }

  const event = await Event.create({
    name,
    startDate: eventStartDate,
    endDate: eventEndDate,
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
      endDate: { $lt: now },
    },
    { $set: { status: "Completed" } }
  );

  await Event.updateMany(
    {
      startDate: { $gt: now },
    },
    {
      $set: { status: "Upcoming" },
    }
  );

  await Event.updateMany(
    {
      startDate: { $lte: now },
      endDate: { $gte: now },
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
    { $sort: { startDate: 1 } },
  ]);

  if (events.length <= 0) throw new ErrorResponse(400, "Events not found");

  return res
    .status(200)
    .json(new SuccessResponse(200, events, "Events fetched successfully"));
});

const editEvent = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;
  const {
    name,
    startDate,
    endDate,
    description,
    location,
    eventType,
    participants,
  } = req.body;

  const existingEvent = await Event.findById(eventId);
  if (!existingEvent) {
    throw new ErrorResponse(404, "Event not found");
  }

  if (
    [name, startDate, endDate, description, location, eventType].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ErrorResponse(400, "All fields are required");
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    throw new ErrorResponse(400, "At least one participant is required");
  }

  for (const participant of participants) {
    if (!participant.memberId || !participant.role) {
      throw new ErrorResponse(
        400,
        "Each participant must have a memberId and a role"
      );
    }

    if (
      !["Organizer", "Volunteer", "Attendee", "Speaker"].includes(
        participant.role
      )
    ) {
      throw new ErrorResponse(400, `Invalid role: ${participant.role}`);
    }
  }

  const participantIds = participants.map((p) => p.memberId);
  const members = await Member.find({ _id: { $in: participantIds } });

  if (members.length !== participantIds.length) {
    throw new ErrorResponse(400, "One or more participants not found");
  }

  const eventStartDate = new Date(startDate);
  const eventEndDate = new Date(endDate);

  existingEvent.name = name;
  existingEvent.startDate = eventStartDate;
  existingEvent.endDate = eventEndDate;
  existingEvent.description = description;
  existingEvent.location = location;
  existingEvent.eventType = eventType;
  existingEvent.participants = participants.map((p) => ({
    memberId: p.memberId,
    role: p.role,
    addedAt: new Date(),
  }));

  await existingEvent.save();

  await Member.updateMany(
    { _id: { $in: participantIds } },
    { $addToSet: { participationHistory: existingEvent._id } }
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(200, existingEvent, "Event updated successfully")
    );
});

export const registerForEvent = asyncHandler(
  async (req: any, res: Response) => {
    const { eventId } = req.body;
    const { gender, age, fullName, email, address, phone } = req.body;

    if (!eventId) {
      throw new ErrorResponse(400, "event id required");
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }
    if (event.status !== "Upcoming") {
      throw new ErrorResponse(
        400,
        "Registration is only allowed for Upcoming events."
      );
    }

    const member = await Member.create({
      gender,
      age,
      fullName,
      email,
      address,
      phone,
      role: "Attendee",
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    const isAlreadyRegistered = event.participants.some(
      (participant) => participant.memberId.toString() === member._id.toString()
    );

    if (isAlreadyRegistered) {
      throw new ErrorResponse(
        400,
        "Member is already registered for this event."
      );
    }

    event.participants.push({
      memberId: member._id,
      role: "Attendee",
    });
    console.log("before", event.kpis.attendance);

    event.kpis.attendance += 1;
    console.log("after", event.kpis.attendance);

    member.participationHistory.push({
      eventId,
      role: "Attendee",
      participationDate: new Date(),
    });

    await event.save();
    await member.save();
    await sendRegistrationMail(member, event);

    return res
      .status(200)
      .json(new SuccessResponse(201, "Registration successful"));
  }
);

export { createEvent, getAllEvents, editEvent };
