import { Router } from "express";
import { createEvent, editEvent, getAllEvents, registerForEvent, getEvent, addEventFeedback,getEventById, generateEventReport } from "../controllers/event.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/:eventId").get(getEvent)
router.route("/feedback/:eventId").post(addEventFeedback)

router.get("/:eventId/report", generateEventReport);
router.use(verifyJWT)
router.route("/create").post(createEvent)
router.route("/").get(getAllEvents)
router.route("/edit/:eventId").put(editEvent)
router.route("/register").post(registerForEvent)
router.route("/get-event-by-id/:eventId").get(getEventById)


export default router