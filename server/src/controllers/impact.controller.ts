import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import uploadOnCloudinary from "../utils/cloudinary";
import { SuccessResponse } from "../utils/successResponse";
import { Impact } from "../models/impact.models";

const getAllImpacts = asyncHandler(async(req:any, res: Response)=>{
  const impacts = await Impact.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    {
      $lookup: {
        from: "goals",
        localField: "goalId",
        foreignField: "_id",
        as: "goal",
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$goal", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "donations",
        let: { goalId: "$goalId", eventId: "$eventId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$goalId", "$$goalId"] },
                  { $eq: ["$eventId", "$$eventId"] }
                ]
              }
            }
          }
        ],
        as: "allDonations"
      }
    },

    {
      $addFields: {
        eventName: "$event.name",
        goalName: "$goal.name",

        monetaryDonations: {
          $filter: {
            input: "$allDonations",
            as: "donation",
            cond: { $eq: ["$$donation.donationType", "Monetary"] }
          }
        },
        inKindDonations: {
          $filter: {
            input: "$allDonations",
            as: "donation",
            cond: { $eq: ["$$donation.donationType", "In-Kind"] }
          }
        }
      }
    },

    {
      $addFields: {
        totalMonetaryDonations: {
          $sum: { $ifNull: ["$monetaryDonations.monetaryDetails.amount", 0] }
        },
        totalInKindDonations: {
          $sum: { $ifNull: ["$inKindDonations.inKindDetails.estimatedValue", 0] }
        }
      }
    },

    {
      $project: {
        _id: 1,
        description: 1,
        donationType: 1,
        images: 1,
        eventId: 1,
        goalId: 1,
        eventName: 1,
        goalName: 1,
        totalMonetaryDonations: 1,
        totalInKindDonations: 1
      }
    }
  ]);

  console.log(impacts);

  return res.status(200).json(new SuccessResponse(200, impacts, "Impacts fetched successfully"));
});


const createImpact = asyncHandler(async (req: any, res: Response) => {
  const {
    eventId,
    goalId,
    description,
  } = req.body;

  if (!description) throw new ErrorResponse(400, "Description Required");

  if (!req.files || req.files.length === 0) {
    throw new ErrorResponse(400, "At least one image is required");
  }

  const images = req.files as Express.Multer.File[];

  let uploadImages: string[] = [];

  for (const f of images) {
    const result = await uploadOnCloudinary(f.path);
    if (result) {
      uploadImages.push(result?.url);
    }
  }

  if (uploadImages.length <= 0)
    throw new ErrorResponse(500, "Failed to upload images");

  const impact = await Impact.create({
    eventId: eventId ? eventId : null,
    goalId: goalId ? goalId : null,
    description,
    images: uploadImages,
  });

  return res
    .status(201)
    .json(new SuccessResponse(201, impact, "Impact created successfully"));
});

const updateImpact = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const {
    eventId,
    goalId,
    description,  
  } = req.body;

  console.log(id)

  console.log(req.body)
  console.log(req.file)

  const impact = await Impact.findOne({ _id: id });

  if (!impact) throw new ErrorResponse(404, "Impact not found");

  let images = [];
  let result;
  let uploadImages: string[] = [];

  if (req.files && req.files.length > 0) {
    images = req.files as Express.Multer.File[];

    for (const f of images) {
      result = await uploadOnCloudinary(f.path);
      if (result) {
        uploadImages.push(result?.url);
      }
    }

    if (uploadImages.length <= 0)
      throw new ErrorResponse(500, "Failed to upload images");
  }

  impact.eventId = eventId ? eventId : impact.eventId;
  impact.goalId = goalId ? goalId : impact.goalId;
  impact.description = description ? description : impact.description;
  if (uploadImages.length > 0) {
    impact.images = [...impact.images, ...uploadImages];
  }

  await impact.save();

  return res
    .status(200)
    .json(new SuccessResponse(200, impact, "Impact updated successfully"));
});

const deleteImpact = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const impact = await Impact.findById(id);

  if (!impact) {
    throw new ErrorResponse(404, "Impact not found");
  }

  await Impact.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new SuccessResponse(200, null, "Impact deleted successfully"));
});

export { createImpact, deleteImpact, updateImpact, getAllImpacts };
