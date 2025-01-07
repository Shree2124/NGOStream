import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  gender: string;
  age: string;
  bio: string;
  fullName: string;
  email: string;
  password: any;
  role: string;
  status: string;
  refreshToken: any;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isPasswordCorrect(password: any): Promise<boolean>;
}