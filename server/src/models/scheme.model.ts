import { Schema, model } from "mongoose";
import { IScheme } from "../types/scheme.types";

const schemeSchema = new Schema<IScheme>(
  {
    name: {
      type: String,
      required: [true, "Scheme name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Scheme description is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Scheme start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Scheme end date is required"],
    },
    budget: {
      type: Number,
      required: [true, "Scheme budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Upcoming", "Suspended"],
      default: "Upcoming",
    },
    benefits: [
      {
        type: String,
        required: true,
      },
    ],
    eligibilityCriteria: {
      type: String,
      required: [true, "Eligibility criteria is required"],
    },
    ageRequirement: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 120,
      },
    },
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    enrolledBeneficiaries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Beneficiary",
      },
    ],
    benefitedBeneficiaries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Beneficiary",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      enum: [
        "Education",
        "Healthcare",
        "Food Security",
        "Housing",
        "Employment",
        "Social Welfare",
        "Other",
      ],
      required: [true, "Scheme category is required"],
    },
    targetLocation: {
      type: String,
      trim: true,
    },
    contactDetails: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Middleware to ensure endDate is after startDate
schemeSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    const err = new Error("End date must be after start date");
    return next(err);
  }
  next();
});

// Auto-update status based on dates
schemeSchema.pre("save", function (next) {
  const currentDate = new Date();

  if (currentDate < this.startDate) {
    this.status = "Upcoming";
  } else if (currentDate >= this.startDate && currentDate <= this.endDate) {
    this.status = "Active";
  } else if (currentDate > this.endDate) {
    this.status = "Completed";
  }

  next();
});

const Scheme = model<IScheme>("Scheme", schemeSchema);
export default Scheme;
