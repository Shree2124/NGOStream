import { Request, Response } from "express";
import Stripe from "stripe";
import { Donar } from "../models/donors.model";
import { Donation } from "../models/donations.model";
import { Goal } from "../models/goals.model";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import { IGoals } from "../types/goals.types";
import { IDonation } from "../types/donations.types";
import { asyncHandler } from "../utils/asyncHandler";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
}) ;

export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, address, goalId, amount } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !goalId ||
      !amount ||
      amount <= 0
    ) {
      throw new ErrorResponse(400, "Invalid input data");
    }

    try {
      let donor = await Donar.findOne({ email });
      if (!donor) {
        donor = await Donar.create({
          name,
          email,
          phone,
          address,
          donations: [],
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Donation for Goal ID: ${goalId}`,
              },
              unit_amount: amount * 100,
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
          amount: amount.toString(),
        },
      });

      console.log(session);

      await Donation.create({
        donorId: donor._id,
        goalId,
        amount,
        currency: "USD",
        paymentStatus: "Pending",
        paymentMethod: "Card",
        stripeSessionId: session.id,
        // stripePaymentId: "",
      });

      res.status(200).json(
        new SuccessResponse(
          200,
          {
            sessionId: session.id,
            url: session.url,
          },
          "session created successfully"
        )
      );
    } catch (error) {
      console.error("Error creating Stripe session:", error);
      throw new ErrorResponse(500, "Failed to create stripe session");
    }
  }
);

export const handlePaymentSuccess = asyncHandler(
  async (req: Request, res: Response) => {
    const { session_id } = req.body;
    console.log(session_id);

    if (!session_id) {
      throw new ErrorResponse(400, "Missing session_id");
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        session_id as string
      );
      const donation: IDonation | any = await Donation.findOne({
        stripeSessionId: session.id,
      });
      if (!donation) {
        throw new ErrorResponse(404, "Donation not found");
      }

      donation.paymentStatus = "Successful";
      donation.stripePaymentId = session.payment_intent as string;
      await donation.save();

      const goal: IGoals | null = await Goal.findById(donation.goalId);
      if (goal) {
        goal.currentAmount =
          (goal.currentAmount.valueOf() || 0) + donation.amount!;
        goal.targetAmount =
          Number(donation.amount.valueOf() || 0) - goal.targetAmount;
        await goal.save();
      }

      res
        .status(200)
        .json(new SuccessResponse(200, "Payment processed successfully"));
    } catch (error) {
      console.error("Error handling payment success:", error);

      res.status(500).json({ message: "Error processing payment" });
    }
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
        $project: {
          _id: 1,
          donorInfo: { $arrayElemAt: ["$donorInfo", 0] },
          goalInfo: { $arrayElemAt: ["$goalInfo", 0] },
          amount: 1,
          currency: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
          updatedAt: 1,
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
