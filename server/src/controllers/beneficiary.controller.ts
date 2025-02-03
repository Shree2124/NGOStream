import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ErrorResponse } from "../utils/errorResponse";
import Beneficiary from "../models/beneficiary.model";
import { SuccessResponse } from "../utils/successResponse";

const createBeneficiary = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phoneNumber, age, address, gender } = req.body;

  if (
    [name, email, phoneNumber, age, address, gender].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ErrorResponse(400, "Please fill in all required fields.");
  }

  const existingBeneficiary = await Beneficiary.findOne({ phoneNumber });
  if (existingBeneficiary) {
    throw new ErrorResponse(
      400,
      "Beneficiary with this phoneNumber already exists."
    );
  }

  const newBeneficiary = await Beneficiary.create({
    gender,
    age,
    name,
    email,
    address,
    phoneNumber,
  });

  if (!newBeneficiary) {
    throw new ErrorResponse(400, "Beneficiary could not be created.");
  }

  res
    .status(201)
    .json(
      new SuccessResponse(
        201,
        newBeneficiary,
        "Beneficiary created successfully"
      )
    );
});

/* These Scheme related controllers should be created after defining scheme related controllers and model */
const enrollBeneficiaryInScheme = asyncHandler(async (req: Request, res: Response) => {
  const { schemeId } = req.params;
  const { beneficiaryId } = req.body;
  if (!schemeId) {
    throw new ErrorResponse(400, "Please provide a scheme ID");
  }

  // const scheme = await Scheme.findById(schemeId);

  // if(!scheme){
  //     throw new ErrorResponse(404, "Scheme not found");
  //}
});



const getAllBeneficiaries = asyncHandler(async (req: Request, res: Response) => {
  const beneficiaries = await Beneficiary.find();
  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        beneficiaries,
        "Beneficiaries fetched successfully"
      )
    );
});

const getBeneficiaryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const beneficiary = await Beneficiary.findById(id);

    if(!beneficiary){
        throw new ErrorResponse(404, "Beneficiary not found");
    }

    res
    .status(200)
    .json(new SuccessResponse(200, beneficiary, "Beneficiary fetched successfully"));
});

const updateBeneficiary = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, phoneNumber, age, address} = req.body;

    if(!id){
        throw new ErrorResponse(400, "Please provide a beneficiary ID");
    }

    const benficiary = await Beneficiary.findById(id);

    if(!benficiary){
        throw new ErrorResponse(404, "Beneficiary not found");
    }

    
});

const deleteBeneficiary = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const beneficiary = await Beneficiary.findByIdAndDelete(id);

    if(!beneficiary){
        throw new ErrorResponse(404, "Beneficiary not found");
    }

    res
    .status(200)
    .json(new SuccessResponse(200, beneficiary, "Beneficiary deleted successfully"));
});

