import { accessTokenExpiry, accessTokenSecret } from "../config/envConfig";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Member } from "../models/member.model";
import uploadOnCloudinary from "../utils/cloudinary";
import adminModel from "../models/admin.model";
import bcrypt from "bcrypt";
import { sendMemberEnrollmentEmail } from "../utils/sendMail";

const options: any = {
  httpOnly: false,
  secure: false,
  sameSite: "Strict",
  path: "/",
};

{
  /* Function to generate access and refresh token  */
}

// Function to generate an access token
const generateAccess = (username: string) => {
  try {
    if (!username) {
      throw new ErrorResponse(401, "Username is required.");
    }

    const accessToken = jwt.sign({ username }, accessTokenSecret as string, {
      expiresIn: accessTokenExpiry,
    });

    return accessToken;
  } catch (error) {
    throw new ErrorResponse(500, "Error generating access token.");
  }
};

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Validate input
  if ([username, password].some((value) => value?.trim() === "")) {
    throw new ErrorResponse(400, "All fields are required.");
  }
  // Check if credentials match environment variables first
  if (
    username === process.env.PRIVATE_ADMIN_USERNAME &&
    password === process.env.PRIVATE_ADMIN_PASSWORD
  ) {
    // Generate access token for super admin
    const accessToken = generateAccess(process.env.PRIVATE_ADMIN_USERNAME!);
    console.log(accessToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new SuccessResponse(
          200,
          {
            accessToken,
            FetchedUser: {
              username: process.env.PRIVATE_ADMIN_USERNAME,
            },
          },
          "Super admin logged in successfully!"
        )
      );
  }
  // If not super admin, check the database
  const admin = await adminModel.findOne({ email: username });
  // Check if admin exists in database
  if (!admin) {
    throw new ErrorResponse(401, "Invalid credentials provided.");
  }
  // Use the custom method from your schema instead of direct bcrypt.compare
  console.log("admin: ", admin);

  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (isPasswordValid) {
    throw new ErrorResponse(401, "Invalid credentials provided.");
  }
  // Generate access token with admin's information
  const accessToken = generateAccess(admin.email);
  console.log(accessToken);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new SuccessResponse(
        200,
        {
          accessToken,
          FetchedUser: {
            username: admin.email,
          },
        },
        "Admin logged in successfully!"
      )
    );
});
{
  /* Function to logout the user by checking if the person is authenticated or not */
}
const logoutUser = asyncHandler(async (req: any, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ErrorResponse(400, "user should be logged in first!");
  }

  res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new SuccessResponse(200, {}, "user logout successfully"));
});

{
  /* Function to fetch the current authenticated user  */
}
const getUser = asyncHandler(async (req: any, res: Response) => {
  const user = req.user;

  return res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        { FetchedUser: user },
        "user fetched successfully!"
      )
    );
});

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { gender, age, bio, fullName, email, address, phone, role } = req.body;

  console.log(req.body);
  console.log(req.file);

  if (!fullName || !email || !address || !phone || !role || !gender || !age) {
    throw new ErrorResponse(400, "Please fill in all required fields.");
  }

  const existingUser = await Member.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse(400, "User with this email already exists.");
  }

  const newUser = await Member.create({
    gender,
    age,
    bio,
    fullName,
    email,
    address,
    phone,
    role,
  });

  if (newUser) {
    let avatarLocalPath: string | null = "";
    let uploadedAvatar: any;

    if (req.file) {
      avatarLocalPath = req.file.path;
      uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
      newUser.avatar = uploadedAvatar?.url;
    }
    const createdUser = await newUser.save();

    try {
      await sendMemberEnrollmentEmail(createdUser);
    } catch (emailError) {
      console.error("Failed to send enrollment email:", emailError);
      // Continue with the response even if email fails
    }
    res
      .status(201)
      .json(new SuccessResponse(201, createdUser, "User created successfully"));
  } else {
    throw new ErrorResponse(500, "Failed to create user.");
  }
});

const getUsers = asyncHandler(async (req: any, res: Response) => {
  const users = await Member.find();

  if (!users) throw new ErrorResponse(404, "Users not found");

  return res
    .status(200)
    .json(new SuccessResponse(200, users, "Users fetched successfully"));
});

