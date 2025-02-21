import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ErrorResponse } from "../utils/errorResponse";
import Beneficiary from "../models/beneficiary.model";
import { SuccessResponse } from "../utils/successResponse";
import mongoose from "mongoose";

// Create a new beneficiary
const createBeneficiary = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phoneNumber, age, address, gender } = req.body;

  // Validate required fields
  if (
    [name, email, phoneNumber, age, address, gender].some(
      (field) => !field || (typeof field === "string" && field.trim() === "")
    )
  ) {
    throw new ErrorResponse(400, "Please fill in all required fields.");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErrorResponse(400, "Please provide a valid email address.");
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new ErrorResponse(
      400,
      "Please provide a valid 10-digit phone number."
    );
  }

  // Validate age
  if (age < 0 || age > 120) {
    throw new ErrorResponse(
      400,
      "Please provide a valid age between 0 and 120."
    );
  }

  // Check for existing beneficiary
  const existingBeneficiary = await Beneficiary.findOne({
    $or: [{ phoneNumber }, { email }],
  });

  if (existingBeneficiary) {
    throw new ErrorResponse(
      400,
      existingBeneficiary.email === email
        ? "Beneficiary with this email already exists."
        : "Beneficiary with this phone number already exists."
    );
  }

  // Create new beneficiary
  const newBeneficiary = await Beneficiary.create({
    name,
    email,
    phoneNumber,
    age,
    address,
    gender,
    enrolledSchemes: [],
    benefitedSchemes: [],
  });

  if (!newBeneficiary) {
    throw new ErrorResponse(
      500,
      "Failed to create beneficiary. Please try again."
    );
  }

  // Return success response
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

// Get all beneficiaries with optional filtering and pagination
const getAllBeneficiaries = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      gender,
      minAge,
      maxAge,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filterQuery: any = {};

    if (gender) {
      filterQuery.gender = gender;
    }

    if (minAge || maxAge) {
      filterQuery.age = {};
      if (minAge) filterQuery.age.$gte = Number(minAge);
      if (maxAge) filterQuery.age.$lte = Number(maxAge);
    }

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const total = await Beneficiary.countDocuments(filterQuery);
    const beneficiaries = await Beneficiary.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("enrolledSchemes", "name description")
      .populate("benefitedSchemes", "name description");

    // Return with pagination metadata
    res.status(200).json(
      new SuccessResponse(
        200,
        {
          beneficiaries,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
        "Beneficiaries fetched successfully"
      )
    );
  }
);

// Get beneficiary by ID
const getBeneficiaryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid beneficiary ID format");
  }

  // Find beneficiary with populated scheme data
  const beneficiary = await Beneficiary.findById(id)
    .populate("enrolledSchemes", "name description startDate endDate benefits")
    .populate("benefitedSchemes", "name description benefits");

  if (!beneficiary) {
    throw new ErrorResponse(404, "Beneficiary not found");
  }

  res
    .status(200)
    .json(
      new SuccessResponse(200, beneficiary, "Beneficiary fetched successfully")
    );
});

// Update beneficiary
const updateBeneficiary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phoneNumber, age, address, gender } = req.body;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid beneficiary ID format");
  }

  // Find beneficiary
  const beneficiary = await Beneficiary.findById(id);
  if (!beneficiary) {
    throw new ErrorResponse(404, "Beneficiary not found");
  }

  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ErrorResponse(400, "Please provide a valid email address");
    }

    // Check if email already exists with another beneficiary
    const existingEmailBeneficiary = await Beneficiary.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingEmailBeneficiary) {
      throw new ErrorResponse(
        400,
        "Email already in use by another beneficiary"
      );
    }
  }

  // Validate phone number if provided
  if (phoneNumber) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new ErrorResponse(
        400,
        "Please provide a valid 10-digit phone number"
      );
    }

    // Check if phone number already exists with another beneficiary
    const existingPhoneBeneficiary = await Beneficiary.findOne({
      phoneNumber,
      _id: { $ne: id },
    });

    if (existingPhoneBeneficiary) {
      throw new ErrorResponse(
        400,
        "Phone number already in use by another beneficiary"
      );
    }
  }

  // Validate age if provided
  if (age !== undefined && (age < 0 || age > 120)) {
    throw new ErrorResponse(
      400,
      "Please provide a valid age between 0 and 120"
    );
  }

  // Update beneficiary
  const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(age !== undefined && { age }),
      ...(address && { address }),
      ...(gender && { gender }),
    },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        updatedBeneficiary,
        "Beneficiary updated successfully"
      )
    );
});

