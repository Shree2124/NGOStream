import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOrigin, PORT } from "./config/envConfig";
import { connectDatabase } from "./database/db";
import passport from "passport";
// import { googleStratergy } from "./config/oauthStratergies";

connectDatabase().then(()=>{
  console.log("Connected");
})

const app = express();

dotenv.config({ path: "./.env" });

app.use(
  cors({
    origin: corsOrigin || "*",
    credentials: true,
  })
);

console.log(corsOrigin);


app.use(express.json());

app.use(express.static("public"));

// passport.use(googleStratergy)



/* passport initialized */
app.use(passport.initialize())

app.listen(PORT || 5000 , () => {
  console.log(`App is stared and is running on http://localhost:${PORT}`);
});

{/* Healthcheck route */}
app.get("/", (req, res) => {
  res.send("Hello");
});

import userRouter from "./routes/user.routes"
import goalRouter from "./routes/goals.routes"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/goals", goalRouter)
