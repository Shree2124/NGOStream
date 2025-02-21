  import { Schema, model } from "mongoose";
  import { IBeneficiary } from "../types/beneficiary.types";

  const beneficiarySchema = new Schema<IBeneficiary>(
    {
      name: { 
        type: String, 
        required: true, 
        trim: true 
      },
      age: { 
        type: Number, 
        required: true
      },
      gender: {
        type: String, 
        enum: ["Male", "Female", "Other"], 
        required: true 
        },
      address: { 
        type: String, 
        required: true, 
        trim: true 
      },
      phoneNumber: { 
        type: String, 
        required: true 
      },
      email: { 
        type: String,
        required: true 
        },
      enrolledSchemes: [
        { 
        type: Schema.Types.ObjectId, 
        ref: "Scheme" }
      ],
      benefitedSchemes: [
        { 
          type: Schema.Types.ObjectId, 
          ref: "Scheme" }
        ],
    },
    { timestamps: true }
  );

  const Beneficiary = model<IBeneficiary>("Beneficiary", beneficiarySchema);

  export default Beneficiary;