// Delete beneficiary
const deleteBeneficiary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid beneficiary ID format");
  }

  const beneficiary = await Beneficiary.findByIdAndDelete(id);

  if (!beneficiary) {
    throw new ErrorResponse(404, "Beneficiary not found");
  }

  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        { id: beneficiary._id },
        "Beneficiary deleted successfully"
      )
    );
});

// Enroll beneficiary in scheme
const enrollBeneficiaryInScheme = asyncHandler(
  async (req: Request, res: Response) => {
    const { schemeId } = req.params;
    const { beneficiaryId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(schemeId)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) {
      throw new ErrorResponse(400, "Invalid beneficiary ID format");
    }

    // Find the scheme
    const Scheme = mongoose.model("Scheme");
    const scheme = await Scheme.findById(schemeId);

    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Find the beneficiary
    const beneficiary = await Beneficiary.findById(beneficiaryId);

    if (!beneficiary) {
      throw new ErrorResponse(404, "Beneficiary not found");
    }

    // Check if already enrolled
    if (beneficiary.enrolledSchemes.includes(schemeId as any)) {
      throw new ErrorResponse(
        400,
        "Beneficiary is already enrolled in this scheme"
      );
    }

    // Check scheme eligibility (example)
    if (
      scheme.ageRequirement &&
      (beneficiary.age < scheme.ageRequirement.min ||
        beneficiary.age > scheme.ageRequirement.max)
    ) {
      throw new ErrorResponse(
        400,
        "Beneficiary does not meet the age requirements for this scheme"
      );
    }

    // Enroll beneficiary
    beneficiary.enrolledSchemes.push(schemeId as any);
    await beneficiary.save();

    // Also update scheme's enrolledBeneficiaries if that's part of your schema
    if (scheme.enrolledBeneficiaries) {
      scheme.enrolledBeneficiaries.push(beneficiaryId as any);
      await scheme.save();
    }

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          beneficiary,
          "Beneficiary successfully enrolled in scheme"
        )
      );
  }
);

// Mark beneficiary as benefited from scheme
const markBeneficiaryAsBenefited = asyncHandler(
  async (req: Request, res: Response) => {
    const { schemeId } = req.params;
    const { beneficiaryId } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(schemeId) ||
      !mongoose.Types.ObjectId.isValid(beneficiaryId)
    ) {
      throw new ErrorResponse(400, "Invalid ID format");
    }

    // Find the beneficiary
    const beneficiary = await Beneficiary.findById(beneficiaryId);

    if (!beneficiary) {
      throw new ErrorResponse(404, "Beneficiary not found");
    }

    // Check if already marked as benefited
    if (beneficiary.benefitedSchemes.includes(schemeId as any)) {
      throw new ErrorResponse(
        400,
        "Beneficiary is already marked as benefited from this scheme"
      );
    }

    // Check if enrolled in the scheme
    if (!beneficiary.enrolledSchemes.includes(schemeId as any)) {
      throw new ErrorResponse(
        400,
        "Beneficiary is not enrolled in this scheme"
      );
    }

    // Mark as benefited
    beneficiary.benefitedSchemes.push(schemeId as any);
    await beneficiary.save();

    // Update scheme's benefitedBeneficiaries if that's part of your schema
    const Scheme = mongoose.model("Scheme");
    const scheme = await Scheme.findById(schemeId);

    if (scheme && scheme.benefitedBeneficiaries) {
      scheme.benefitedBeneficiaries.push(beneficiaryId as any);
      await scheme.save();
    }

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          beneficiary,
          "Beneficiary successfully marked as benefited from scheme"
        )
      );
  }
);

// Get beneficiaries by scheme
const getBeneficiariesByScheme = asyncHandler(
  async (req: Request, res: Response) => {
    const { schemeId } = req.params;
    const { status = "enrolled" } = req.query; // 'enrolled' or 'benefited'

    // Validate scheme ID
    if (!mongoose.Types.ObjectId.isValid(schemeId)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    // Check if scheme exists
    const Scheme = mongoose.model("Scheme");
    const schemeExists = await Scheme.exists({ _id: schemeId });

    if (!schemeExists) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Build query based on status
    const query =
      status === "benefited"
        ? { benefitedSchemes: schemeId }
        : { enrolledSchemes: schemeId };

    // Find beneficiaries
    const beneficiaries = await Beneficiary.find(query);

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          beneficiaries,
          `Beneficiaries ${status} in scheme fetched successfully`
        )
      );
  }
);

export {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiaryById,
  updateBeneficiary,
  deleteBeneficiary,
  enrollBeneficiaryInScheme,
  markBeneficiaryAsBenefited,
  getBeneficiariesByScheme,
};
