import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import Scheme from "../models/scheme.model";
import Beneficiary from "../models/beneficiary.model";
import mongoose from "mongoose";
import { IDocument } from "../types/scheme.types";

// Create a new scheme
const createScheme = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    startDate,
    endDate,
    budget,
    benefits,
    eligibilityCriteria,
    ageRequirement,
    documents,
    category,
    targetLocation,
    contactDetails,
    targetBeneficiaryCount,
  } = req.body;

  // Basic validation
  if (
    !name ||
    !description ||
    !startDate ||
    !endDate ||
    !budget ||
    !benefits ||
    !eligibilityCriteria ||
    !category
  ) {
    throw new ErrorResponse(400, "Please provide all required fields");
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ErrorResponse(400, "Invalid date format");
  }

  if (end <= start) {
    throw new ErrorResponse(400, "End date must be after start date");
  }

  // Check for duplicate scheme
  const existingScheme = await Scheme.findOne({ name });
  if (existingScheme) {
    throw new ErrorResponse(400, "A scheme with this name already exists");
  }

  // Create new scheme
  const newScheme = await Scheme.create({
    name,
    description,
    startDate,
    endDate,
    budget,
    benefits: Array.isArray(benefits) ? benefits : [benefits],
    eligibilityCriteria,
    ageRequirement: ageRequirement || { min: 0, max: 120 },
    documents: documents || [],
    category,
    targetLocation,
    contactDetails,
    targetBeneficiaryCount,
    createdBy: req.user, 
  });

  res
    .status(201)
    .json(new SuccessResponse(201, newScheme, "Scheme created successfully"));
});

// Get all schemes with filters
const getAllSchemes = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    active = false,
  } = req.query;

  // Build filter query
  const filterQuery: any = {};

  if (status) {
    filterQuery.status = status;
  }

  // Special filter for active schemes only
  if (active === "true") {
    const currentDate = new Date();
    filterQuery.startDate = { $lte: currentDate };
    filterQuery.endDate = { $gte: currentDate };
  }

  if (category) {
    filterQuery.category = category;
  }

  if (search) {
    filterQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { eligibilityCriteria: { $regex: search, $options: "i" } },
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
  const total = await Scheme.countDocuments(filterQuery);
  const schemes = await Scheme.find(filterQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .populate("createdBy", "name email");

  // Return with pagination metadata
  res.status(200).json(
    new SuccessResponse(
      200,
      {
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      "Schemes fetched successfully"
    )
  );
});

// Get scheme by ID
const getSchemeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid scheme ID format");
  }

  // Find scheme with populated data
  const scheme = await Scheme.findById(id)
    .populate("createdBy", "name email")
    .populate({
      path: "enrolledBeneficiaries",
      select: "name phoneNumber email age gender",
      options: { limit: 10 },
    })
    .populate({
      path: "benefitedBeneficiaries",
      select: "name phoneNumber email age gender",
      options: { limit: 10 },
    });

  if (!scheme) {
    throw new ErrorResponse(404, "Scheme not found");
  }

  // Get counts
  const enrolledCount = scheme.enrolledBeneficiaries?.length || 0;
  const benefitedCount = scheme.benefitedBeneficiaries?.length || 0;

  res.status(200).json(
    new SuccessResponse(
      200,
      {
        ...scheme.toObject(),
        stats: {
          enrolledCount,
          benefitedCount,
          utilizationRate:
            enrolledCount > 0 ? (benefitedCount / enrolledCount) * 100 : 0,
        },
      },
      "Scheme fetched successfully"
    )
  );
});

// Update scheme
const updateScheme = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    startDate,
    endDate,
    budget,
    status,
    benefits,
    eligibilityCriteria,
    ageRequirement,
    documents,
    category,
    targetLocation,
    contactDetails,
    targetBeneficiaryCount,
  } = req.body;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid scheme ID format");
  }

  // Find scheme
  const scheme = await Scheme.findById(id);
  if (!scheme) {
    throw new ErrorResponse(404, "Scheme not found");
  }

  // Check for name uniqueness if being updated
  if (name && name !== scheme.name) {
    const existingScheme = await Scheme.findOne({ name });
    if (existingScheme) {
      throw new ErrorResponse(400, "A scheme with this name already exists");
    }
  }

  // Validate dates if being updated
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ErrorResponse(400, "Invalid date format");
    }

    if (end <= start) {
      throw new ErrorResponse(400, "End date must be after start date");
    }
  } else if (startDate && !endDate) {
    const start = new Date(startDate);
    const end = scheme.endDate;

    if (isNaN(start.getTime())) {
      throw new ErrorResponse(400, "Invalid start date format");
    }

    if (end <= start) {
      throw new ErrorResponse(400, "End date must be after start date");
    }
  } else if (!startDate && endDate) {
    const start = scheme.startDate;
    const end = new Date(endDate);

    if (isNaN(end.getTime())) {
      throw new ErrorResponse(400, "Invalid end date format");
    }

    if (end <= start) {
      throw new ErrorResponse(400, "End date must be after start date");
    }
  }

  // Update scheme
  const updatedScheme = await Scheme.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(description && { description }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(budget !== undefined && { budget }),
      ...(status && { status }),
      ...(benefits && {
        benefits: Array.isArray(benefits) ? benefits : [benefits],
      }),
      ...(eligibilityCriteria && { eligibilityCriteria }),
      ...(ageRequirement && { ageRequirement }),
      ...(documents && { documents }),
      ...(category && { category }),
      ...(targetLocation && { targetLocation }),
      ...(contactDetails && { contactDetails }),
      ...(targetBeneficiaryCount && { targetBeneficiaryCount }),
    },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json(
      new SuccessResponse(200, updatedScheme, "Scheme updated successfully")
    );
});

