import { Router } from "express";
import { createEvent } from "../controllers/event.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createEvent)

export default router