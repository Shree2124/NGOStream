import { Response } from "express";
import { Goal } from "../models/goals.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import mongoose, { isValidObjectId } from "mongoose";
import uploadOnCloudinary from "../utils/cloudinary";
import { Donation } from "../models/donations.model";
import { Donor } from "../models/donors.model";

const createGoal = asyncHandler(async (req: any, res: Response) => {
  const { name, description, startDate, targetAmount, status } = req.body;

  if (!name || typeof name !== "string") {
    throw new ErrorResponse(400, "Name is required and must be a string.");
  }

  if (!description || typeof description !== "string") {
    throw new ErrorResponse(
      400,
      "Description is required and must be a string."
    );
  }

  if (!startDate || isNaN(new Date(startDate).getTime())) {
    throw new ErrorResponse(
      400,
      "Start date is required and must be a valid date."
    );
  }

  if (targetAmount === undefined || typeof targetAmount !== "number") {
    throw new ErrorResponse(
      400,
      "Target amount is required and must be a number."
    );
  }

  if (!status || typeof status !== "string") {
    throw new ErrorResponse(400, "Status is required and must be a string.");
  }

  const goal = await Goal.create({
    name,
    description,
    startDate,
    targetAmount,
    status,
    donations: [],
  });

  if (!goal) {
    throw new ErrorResponse(500, "Something went wrong while creating goal");
  }

  return res
    .status(201)
    .json(new SuccessResponse(201, goal, "Goal created successfully"));
});

const getAllGoals = asyncHandler(async (req: any, res: Response) => {
  const allGoals = await Goal.find();

  if (!allGoals || allGoals.length === 0) {
    throw new ErrorResponse(404, "Goals not found");
  }

  return res
    .status(200)
    .json(new SuccessResponse(200, allGoals, "Goals fetched successfully"));
});

const getGoal = asyncHandler(async (req: any, res: Response) => {
  const { goalId } = req.params;

  if (!goalId || !isValidObjectId(goalId)) {
    throw new ErrorResponse(400, "Invalid or missing goal ID");
  }

  const goal = await Goal.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(goalId) },
    },
    {
      $lookup: {
        from: "donations",
        localField: "donations",
        foreignField: "_id",
        as: "donationDetails",
      },
    },
    {
      $unwind: {
        path: "$donationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "donors",
        localField: "donationDetails.donorId",
        foreignField: "_id",
        as: "donorDetails",
      },
    },
    {
      $unwind: {
        path: "$donorDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        targetAmount: { $first: "$targetAmount" },
        currentAmount: { $first: "$currentAmount" },
        startDate: { $first: "$startDate" },
        status: { $first: "$status" },
        image: { $first: "$image" },
        donations: {
          $push: {
            donationId: "$donationDetails._id",
            amount: {
              $cond: {
                if: { $eq: ["$donationDetails.donationType", "Monetary"] },
                then: "$donationDetails.monetaryDetails.amount",
                else: null,
              },
            },
            donorName: "$donorDetails.name",
            donorEmail: "$donorDetails.email",
            itemName: {
              $cond: {
                if: { $eq: ["$donationDetails.donationType", "In-Kind"] },
                then: "$donationDetails.inKindDetails.itemName",
                else: null,
              },
            },
          },
        },
      },
    },
  ]);

  if (!goal || goal.length === 0) {
    throw new ErrorResponse(404, "Goal not found");
  }

  return res
    .status(200)
    .json(new SuccessResponse(200, goal, "Goal details fetched successfully"));
});

const editGoal = asyncHandler(async (req: any, res: Response) => {
  const { goalId } = req.params;
  const { name, description, targetAmount, startDate, status } = req.body;

  if (!goalId || !isValidObjectId(goalId)) {
    throw new ErrorResponse(400, "Invalid goal ID");
  }

  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new ErrorResponse(404, "Goal not found");
  }

  let image;
  if (req.file) {
    image = req.file.path;
  }

  if (image) {
    const uploadImage = await uploadOnCloudinary(image);
    if (!uploadImage) {
      throw new ErrorResponse(500, "Failed to upload image");
    }
    goal.image = uploadImage.url;
  }

  goal.name = name;
  goal.description = description;
  goal.targetAmount = targetAmount;
  goal.startDate = startDate;
  goal.status = status;

  const updatedGoal = await goal.save();

  return res
    .status(200)
    .json(new SuccessResponse(200, updatedGoal, "Goal updated successfully"));
});

const deleteGoal = asyncHandler(async (req: any, res: Response) => {
  const { goalId } = req.params;

  if (!goalId || !isValidObjectId(goalId)) {
    throw new ErrorResponse(400, "Invalid goal ID");
  }

  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new ErrorResponse(404, "Goal not found");
  }

  const donations = await Donation.find({ _id: { $in: goal.donations } });

  for (const donation of donations) {
    if (donation.donorId) {
      const donor = await Donor.findById(donation.donorId);
      if (donor) {
        donor.donations = donor.donations.filter(
          (donationId) => donationId.toString() !== donation._id.toString()
        );
        await donor.save();
      }
    }
  }

  await Donation.deleteMany({ _id: { $in: goal.donations } });

  await goal.deleteOne();

  return res
    .status(200)
    .json(
      new SuccessResponse(200, null, "Goal and donations deleted successfully")
    );
});

export { createGoal, getAllGoals, editGoal, deleteGoal, getGoal };
