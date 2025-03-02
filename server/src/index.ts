import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOrigin, PORT } from "./config/envConfig";
import { connectDatabase } from "./database/db";
import passport from "passport";
import { generatePDFReceipt } from "./utils/receiptCreation";
// import { googleStratergy } from "./config/oauthStratergies";

connectDatabase().then(() => {
  console.log("Connected");
});

const app = express();

dotenv.config({ path: "./.env" });

app.use(
  cors({
    origin: corsOrigin || "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// const donor = {
//   _id: "64a7f1d63b5bce00123abcd1",
//   name: "John Doe",
//   email: "john.doe@example.com",
//   phone: "123-456-7890",
//   address: "123 Elm Street, Springfield, USA",
//   donations: ["64a7f1e23b5bce00123abcd2", "64a7f1f13b5bce00123abcd3"],
//   createdAt: "2025-01-01T12:00:00Z",
//   updatedAt: "2025-01-15T10:00:00Z",
// };
// const donation = {
//   _id: "64a7f1e23b5bce00123abcd2",
//   donationType: "Monetary",
//   donorId: "64a7f1d63b5bce00123abcd1",
//   monetaryDetails: {
//     amount: 100,
//     currency: "USD",
//     paymentStatus: "Successful",
//     paymentMethod: "Card",
//     transactionId: "txn_1A2B3C4D5E6F7G",
//   },
//   goalId: "64a7f2003b5bce00123abcd4",
//   currency: "USD",
//   stripePaymentId: "pi_3K5LOIJHlaDBKxhv1hE9K9zA",
//   stripeSessionId: "cs_test_123456789abcdef",
//   eventId: "64a7f2203b5bce00123abcd5",
//   beneficiaryId: "64a7f2303b5bce00123abcd6",
//   createdAt: "2025-01-01T12:00:00Z",
//   updatedAt: "2025-01-15T10:00:00Z",
// };

// generatePDFReceipt(donation, donor).then((re)=>{console.log(re);
// }).catch((err)=>console.log(err)
// )

console.log(corsOrigin);

app.use(express.json());

app.use(express.static("public"));

app.listen(PORT || 5000, () => {
  console.log(`App is stared and is running on http://localhost:${PORT}`);
});

{
  /* Healthcheck route */
}
app.get("/", (req, res) => {
  res.send("Hello");
});

import userRouter from "./routes/user.routes";
import goalRouter from "./routes/goals.routes";
import donationRouter from "./routes/donation.routes";
import eventRouter from "./routes/events.routes";
import adminRouter from "./routes/dashboard.routes";
import impactRouter from "./routes/impact.routes";
import schemeRouter from "./routes/scheme.routes";
import BeneficiaryRouter from "./routes/beneficiary.routes";
import ManageAdmin from "./routes/admin.routes";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/goals", goalRouter);
app.use("/api/v1/donation", donationRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/impact", impactRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/schemes", schemeRouter);
app.use("/api/v1/beneficiary", BeneficiaryRouter);
app.use("/api/v1/manage-admin", ManageAdmin);
