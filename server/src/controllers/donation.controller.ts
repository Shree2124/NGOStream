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
import { generatePDFReceipt } from "../utils/receiptCreation";
import uploadOnCloudinary from "../utils/cloudinary";
import { sendReceiptEmail } from "../utils/sendMail";
import { isValidObjectId } from "mongoose";

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

  const parsedAmount = parseFloat(amount);
  // console.log(parsedAmount);

  if (!name || !email || !phone || !address || !donationType) {
    throw new ErrorResponse(400, "Missing required fields");
  }

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
  } else if (donationType === "In-Kind") {
    if (!itemName || !quantity || quantity <= 0) {
      throw new ErrorResponse(
        400,
        "Invalid itemName or quantity for in-kind donation"
      );
    }
  } else {
    throw new ErrorResponse(400, "Invalid donation type");
  }

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
            unit_amount: parsedAmount * 100,
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

  const imagePath = req.file?.path;
  let uploadedImage;
  if (imagePath) {
    uploadedImage = await uploadOnCloudinary(imagePath);
  }

  const donation = await Donation.create({
    donorId: donor._id,
    donationType,
    goalId,
    eventId,
    beneficiaryId,
    currency: donationType === "Monetary" ? "USD" : undefined,
    paymentStatus: donationType === "Monetary" ? "Pending" : undefined,
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
        ? {
            itemName,
            quantity,
            image: uploadedImage ? uploadedImage.url : "",
            estimatedValue,
            description,
            status: "Pending",
          }
        : undefined,
  });

  donor.donations.push(donation._id);
  await donor.save();

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

  if (donationType === "Monetary") {
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
  } else if (donationType === "In-Kind") {
    res
      .status(200)
      .json(
        new SuccessResponse(200, donation, "Donation created successfully")
      );
  }
};

