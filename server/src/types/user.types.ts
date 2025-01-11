import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  // username: string;
  avatar?: string;
  gender: string;
  age: number;
  bio?: string;
  fullName: string;
  email: string;
  address: string;
  phone: number;
  role: string;
  // password: any;
  // status: string;
  // refreshToken: any;
}