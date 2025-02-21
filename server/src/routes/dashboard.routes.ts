import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { getQuickStats, getEvent, getImpacts } from "../controllers/dashboard.controller"
import { getAllGoals } from "../controllers/goals.controller"

const router = Router()
router.use(verifyJWT)

router.route("/metrics").get(getQuickStats)
router.route("/event/:eventId").get(getEvent)
router.route("/all-goals").get(getAllGoals)
router.route("/get-impacts").get(getImpacts)

export default router