import { Router } from "express";
import { createEvent, editEvent, getAllEvents, registerForEvent } from "../controllers/event.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createEvent)
router.route("/").get(getAllEvents)
router.route("/edit/:eventId").put(editEvent)
router.route("/register").post(registerForEvent)

export default router