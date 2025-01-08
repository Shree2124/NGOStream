import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { createGoal } from "../controllers/goals.controller"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createGoal)

export default router