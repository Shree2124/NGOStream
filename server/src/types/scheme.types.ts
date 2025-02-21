import { Document, Types } from "mongoose";
import { stringAt } from "pdfkit/js/data";

// Define the status as a union type
export type SchemeStatus = "Active" | "Completed" | "Upcoming" | "Suspended";

// Define the category as a union type
export type SchemeCategory =
  | "Education"
  | "Healthcare"
  | "Food Security"
  | "Housing"
  | "Employment"
  | "Social Welfare"
  | "Other";

export interface IDocument {
  name: string;
  isRequired: boolean;
}

export interface IAgeRequirement {
  min: number;
  max: number;
}

export interface IContactDetails {
  name?: string;
  email?: string;
  phone?: string;
}

export interface IScheme extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: SchemeStatus | string; // Use the union type instead of string
  suspensionReason?: string;
  reactivatedAt?: Date;
  benefits: string[];
  eligibilityCriteria: string;
  ageRequirement: IAgeRequirement;
  documents: IDocument[];
  enrolledBeneficiaries: Types.ObjectId[];
  benefitedBeneficiaries: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  category: SchemeCategory; // Use the union type instead of repeating the values
  targetLocation?: string;
  contactDetails?: IContactDetails;
  targetBeneficiaryCount?: number;
}

export interface ICreateSchemeRequest {
  name: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  budget: number;
  benefits: string[];
  eligibilityCriteria: string;
  ageRequirement?: IAgeRequirement;
  documents?: IDocument[];
  category: SchemeCategory; // Use the union type
  targetLocation?: string;
  contactDetails?: IContactDetails;
  targetBeneficiaryCount?: number;
}

export interface IUpdateSchemeRequest {
  name?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  budget?: number;
  status?: SchemeStatus; // Use the union type
  suspensionReason?: string;
  reactivatedAt?: Date;
  benefits?: string[];
  eligibilityCriteria?: string;
  ageRequirement?: IAgeRequirement;
  documents?: IDocument[];
  category?: SchemeCategory; // Use the union type
  targetLocation?: string;
  contactDetails?: IContactDetails;
  targetBeneficiaryCount?: number;
}
