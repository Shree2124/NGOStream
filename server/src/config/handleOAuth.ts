// import { generateFromEmail } from "unique-username-generator";
// import { generateAccessAndRefreshToken } from "../controllers/user.controller";
// import { User } from "../models/user.model";
// import { ErrorResponse } from "../utils/errorResponse";


// export const handleOAuth = async ( req: any, profile: any, callback: (err:any, user?:any,)=>void, action:any) => {
//     try {
//       console.log("Profile: ", profile);   
//       const id = profile?.id;

//       {/* First check if the user exists in the system or not */}
//       const userExists = await User.findOne({ OauthId: id });

//       if (userExists) {
//         console.log("Oauth user exists: ", userExists);
//         const { accessToken } = await generateAccessAndRefreshToken(userExists?._id);
//         req.auth = accessToken;
//         return callback(null,accessToken);
//       }


//       {/* Check if person with similar userName exists, if yes then modify the userName */}
//       let userWithSameUserName;

//         userWithSameUserName = await User.findOne({
//           userName: profile?.name?.givenName,
//         });
 
//       let userName;

//       if (userWithSameUserName) {
//         userName = generateFromEmail(profile?.emails[0]?.value, 1);
//       } 

//       const user = await User.create({
//         userName: userName,
//         fullName: profile?.displayName,
//         email: profile?.emails[0].value,
//         OauthId: profile?.id,
//         avatar:profile?.photos[0].value
        
//       });

//       console.log("user in handleauth: ", user);

//       if (!user) {
//         throw new ErrorResponse(400, "Error while creating user!");
//       }
//       const { accessToken } = await generateAccessAndRefreshToken(user?._id);

//       req.auth = accessToken;

//       return callback(null,accessToken);
//     } catch (error: any) {
//       throw new ErrorResponse(
//         500,
//         error.message || "Something went wrong in handleOAuth function!"
//       );
//     }
//   }