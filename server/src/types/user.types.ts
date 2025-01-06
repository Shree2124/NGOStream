import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  fullName: string;
  OauthId:string,
  email: string;
  password: any;
  role: string;
  avatar: string;
  refreshToken: any;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isPasswordCorrect(password: any): Promise<boolean>;
}