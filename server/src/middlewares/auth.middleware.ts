import { ErrorResponse } from "../utils/errorResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJWTPayload extends JwtPayload {
  username: string;
}
export const verifyJWT = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    // console.log(req.header("Authorization"));

    if (!token) {
      throw new ErrorResponse(401, "User should be logged in first!");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as CustomJWTPayload;

      // console.log(decodedToken);
      if (
        !decodedToken ||
        decodedToken.username !== process.env.PRIVATE_ADMIN_USERNAME
      ) {
        throw new ErrorResponse(403, "Invalid or expired token!");
      }

      req.user = {
        username: decodedToken.username,
      };

      next();
    } catch (error) {
      throw new ErrorResponse(403, "Token verification failed!");
    }
  }
);
