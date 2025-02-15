import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { getQuickStats, getEvent } from "../controllers/dashboard.controller"

const router = Router()
router.use(verifyJWT)

router.route("/metrics").get(getQuickStats)
router.route("/event/:eventId").get(getEvent)

export default router