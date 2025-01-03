import { accessTokenSecret } from "../config/envConfig";
import { User } from "../Models/user.model";
import { ErrorResponse } from "../Utils/errorResponse";
import { asyncHandler } from "../Utils/asyncHandler";
import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface customJWTPayload extends JwtPayload {
  _id: any;
}
export const verifyJWT = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ErrorResponse(401, "user should be logged in first!");
    }

    const decodedToken = jwt.verify(
      token,
      accessTokenSecret!
    ) as customJWTPayload;

    if (!decodedToken) {
      throw new ErrorResponse(400, "token does not match!");
    }

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ErrorResponse(401, "Invalid Access Token!");
    }
    req.user = user;
    next();
  }
);