// Delete scheme
const deleteScheme = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid scheme ID format");
  }

  // Find and delete scheme
  const scheme = await Scheme.findByIdAndDelete(id);

  if (!scheme) {
    throw new ErrorResponse(404, "Scheme not found");
  }

  // Remove scheme from all beneficiaries
  await Beneficiary.updateMany(
    {
      $or: [{ enrolledSchemes: id }, { benefitedSchemes: id }],
    },
    {
      $pull: {
        enrolledSchemes: id,
        benefitedSchemes: id,
      },
    }
  );

  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        { id: scheme._id },
        "Scheme deleted successfully"
      )
    );
});

// Get scheme statistics
const getSchemeStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    // Find scheme
    const scheme = await Scheme.findById(id);

    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Get counts from database for accuracy
    const enrolledCount = await Beneficiary.countDocuments({
      enrolledSchemes: id,
    });
    const benefitedCount = await Beneficiary.countDocuments({
      benefitedSchemes: id,
    });

    // Calculate gender distribution
    const genderDistribution = await Beneficiary.aggregate([
      { $match: { enrolledSchemes: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    // Calculate age distribution
    const ageDistribution = await Beneficiary.aggregate([
      { $match: { enrolledSchemes: new mongoose.Types.ObjectId(id) } },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 45, 60, 120],
          default: "Unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Format age ranges
    const formattedAgeDistribution = ageDistribution.map((item) => {
      if (item._id === "Unknown") {
        return { range: "Unknown", count: item.count };
      }

      const index = ageDistribution.indexOf(item);
      const boundaries = [0, 18, 30, 45, 60, 120];

      return {
        range: `${boundaries[index]}-${boundaries[index + 1] - 1}`,
        count: item.count,
      };
    });

    // Calculate enrollment rate if there's a target count
    const targetCount = scheme.targetBeneficiaryCount || 1000; // Default value if not set
    const enrollmentRate = (enrolledCount / targetCount) * 100;

    res.status(200).json(
      new SuccessResponse(
        200,
        {
          schemeId: id,
          name: scheme.name,
          enrolledCount,
          benefitedCount,
          utilizationRate:
            enrolledCount > 0 ? (benefitedCount / enrolledCount) * 100 : 0,
          enrollmentRate,
          genderDistribution: genderDistribution.map((item) => ({
            gender: item._id,
            count: item.count,
            percentage: (item.count / enrolledCount) * 100,
          })),
          ageDistribution: formattedAgeDistribution,
        },
        "Scheme statistics fetched successfully"
      )
    );
  }
);

// Add document requirement to scheme
const addDocumentRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, isRequired = true } = req.body;

    // Validate inputs
    if (!name) {
      throw new ErrorResponse(400, "Document name is required");
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    // Find scheme
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Check if document with same name already exists
    const documentExists = scheme.documents.some((doc) => doc.name === name);
    if (documentExists) {
      throw new ErrorResponse(
        400,
        "Document requirement with this name already exists"
      );
    }

    // Add document requirement
    const newDocument: IDocument = { name, isRequired };
    scheme.documents = [...scheme.documents, newDocument];
    await scheme.save();

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          scheme,
          "Document requirement added successfully"
        )
      );
  }
);

// Remove document requirement from scheme
const removeDocumentRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, documentName } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    // Find scheme
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Find document index
    const documentIndex = scheme.documents.findIndex(
      (doc) => doc.name === documentName
    );
    if (documentIndex === -1) {
      throw new ErrorResponse(404, "Document requirement not found");
    }

    // Remove document
    scheme.documents = scheme.documents.filter(
      (doc) => doc.name !== documentName
    );
    await scheme.save();

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          scheme,
          "Document requirement removed successfully"
        )
      );
  }
);

