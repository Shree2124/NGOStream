import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import uploadOnCloudinary from "../utils/cloudinary";
import { SuccessResponse } from "../utils/successResponse";
import { Impact } from "../models/impact.models";

const createImpact = asyncHandler(async (req: any, res: Response) => {
  const {
    eventId,
    beneficiaryId,
    goalId,
    description,
    donationType,
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
    beneficiaryId: beneficiaryId ? beneficiaryId : null,
    goalId: goalId ? goalId : null,
    description,
    donationType,
    images: uploadImages,
  });

  return res
    .status(201)
    .json(new SuccessResponse(201, impact, "Impact created successfully"));
});

export { createImpact };
