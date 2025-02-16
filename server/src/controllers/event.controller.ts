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

  console.log(req.body.participants)

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

  if (!rating || !feedbackText) throw new ErrorResponse(400, "rating and feedback is required");

  const event = await Event.findById(eventId);

  event?.feedback.push(
    {
      feedbackText: feedbackText,
      rating: rating,
    }
  )

  await event?.save();

  res.status(200).json(new SuccessResponse(200, "Event feedback added successfully"));
});

const getEventById = asyncHandler(async(req: any, res)=>{
  const {eventId} = req.params

  const event = await Event.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(eventId) }
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
  ]);

  return res.status(200).json(new SuccessResponse(200, event, ""))
})

export const generateEventReport = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;

    // Fetch event from database
    const event: IEvent | any = await Event.findById(eventId)
      .populate("participants.memberId", "fullName email")
      .populate("donations");

    console.log(event)

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create a PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filePath = path.join(__dirname, `event_${eventId}_report.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Set Professional Font
    doc.font("Times-Roman");

    // Add Organization Logo
    const logoPath = path.join(__dirname, "../../public/ngo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 80, 35, { width: 60 });
    }

    // Organization Name (Centered, Blue)
    doc
      .fillColor("#003366") // Dark Blue Color
      .font("Times-Bold")
      .fontSize(20)
      .text("NGO Stream", { align: "center" });

      // Event Title (Centered, Dark Red)
      doc
        .fillColor("#800000") // Dark Red
        .font("Times-Bold")
        .fontSize(18)
        .text(`Event Report: ${event.name}`, { align: "center" });
  
      doc.moveDown(1);

    // 📅 Report Date (Right-Aligned, Gray)
    doc
      .fillColor("#555555") // Gray Color
      .font("Times-Roman")
      .fontSize(12)
      .text(`Report Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.moveDown(2);


    // 📝 Event Details Section
    doc.fillColor("#003366").font("Times-Bold").fontSize(14).text("Event Details:", { underline: true });
    doc.moveDown(0.5);
    
    doc
      .fillColor("#000000") // Black Color
      .font("Times-Roman")
      .fontSize(12)
      .text(`Location: ${event.location}`)
      .text(`Start Date: ${new Date(event.startDate).toLocaleDateString()}`)
      .text(`End Date: ${new Date(event.endDate).toLocaleDateString()}`)
      .text(`Type: ${event.eventType}`)
      .text(`Status: ${event.status}`)
      .moveDown();

    // Event Description
    doc.fillColor("#003366").font("Times-Bold").text("Event Description:", { underline: true });
    doc.fillColor("#000000").font("Times-Roman").text(event.description || "No description provided").moveDown();

    // Participants List
    doc.fillColor("#003366").font("Times-Bold").text("Participants:", { underline: true }).moveDown(0.5);
    event.participants.forEach((participant: any, index: number) => {
      doc
        .fillColor("#000000")
        .font("Times-Roman")
        .text(`${index + 1}. ${participant.memberId?.fullName} - ${participant.role}`);
    });
    doc.moveDown();

    // Key Performance Indicators (KPIs)
    doc.fillColor("#003366").font("Times-Bold").text("Key Performance Indicators:", { underline: true }).moveDown(0.5);
    doc.fillColor("#000000").font("Times-Roman").text(`Attendance: ${event?.kpis?.attendance}`);
    event?.kpis?.successMetrics?.forEach((metric: string, index: number) => {
      doc.text(`${index + 1}. ${metric}`);
    });
    doc.moveDown();

    // Donations Table (Formatted)
    if (event.donations.length > 0) {
      doc.fillColor("#003366").font("Times-Bold").text("Donations Received:", { underline: true }).moveDown(0.5);

      const tableStartX = 50;
      const columnWidths = [50, 250, 100];
      const tableHeaderColor = "#003366";
      const tableTextColor = "#000000";

      // Table Header
      doc
        .fillColor(tableHeaderColor)
        .font("Times-Bold")
        .text("No.", tableStartX, doc.y)
        .text("Donor Name", tableStartX + columnWidths[0], doc.y)
        .text("Amount", tableStartX + columnWidths[0] + columnWidths[1], doc.y, { align: "right" });

      doc.moveDown(0.5);

      // Table Rows
      event.donations.forEach((donation: any, index: number) => {
        doc
          .fillColor(tableTextColor)
          .font("Times-Roman")
          .text(`${index + 1}`, tableStartX, doc.y)
          .text(donation.donorName, tableStartX + columnWidths[0], doc.y)
          .text(`₹${donation.amount}`, tableStartX + columnWidths[0] + columnWidths[1], doc.y, { align: "right" });

        doc.moveDown(0.5);
      });

      doc.moveDown();
    }

    // 📌 Footer
    doc
      .moveDown(2)
      .fillColor("#555555")
      .font("Times-Bold")
      .fontSize(10)
      .text("Generated by NGO Stream", { align: "center" });

    // Finalize PDF
    doc.end();

    stream.on("finish",async () => {
      try {
        const pdfUrl = await uploadOnCloudinary(filePath);
        res.json({ message: "PDF report generated", pdfUrl: pdfUrl ? pdfUrl.url : "" });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ message: "Error uploading PDF to Cloudinary" });
      }
    });
  }
);


export { createEvent, getAllEvents, editEvent, getEvent, addEventFeedback,getEventById };
