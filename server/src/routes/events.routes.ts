import { Router } from "express";
import {
  createEvent,
  editEvent,
  getAllEvents,
  registerForEvent,
  getEvent,
  addEventFeedback,
  getEventById,
  generateEventReport,
  getEventNames,
} from "../controllers/event.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/get-event-names").get(verifyJWT, getEventNames);
router.route("/:eventId").get(getEvent);
router.route("/feedback/:eventId").post(addEventFeedback);

router.route("/").get(getAllEvents);
router.route("/register").post(registerForEvent);
router.use(verifyJWT);
router.get("/:eventId/report", generateEventReport);
router.route("/create").post(createEvent);
router.route("/edit/:eventId").put(editEvent);
router.route("/get-event-by-id/:eventId").get(getEventById);

export default router;
