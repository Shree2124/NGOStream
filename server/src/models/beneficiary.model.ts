import { Schema, model, Document, Types } from "mongoose";

interface IBeneficiary extends Document {
  name: string;
  age: number;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  enrolledSchemes: Types.ObjectId[];
  benefitedSchemes: Types.ObjectId[];
}

const beneficiarySchema = new Schema<IBeneficiary>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  enrolledSchemes: [{ type: Schema.Types.ObjectId, ref: "Scheme" }],
  benefitedSchemes: [{ type: Schema.Types.ObjectId, ref: "Scheme" }],
});

const Beneficiary = model<IBeneficiary>("Beneficiary", beneficiarySchema);

export default Beneficiary;
