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

const updateImpact = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const {
    eventId,
    beneficiaryId,
    goalId,
    description,
    donationType,    
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
  impact.beneficiaryId = beneficiaryId ? beneficiaryId : impact.beneficiaryId;
  impact.goalId = goalId ? goalId : impact.goalId;
  impact.description = description ? description : impact.description;
  impact.donationType = donationType ? donationType : impact.donationType;
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

export { createImpact, deleteImpact, updateImpact };
