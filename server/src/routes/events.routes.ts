import { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/event.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createEvent)
router.route("/").get(getAllEvents)

export default router