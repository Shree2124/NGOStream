import { Response } from "express";
import { Event } from "../models/events.model";
import { Member } from "../models/member.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import { sendRegistrationMail } from "../utils/sendMail";
import mongoose, { isValidObjectId } from "mongoose";
import { IEvent } from "../types/event.types";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import uploadOnCloudinary from "../utils/cloudinary";
import { ConfigResponse } from "cloudinary";
import { Donation } from "../models/donations.model";

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

  console.log(req.body.participants);

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

const getEvent = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;
  console.log("Get event");

  if (!isValidObjectId(eventId))
    throw new ErrorResponse(400, "Invalid event id");

  const event = await Event.findById(eventId);

  console.log(event);

  res
    .status(200)
    .json(new SuccessResponse(200, event, "Event fetched successfully"));
});

const addEventFeedback = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;
  const { rating, feedbackText } = req.body;

  if (!isValidObjectId(eventId))
    throw new ErrorResponse(400, "Invalid event id");

  if (!rating || !feedbackText)
    throw new ErrorResponse(400, "rating and feedback is required");

  const event = await Event.findById(eventId);

  event?.feedback.push({
    feedbackText: feedbackText,
    rating: rating,
  });

  await event?.save();

  res
    .status(200)
    .json(new SuccessResponse(200, "Event feedback added successfully"));
});

const getEventById = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;

  console.log("Get event by id");

  const event = await Event.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(eventId) },
    },
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
                      cond: {
                        $eq: [
                          "$$detail._id",
                          { $toObjectId: "$$participant.memberId" },
                        ],
                      },
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
        _id: 1,
        name: 1,
        description: 1,
        date: 1,
        location: 1,
        participants: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        eventReport: 1, // Include eventReport explicitly
      },
    },
  ]);

  if (!event || event.length === 0) {
    return res.status(404).json(new ErrorResponse(404, "Event not found"));
  }

  return res.status(200).json(new SuccessResponse(200, event[0], ""));
});

export const generateEventReport = asyncHandler(
  async (req: any, res: Response) => {
    const { eventId } = req.params;

    const event: IEvent | any = await Event.findById(eventId)
      .populate("participants.memberId", "fullName email eventReport")
      .populate("donations");

    console.log(event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filePath = path.join(__dirname, `event_${eventId}_report.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.font("Times-Roman");

    const logoPath = path.join(__dirname, "../../public/ngo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 80, 35, { width: 60 });
    }

    doc
      .fillColor("#003366")
      .font("Times-Bold")
      .fontSize(20)
      .text("NGO Stream", { align: "center" });

    doc
      .fillColor("#800000")
      .font("Times-Bold")
      .fontSize(18)
      .text(`Event Report: ${event.name}`, { align: "center" });

    doc.moveDown(1);

    doc
      .fillColor("#555555")
      .font("Times-Roman")
      .fontSize(12)
      .text(`Report Date: ${new Date().toLocaleDateString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    doc
      .fillColor("#003366")
      .font("Times-Bold")
      .fontSize(14)
      .text("Event Details:", { underline: true });
    doc.moveDown(0.5);

    doc
      .fillColor("#000000")
      .font("Times-Roman")
      .fontSize(12)
      .text(`Location: ${event.location}`)
      .text(`Start Date: ${new Date(event.startDate).toLocaleDateString()}`)
      .text(`End Date: ${new Date(event.endDate).toLocaleDateString()}`)
      .text(`Type: ${event.eventType}`)
      .text(`Status: ${event.status}`)
      .moveDown();

    doc
      .fillColor("#003366")
      .font("Times-Bold")
      .text("Event Description:", { underline: true });
    doc
      .fillColor("#000000")
      .font("Times-Roman")
      .text(event.description || "No description provided")
      .moveDown();

    doc
      .fillColor("#003366")
      .font("Times-Bold")
      .text("Participants:", { underline: true })
      .moveDown(0.5);
    event.participants.forEach((participant: any, index: number) => {
      if (participant.role !== "Attendee") {
        doc
          .fillColor("#000000")
          .font("Times-Roman")
          .text(
            `${index + 1}. ${participant.memberId?.fullName} - ${
              participant.role
            }`
          );
      }
    });
    doc.moveDown();

    doc
      .fillColor("#003366")
      .font("Times-Bold")
      .text("Key Performance Indicators:", { underline: true })
      .moveDown(0.5);
    doc
      .fillColor("#000000")
      .font("Times-Roman")
      .text(`Attendance: ${event?.kpis?.attendance}`);
    event?.kpis?.successMetrics?.forEach((metric: string, index: number) => {
      doc.text(`${index + 1}. ${metric}`);
    });
    doc.moveDown();

    console.log(event.donations);

    if (event?.donations?.length > 0) {
      doc
        .fillColor("#003366")
        .font("Times-Bold")
        .text("Donations Received:", { underline: true })
        .moveDown(0.5);

      const tableStartX = 50;
      const columnWidths = [50, 250, 100];
      const tableHeaderColor = "#003366";
      const tableTextColor = "#000000";

      doc
        .fillColor(tableHeaderColor)
        .font("Times-Bold")
        .text("No.", tableStartX, doc.y)
        .text("Donor Name", tableStartX + columnWidths[0], doc.y)
        .text(
          "Amount",
          tableStartX + columnWidths[0] + columnWidths[1],
          doc.y,
          { align: "right" }
        );

      doc.moveDown(0.5);

      event?.donations.forEach((donation: any, index: number) => {
        doc
          .fillColor(tableTextColor)
          .font("Times-Roman")
          .text(`${index + 1}`, tableStartX, doc.y)
          .text(donation.donorName, tableStartX + columnWidths[0], doc.y)
          .text(
            `₹${donation.monetaryDetails.amount}`,
            tableStartX + columnWidths[0] + columnWidths[1],
            doc.y,
            { align: "right" }
          );

        doc.moveDown(0.5);
      });

      doc.moveDown();
    }

    doc
      .moveDown(2)
      .fillColor("#555555")
      .font("Times-Bold")
      .fontSize(10)
      .text("Generated by NGO Stream", { align: "center" });

    doc.end();

    stream.on("finish", async () => {
      try {
        const pdfUrl = await uploadOnCloudinary(filePath);
        event.eventReport = pdfUrl ? pdfUrl.url : "";
        await event.save();
        res
          .status(200)
          .json(
            new SuccessResponse(200, event, "Report generated successfully")
          );
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ message: "Error uploading PDF to Cloudinary" });
      }
    });
  }
);

const getEventNames = asyncHandler(async (req: any, res: Response) => {
  console.log("Requested");
  const eventNames = await Event.find().select("_id name donations");

  const donations = await Promise.all(
    eventNames.map(async (event) => {
      const donations = await Donation.find({ eventId: event._id });

      const inKindDonations = donations
        .filter((d) => d.donationType === "In-Kind")
        .map((d) => ({
          itemName: d.inKindDetails?.itemName,
          quantity: d.inKindDetails?.quantity,
        }));

      const monetaryDonations = donations
        .filter((d) => d.donationType === "Monetary")
        .reduce((total, d) => total + (d.monetaryDetails?.amount || 0), 0);

      return {
        id: event._id,
        name: event.name,
        donations: {
          inKind: inKindDonations,
          monetary: monetaryDonations,
        },
      };
    })
  );

  return res
    .status(200)
    .json(new SuccessResponse(200, donations, "Names fetched successfully"));
});

export {
  createEvent,
  getAllEvents,
  editEvent,
  getEvent,
  addEventFeedback,
  getEventById,
  getEventNames,
};
