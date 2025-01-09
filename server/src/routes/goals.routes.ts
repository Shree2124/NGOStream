import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { createGoal, getAllGoals } from "../controllers/goals.controller"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createGoal)
router.route("/all-goals").get(getAllGoals)

export default router