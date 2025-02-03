import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { getQuickStats } from "../controllers/dashboard.controller"

const router = Router()
router.use(verifyJWT)

router.route("/metrics").get(getQuickStats)

export default router