// Update document requirement
const updateDocumentRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, documentName } = req.params;
    const { name, isRequired } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorResponse(400, "Invalid scheme ID format");
    }

    // Find scheme
    const scheme = await Scheme.findById(id);
    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Find document index
    const documentIndex = scheme.documents.findIndex(
      (doc) => doc.name === documentName
    );
    if (documentIndex === -1) {
      throw new ErrorResponse(404, "Document requirement not found");
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== documentName) {
      const nameExists = scheme.documents.some((doc) => doc.name === name);
      if (nameExists) {
        throw new ErrorResponse(
          400,
          "Document requirement with this name already exists"
        );
      }
    }

    // Update document
    scheme.documents[documentIndex] = {
      name: name || documentName,
      isRequired: isRequired ?? scheme.documents[documentIndex].isRequired,
    };
    await scheme.save();

    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          scheme,
          "Document requirement updated successfully"
        )
      );
  }
);

// Suspend a scheme
const suspendScheme = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid scheme ID format");
  }

  // Require reason for suspension
  if (!reason) {
    throw new ErrorResponse(400, "Reason for suspension is required");
  }

  // Find scheme
  const scheme = await Scheme.findById(id);
  if (!scheme) {
    throw new ErrorResponse(404, "Scheme not found");
  }

  // Check if already suspended
  if (scheme.status === "Suspended") {
    throw new ErrorResponse(400, "Scheme is already suspended");
  }

  // Update scheme status
  scheme.status = "Suspended";
  scheme.suspensionReason = reason;

  await scheme.save();

  res
    .status(200)
    .json(new SuccessResponse(200, scheme, "Scheme suspended successfully"));
});

// Reactivate a suspended scheme
const reactivateScheme = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(400, "Invalid scheme ID format");
  }

  // Find scheme
  const scheme = await Scheme.findById(id);
  if (!scheme) {
    throw new ErrorResponse(404, "Scheme not found");
  }

  // Check if suspended
  if (scheme.status !== "Suspended") {
    throw new ErrorResponse(400, "Only suspended schemes can be reactivated");
  }

  // Determine appropriate status based on dates
  const currentDate = new Date();
  let newStatus = "Upcoming";

  if (currentDate >= scheme.startDate && currentDate <= scheme.endDate) {
    newStatus = "Active";
  } else if (currentDate > scheme.endDate) {
    newStatus = "Completed";
  }

  // Update scheme status
  scheme.status = newStatus;
  scheme.suspensionReason = undefined;
  scheme.reactivatedAt = new Date();

  await scheme.save();

  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        scheme,
        `Scheme reactivated successfully with status: ${newStatus}`
      )
    );
});

// Get all active schemes (simplified endpoint)
const getActiveSchemes = asyncHandler(async (req: Request, res: Response) => {
  const currentDate = new Date();

  const activeSchemes = await Scheme.find({
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
    status: { $ne: "Suspended" },
  }).sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        activeSchemes,
        "Active schemes fetched successfully"
      )
    );
});

// Get beneficiary enrollment status for a scheme
const getBeneficiaryEnrollmentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { schemeId, beneficiaryId } = req.params;

    // Validate ID formats
    if (
      !mongoose.Types.ObjectId.isValid(schemeId) ||
      !mongoose.Types.ObjectId.isValid(beneficiaryId)
    ) {
      throw new ErrorResponse(400, "Invalid ID format");
    }

    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      throw new ErrorResponse(404, "Scheme not found");
    }

    // Check if beneficiary exists
    const beneficiary = await Beneficiary.findById(beneficiaryId);
    if (!beneficiary) {
      throw new ErrorResponse(404, "Beneficiary not found");
    }

    // Determine enrollment status
    const isEnrolled = beneficiary.enrolledSchemes.includes(schemeId as any);
    const hasBenefited = beneficiary.benefitedSchemes.includes(schemeId as any);

    res.status(200).json(
      new SuccessResponse(
        200,
        {
          schemeId,
          beneficiaryId,
          schemeName: scheme.name,
          beneficiaryName: beneficiary.name,
          isEnrolled,
          hasBenefited,
          status: hasBenefited
            ? "Benefited"
            : isEnrolled
            ? "Enrolled"
            : "Not Enrolled",
        },
        "Enrollment status fetched successfully"
      )
    );
  }
);

export {
  createScheme,
  getAllSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
  getSchemeStatistics,
  addDocumentRequirement,
  removeDocumentRequirement,
  updateDocumentRequirement,
  suspendScheme,
  reactivateScheme,
  getActiveSchemes,
  getBeneficiaryEnrollmentStatus,
};
