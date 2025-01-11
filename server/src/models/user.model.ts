import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { accessTokenExpiry, accessTokenSecret, refreshTokenExpiry, refreshTokenSecret } from "../config/envConfig";
import { IUser } from "../types/user.types";

const userSchema = new mongoose.Schema<IUser>(
  {
    // username: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   unique: true,
    //   index: true,
    // },
    fullName: {
      trim: true,
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"]
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true,
    },
    avatar: {
      type: String,
    },
    // password: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   default:null
    // },
    role: {
      type: String,
      enum: ["Volunteer", "Staff"],
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"]
    // },
    // refreshToken: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   /* Encrypting the password using hash method */
//   this.password = await bcrypt.hash(this.password, 10);

//   next();
// });

// userSchema.methods.isPasswordCorrect = async function (
//   password: any
// ): Promise<boolean> {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.generateAccessToken = function (): string {
//   return jwt.sign(
//     {
//       _id: this._id,
//       userName: this.userName,
//       email: this.email,
//     },
//     accessTokenSecret as string,
//     {
//       expiresIn: accessTokenExpiry,
//     }
//   );
// };

// userSchema.methods.generateRefreshToken = function (): string {
//   return jwt.sign(
//     {
//       id: this._id,
//     },
//     refreshTokenSecret as string,
//     {
//       expiresIn: refreshTokenExpiry,
//     }
//   );
// };

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);