const editUser = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;
  const { fullName, gender, role, age, email, address, phone, bio } = req.body;

  const user = await Member.findById(userId);
  if (!user) throw new ErrorResponse(404, "User not found");

  if (fullName) user.fullName = fullName;
  if (gender) user.gender = gender;
  if (role) user.role = role;
  if (age) user.age = age;
  if (email) user.email = email;
  if (address) user.address = address;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;

  console.log(req.file);

  if (req.file) {
    const avatarLocalPath = req.file.path;
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    user.avatar = uploadedAvatar?.url;
  }

  const updatedUser = await user.save();

  res
    .status(200)
    .json(new SuccessResponse(200, updatedUser, "User updated successfully"));
});

const deleteUser = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;

  if (!userId) throw new ErrorResponse(400, "User id is required");

  const user = await Member.findOneAndDelete({ _id: userId });

  console.log(user);

  res
    .status(200)
    .json(new SuccessResponse(200, null, "user deleted successfully"));
});

// {/* Function to fetch the current logged in user */}
// const getSystemUsers = asyncHandler(async (req: any, res: Response) => {
//   const userId = req?.user?.id;

//   if (!mongoose.isValidObjectId(userId)) {
//     return res
//       .status(400)
//       .json(new SuccessResponse(400, null, "Invalid user ID"));
//   }

//   const users = await User.find({ _id: { $ne: userId } }).select(
//     "-password -refreshToken -OauthId -fullName -createdAt -updatedAt -__v"
//   );

//   return res
//     .status(200)
//     .json(new SuccessResponse(201, users, "Users fetched successfully"));
// });

// {/* Function to refresh the access token */}
// const refreshAccessToken = asyncHandler(async (req: any, res: Response) => {
//   const incomingRefreshToken: any =
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ErrorResponse(401, "unauthorized request");
//   }

//   const decodedToken: any = jwt.verify(
//     incomingRefreshToken,
//     process.env.REFRESH_TOKEN_SECRET as string
//   );

//   console.log(decodedToken);

//   const user = await User.findById(decodedToken?.id);

//   if (!user) {
//     throw new ErrorResponse(404, "Invalid refresh token");
//   }

//   if (incomingRefreshToken !== user?.refreshToken) {
//     throw new ErrorResponse(401, "Refresh token is expired or used");
//   }

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   const { accessToken, refreshToken: newRefreshToken } =
//     await generateAccessAndRefreshToken(user._id);

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", newRefreshToken, options)
//     .json(
//       new SuccessResponse(
//         200,
//         { accessToken, refreshToken: newRefreshToken },
//         "Access token refreshed"
//       )
//     );
// });

// {/* Function to update the current password of the user */}
// const updatePassword = asyncHandler(async (req: any, res: Response) => {
//   const { oldPassword, newPassword } = req.body;

//   const user: any = await User.findById(req?.user._id);
//   const isPasswordCorrect: Boolean = await user.isPasswordCorrect(oldPassword);

//   if (!isPasswordCorrect) {
//     throw new ErrorResponse(400, "Invalid Password");
//   }

//   await user.save({ validateBeforeSave: false });

//   return res
//     .status(200)
//     .json(new SuccessResponse(201, {}, "Password Updated successfully"));
// });

// {/* Function to send an Email to the user reuqesting password reset */}
// const sendEmail = asyncHandler(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   if (!email) {
//     throw new ErrorResponse(402, "Email Required");
//   }

//   const user = await User.find({ email });

//   if (!user) {
//     throw new ErrorResponse(404, "User with given email doesn't exist");
//   }

//   const token = jwt.sign({ _id: user[0]._id }, jwtSecret as string, {
//     expiresIn: "1h",
//   });

//   const transporter = nodemailer.createTransport({
//     host: smtpHost as string,
//     port: Number(smtpPort),
//     auth: {
//       user: smtpUser as string,
//       pass: smtpPass as string,
//     },
//   });

//   const mailOptions = {
//     from: "project9960@gmail.com",
//     to: email,
//     subject: "Password Reset Link",
//     html: `<h4>You requested for password reset</h4>
//                     <p>Click <a href="http://localhost:5173/reset-password/${token}">here</a> to reset your password</p>`,
//   };

//   await transporter.sendMail(mailOptions);

//   return res
//     .status(200)
//     .json(new SuccessResponse(201, { token }, "Email sended successfully"));
// });

