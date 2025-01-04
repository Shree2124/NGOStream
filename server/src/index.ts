import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PORT } from "./config/envConfig";
import { connectDatabase } from "./database/db";

connectDatabase().then(()=>{
  console.log("Connected");
})

const app = express();

dotenv.config({ path: "./.env" });

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

app.use(express.static("public"));

app.listen(PORT || 5000 , () => {
  console.log(`App is stared and is running on http://localhost:${PORT}`);
});

{/* Healthcheck route */}
app.get("/", (req, res) => {
  res.send("Hello");
});
