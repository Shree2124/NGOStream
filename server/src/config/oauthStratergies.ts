// import { Strategy as GoogleStratergy, StrategyOptions} from "passport-google-oauth20";

// import { handleOAuth } from "./handleOAuth";
// import { googleId, googleSecret } from "./envConfig";


// const googleStratergy = new GoogleStratergy(
//   {
//     clientID: googleId!,
//     clientSecret:googleSecret!,
//     callbackURL:'http://localhost:5000/api/v1/user/oauth/google',
//     passReqToCallback: true,
//   } ,
//   function (req: any, token: any, refreshToken: any, profile: any, cb: (err: any, user?: any) => void) {
//     handleOAuth(req, profile, cb,req.query.state);
//   }
// );



// export{
//     googleStratergy,
    
// }