import { Request, Response } from "express";
import Stripe from "stripe";
import { Donor } from "../models/donors.model";
import { Donation } from "../models/donations.model";
import { Goal } from "../models/goals.model";
import { Event } from "../models/events.model";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import { IGoals } from "../types/goals.types";
import { IDonation } from "../types/donation.types";
import { asyncHandler } from "../utils/asyncHandler";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    address,
    goalId,
    eventId,
    beneficiaryId,
    donationType,
    amount,
    itemName,
    quantity,
    image,
    estimatedValue,
    description,
  } = req.body;

  console.log(req.body);
  

  // Ensure amount is parsed as a number
  const parsedAmount = parseFloat(amount);
  console.log(parsedAmount);
   // Parse amount to float

  // Validate required fields
  if (!name || !email || !phone || !address || !donationType) {
    throw new ErrorResponse(400, "Missing required fields");
  }

  // Validation for monetary donations
  if (donationType === "Monetary") {
    if (!goalId && !eventId && !beneficiaryId) {
      throw new ErrorResponse(
        400,
        "A monetary donation must be associated with a goal, event, or beneficiary"
      );
    }
    if (!parsedAmount || parsedAmount <= 0) {
      throw new ErrorResponse(400, "Invalid amount for monetary donation");
    }
  }
  // Validation for in-kind donations
  else if (donationType === "In-Kind") {
    if (!itemName || !quantity || quantity <= 0) {
      throw new ErrorResponse(
        400,
        "Invalid itemName or quantity for in-kind donation"
      );
    }
  } else {
    throw new ErrorResponse(400, "Invalid donation type");
  }

  // Check if the donor exists, if not, create a new donor
  let donor = await Donor.findOne({ email });
  if (!donor) {
    donor = await Donor.create({
      name,
      email,
      phone,
      address,
      donations: [],
    });
  }

  // Create Stripe session for monetary donation
  let session = null;
  if (donationType === "Monetary") {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation for ${goalId || eventId || beneficiaryId}`,
            },
            unit_amount: parsedAmount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/donation-cancel`,
      metadata: {
        donorId: donor._id.toString(),
        goalId,
        eventId,
        beneficiaryId,
        amount: parsedAmount.toString(),
      },
    });
  }

  // Create donation entry in the database
  const donation = await Donation.create({
    donorId: donor._id,
    donationType,
    goalId,
    eventId,
    beneficiaryId,
    currency: donationType === "Monetary" ? "USD" : undefined,
    paymentStatus:
      donationType === "Monetary"
        ? "Pending"
        : undefined,
    paymentMethod: donationType === "Monetary" ? "Card" : undefined,
    stripeSessionId: session?.id,
    monetaryDetails:
      donationType === "Monetary"
        ? {
            amount: parsedAmount,
            currency: "USD",
            paymentMethod: "Card",
            paymentStatus: "Pending",
          }
        : undefined,
    inKindDetails:
      donationType === "In-Kind"
        ? { itemName, quantity, image, estimatedValue, description }
        : undefined,
  });

  donor.donations.push(donation._id);
  await donor.save();

  // Update event if available
  if (eventId) {
    const event = await Event.findById(eventId);
    if (event) {
      event.kpis.fundsRaised = (event.kpis.fundsRaised || 0) + parsedAmount;
      event.donations.push(donation._id);
      await event.save();
    } else {
      throw new ErrorResponse(404, "Event not found");
    }
  }

  // Return the session ID and URL for the checkout session
  res.status(200).json(
    new SuccessResponse(
      200,
      {
        sessionId: session?.id,
        url: session?.url,
        donorId: donor._id,
      },
      "Session created successfully"
    )
  );
};

export const handlePaymentSuccess = asyncHandler(
  async (req: Request, res: Response) => {
    const { session_id } = req.body;

    if (!session_id) {
      throw new ErrorResponse(400, "Missing session_id");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const donation: IDonation | any = await Donation.findOne({
      stripeSessionId: session.id,
    });

    if (!donation) {
      throw new ErrorResponse(404, "Donation not found");
    }

    if (donation.donationType === "Monetary") {
      donation.paymentStatus = "Successful";
      donation.stripePaymentId = session.payment_intent as string;
      await donation.save();
    }

    if (donation.goalId) {
      const goal = await Goal.findById(donation.goalId);
      if (goal) {
        // Ensure goal.currentAmount is initialized as a valid number
        goal.currentAmount = (Number(goal.currentAmount) || 0) + (Number(donation.amount) || 0);
        goal.donations.push(donation._id);
        await goal.save();
      }
    }

    if (donation.eventId) {
      const event = await Event.findById(donation.eventId);
      if (event) {
        event.kpis.fundsRaised =
          (event.kpis.fundsRaised || 0) + (Number(donation.amount) || 0);
        event.donations.push(donation._id);
        await event.save();
      }
    }

    res
      .status(200)
      .json(new SuccessResponse(200, null, "Payment processed successfully"));
  }
);


export const getDonationInformation = asyncHandler(
  async (req: any, res: Response) => {
    const donationInfo = await Donation.aggregate([
      {
        $lookup: {
          from: "donors",
          localField: "donorId",
          foreignField: "_id",
          as: "donorInfo",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goalId",
          foreignField: "_id",
          as: "goalInfo",
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventInfo",
        },
      },
      // {
      //   $lookup: {
      //     from: "beneficiaries",
      //     localField: "beneficiaryId",
      //     foreignField: "_id",
      //     as: "beneficiaryInfo",
      //   },
      // },
      {
        $project: {
          _id: 1,
          donorInfo: { $arrayElemAt: ["$donorInfo", 0] },
          goalInfo: { $arrayElemAt: ["$goalInfo", 0] },
          eventInfo: { $arrayElemAt: ["$eventInfo", 0] },
          // beneficiaryInfo: { $arrayElemAt: ["$beneficiaryInfo", 0] },
          amount: 1,
          currency: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
          updatedAt: 1,
          donationType: 1,
          inKindDetails: 1,
        },
      },
    ]);

    if (!donationInfo || donationInfo.length === 0)
      throw new ErrorResponse(404, "Donations not found");

    return res
      .status(200)
      .json(new SuccessResponse(200, donationInfo, "Donations found"));
  }
);