// {/* Function to reset the password */}
// const resetPassword = asyncHandler(async (req: Request, res: Response) => {
//   const { token, newPassword } = req.body;

//   console.log(token);
//   const decoded: any = jwt.verify(token, jwtSecret as string);
//   const user = await User.findById(decoded?._id);

//   if (!user) {
//     throw new ErrorResponse(401, "User not found");
//   }

//   user.password = newPassword;

//   await user.save({ validateBeforeSave: false });

//   res
//     .status(200)
//     .json(new SuccessResponse(201, {}, "Password reset Successfully"));
// });

// {/* Function to upload the avatar on cloudinary */}
// const uploadAvatar = asyncHandler(async (req: Request | any, res: Response) => {
//   let avatarLocalPath: string | undefined;
//   const user: IUser | any = req?.user;

//   console.log(req?.file);

//   if (req?.file) {
//     avatarLocalPath = req?.file?.path;
//     console.log(avatarLocalPath);
//   }

//   if (!avatarLocalPath) {
//     throw new ErrorResponse(400, "Avatar file is required");
//   }

//   // Upload avatar to Cloudinary
//   const avatarImg = await uploadOnCloudinary(avatarLocalPath);
//   if (!avatarImg) {
//     throw new ErrorResponse(500, "Something went wrong while uploading avatar");
//   }

//   // Update user with the new avatar URL
//   const updatedUser = await User.findByIdAndUpdate(
//     user._id,
//     { avatar: avatarImg?.secure_url },
//     { new: true } // Return the updated document
//   ).select("-password -refreshToken");

//   if (!updatedUser) {
//     throw new ErrorResponse(404, "User not found");
//   }

//   // Respond to the client with the updated user data
//   return res
//     .status(201)
//     .json(new SuccessResponse(200, updatedUser, "Avatar updated successfully"));
// });

// {/* Function to update the accoount details of the user */}
// const updateAccountDetails = asyncHandler(async (req: any, res: Response) => {
//   const { userName, fullName } = req.body;
//   let avatarLocalPath: string | undefined;
//   const user: IUser | any = req?.user;

//   console.log(req?.file);

//   if (req?.file) {
//     avatarLocalPath = req?.file?.path;
//     console.log(avatarLocalPath);
//   }

//   if (!avatarLocalPath) {
//     throw new ErrorResponse(400, "Avatar file is required");
//   }

//   // Upload avatar to Cloudinary
//   const avatarImg = await uploadOnCloudinary(avatarLocalPath);
//   if (!avatarImg) {
//     throw new ErrorResponse(500, "Something went wrong while uploading avatar");
//   }

//   // Update user with the new avatar URL
//   // const updatedUser = await User.findByIdAndUpdate(
//   //   user._id,
//   //   { avatar: avatarImg?.secure_url },
//   //   { new: true } // Return the updated document
//   // ).select("-password -refreshToken");

//   // if (!updatedUser) {
//   //   throw new ErrorResponse(404, "User not found");
//   // }

//   const updatedUser = await User.findByIdAndUpdate(
//     user?._id,
//     {
//       $set: {
//         userName: userName ? userName : req.user.userName,
//         fullName: fullName ? fullName : req.user.fullName,
//         avatar: avatarImg?.secure_url,
//       },
//     },
//     { new: true }
//   ).select("-password -refreshToken");

//   return res
//     .status(200)
//     .json(
//       new SuccessResponse(
//         200,
//         { updatedUser: updatedUser },
//         "Account details updated successfully"
//       )
//     );
// });

// {/* Function to set the access token of Oauth user into cookies */}
// const setOauthCookies = asyncHandler(async (req: any, res: Response) => {
//   // console.log("auth: ", req.auth);
//   res
//     .cookie("accessToken", req.auth, options)
//     .redirect("http://localhost:3000/auth/setaccesstoken");
// });

// {/* Function to pass the access token in response */}
// const setAccessToken = asyncHandler(async (req: any, res: Response) => {
//   let token = req.cookies.accessToken;

//   // console.log("Token: ", token);

//   res
//     .status(201)
//     .json(new SuccessResponse(201, token, "AccessToken fetched successfully!"));
// });

export {
  loginUser,
  logoutUser,
  getUser,
  createUser,
  getUsers,
  editUser,
  deleteUser,
};