export const handlePaymentSuccess = asyncHandler(
  async (req: Request, res: Response) => {
    const { session_id } = req.body;

    if (!session_id) {
      throw new ErrorResponse(400, "Missing session_id");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const donor = await Donor.findOne({ _id: session.metadata?.donorId });
    if (!donor) {
      throw new ErrorResponse(404, "Donor not found");
    }

    const donation: IDonation | any = await Donation.findOne({
      stripeSessionId: session?.id,
    });

    if (!donation) {
      throw new ErrorResponse(404, "Donation not found");
    }

    if (donation.donationType === "Monetary") {
      donation.monetaryDetails.paymentStatus = "Successful";
      donation.stripePaymentId = session.payment_intent as string;
      await donation.save();
    }

    if (donation.goalId) {
      const goal = await Goal.findById(donation.goalId);

      if (goal) {
        const isDonationAdded = goal.donations.some(
          (id) => id.toString() === donation._id.toString()
        );

        if (isDonationAdded) {
          throw new ErrorResponse(400, "donation already exist");
        }
        goal.currentAmount =
          (Number(goal.currentAmount) || 0) +
          (Number(donation.monetaryDetails.amount) || 0);
        goal.donations.push(donation._id);

        try {
          const pdfPath: string | any = await generatePDFReceipt(
            donation,
            donor
          );
          const uploadResponse = await uploadOnCloudinary(pdfPath);

          if (uploadResponse) {
            await sendReceiptEmail(donor, uploadResponse.url, donation);
            donation.sendReceipt = true;
          }

          await goal.save();
          await donation.save();
          console.log("Goal and donation saved successfully");
        } catch (error) {
          console.error("Error generating PDF or sending email:", error);
        }
      }
    }

    if (donation.eventId) {
      const event = await Event.findById(donation.eventId);

      if (event) {
        event.kpis.fundsRaised =
          (event.kpis.fundsRaised || 0) +
          (Number(donation.monetaryDetails.amount) || 0);
        const isDonationAdded = event.donations.some(
          (id) => id.toString() === donation._id.toString()
        );

        if (!isDonationAdded) {
          event.donations.push(donation._id);
        }

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
    const { type } = req.params;

    // console.log(type);

    if (type !== "Monetary" && type !== "In-Kind")
      throw new ErrorResponse(400, "Not a valid type");

    const donationInfo = await Donation.aggregate([
      {
        $match: { donationType: type },
      },
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
      {
        $project: {
          _id: 1,
          donationType: 1,
          stripeSessionId: 1,
          stripePaymentId: 1,
          donorInfo: { $arrayElemAt: ["$donorInfo", 0] },
          goalInfo: { $arrayElemAt: ["$goalInfo", 0] },
          createdAt: 1,
          updatedAt: 1,
          ...(type === "Monetary"
            ? {
                amount: "$monetaryDetails.amount",
                currency: "$monetaryDetails.currency",
                paymentStatus: "$monetaryDetails.paymentStatus",
                paymentMethod: "$monetaryDetails.paymentMethod",
                monetaryDetails: 1,
              }
            : {
                estimatedValue: "$inKindDetails.estimatedValue",
                currency: "$inKindDetails.currency",
                status: "$inKindDetails.status",
                itemDetails: "$inKindDetails.items",
                inKindDetails: 1,
              }),
        },
      },
    ]);

    // console.log(donationInfo);

    if (!donationInfo || donationInfo.length === 0)
      throw new ErrorResponse(404, "Donations not found");

    return res
      .status(200)
      .json(new SuccessResponse(200, donationInfo, "Donations found"));
  }
);

export const updateDonationStatus = asyncHandler(
  async (req: any, res: Response) => {
    const { donationId, status } = req.body;
    if (!isValidObjectId(donationId))
      throw new ErrorResponse(400, "Invalid donation id");

    if (!status) throw new ErrorResponse(400, "Status is required");

    const donation = await Donation.findById(donationId);

    if (!donation) throw new ErrorResponse(400, "Donation not found");

    if (status !== "Pending" && status !== "Donated")
      throw new ErrorResponse(400, "Invalid status");

    if (donation.inKindDetails) donation.inKindDetails.status = status;

    await donation.save();

    return res
      .status(200)
      .json(new SuccessResponse(200, donation, "Donation status updated"));
  }
);


export const manualDonation = asyncHandler(async (req: Request, res: Response) => {
  const {
    donorInfo,
    donationType,
    goalType,
    goalId,
    amount,
    paymentMethod,
    paymentStatus,
    currency,
    inKindDetails,
  } = req.body;

  console.log(req.body);

  // Validate required fields
  if (!donorInfo || !donorInfo.name || !donorInfo.email || !donorInfo.phone || !donorInfo.address) {
    throw new ErrorResponse(400, "Donor name, email, phone, and address are required");
  }

  if (!donationType || (donationType !== "Monetary" && donationType !== "In-Kind")) {
    throw new ErrorResponse(400, "Invalid donation type");
  }

  if (donationType === "Monetary") {
    if (!amount || amount <= 0) {
      throw new ErrorResponse(400, "Invalid amount for monetary donation");
    }
    if (!paymentMethod || !paymentStatus) {
      throw new ErrorResponse(400, "Payment method and status are required for monetary donations");
    }
  } else if (donationType === "In-Kind") {
    console.log(inKindDetails);
    if (!inKindDetails["itemName"] || inKindDetails["quantity"] === "" || inKindDetails["quantity"] <= 0) {
      throw new ErrorResponse(400, "Item name and quantity are required for in-kind donations");
    }
  }

  if (!goalType || (goalType !== "Campaign" && goalType !== "Event")) {
    throw new ErrorResponse(400, "Invalid goal type");
  }

  if (!goalId || !isValidObjectId(goalId)) {
    throw new ErrorResponse(400, "Invalid goal ID");
  }

  // Find or create the donor
  let donor = await Donor.findOne({ email: donorInfo.email });
  if (!donor) {
    donor = await Donor.create({
      name: donorInfo.name,
      email: donorInfo.email,
      phone: donorInfo.phone || "",
      address: donorInfo.address || "",
      donations: [],
    });
  } else {
    // Update donor's phone and address if they already exist
    donor.phone = donorInfo.phone || donor.phone;
    donor.address = donorInfo.address || donor.address;
    await donor.save();
  }

  // Handle image upload for in-kind donations
  let imageUrl = "";
  if (donationType === "In-Kind" && req.file) {
    const imagePath = req.file.path;
    const uploadResponse = await uploadOnCloudinary(imagePath);
    if (uploadResponse) {
      imageUrl = uploadResponse.url;
    }
  }

  // Create the donation
  const donation = await Donation.create({
    donorId: donor._id,
    donationType,
    goalId: goalType === "Campaign" ? goalId : null,
    eventId: goalType === "Event" ? goalId : null,
    currency: donationType === "Monetary" ? currency || "USD" : undefined,
    paymentStatus: donationType === "Monetary" ? paymentStatus : undefined,
    paymentMethod: donationType === "Monetary" ? paymentMethod : undefined,
    monetaryDetails:
      donationType === "Monetary"
        ? {
            amount,
            currency: currency || "USD",
            paymentMethod,
            paymentStatus,
          }
        : undefined,
    inKindDetails:
      donationType === "In-Kind"
        ? {
            itemName: inKindDetails.itemName, // Corrected typo: itemNme -> itemName
            quantity: inKindDetails.quantity,
            estimatedValue: inKindDetails.estimatedValue,
            description: inKindDetails.description,
            status: "Donated", // Default status for manual in-kind donations
            image: imageUrl, // Add the uploaded image URL
          }
        : undefined,
  });

  // Update the donor's donations array
  donor.donations.push(donation._id);
  await donor.save();

  // Update the event or campaign
  if (goalType === "Campaign") {
    const campaign: any = await Goal.findById(goalId);
    if (campaign) {
      campaign.donations.push(donation._id);
      if (donationType === "Monetary") {
        campaign.currentAmount = (campaign.currentAmount || 0) + amount;
      }
      await campaign.save();
    } else {
      throw new ErrorResponse(404, "Campaign not found");
    }
  } else if (goalType === "Event") {
    const event = await Event.findById(goalId);
    if (event) {
      event.donations.push(donation._id);
      if (donationType === "Monetary") {
        event.kpis.fundsRaised = (event.kpis.fundsRaised || 0) + amount;
      }
      await event.save();
    } else {
      throw new ErrorResponse(404, "Event not found");
    }
  }

  // Generate and send a receipt (optional)
  if (donationType === "Monetary" || donationType === "In-Kind") {
    try {
      const pdfPath: string | any = await generatePDFReceipt(donation, donor);
      const uploadResponse = await uploadOnCloudinary(pdfPath);
  
      if (uploadResponse) {
        console.log("Donor:", donor);
        await sendReceiptEmail(donor, uploadResponse.url, donation);
        donation.sendReceipt = true;
        console.log("Receipt sent:", donation.sendReceipt);
        await donation.save();
      }
    } catch (error) {
      console.error("Error generating PDF or sending email:", error);
    }
  }

  // Return the created donation
  res
    .status(201)
    .json(new SuccessResponse(201, donation, "Manual donation created successfully"));
});