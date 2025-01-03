import express from "express"
import dotenv from "dotenv"
import cors from "cors"

const app = express()

dotenv.config({ path: "./.env" });

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

app.use(express.static("public"));

export {app}