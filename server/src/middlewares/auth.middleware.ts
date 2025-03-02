import { ErrorResponse } from "../utils/errorResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import adminModel from "../models/admin.model";

interface CustomJWTPayload extends JwtPayload {
  username: string;
}
export const verifyJWT = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      // console.log(token);
      if (!token) {
        throw new ErrorResponse(401, " Unauthorized request");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as CustomJWTPayload;

      console.log("decoded : ", decodedToken);

      const user = await adminModel.findOne({ email: decodedToken.username });
      console.log("user: ", user);

      if (!user) {
        throw new ErrorResponse(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error) {
      throw new ErrorResponse(403, "Token verification failed!");
    }
  }
);
