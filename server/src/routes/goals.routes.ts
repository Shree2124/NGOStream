import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { createGoal, editGoal, getAllGoals } from "../controllers/goals.controller"
import { upload } from "../middlewares/multer.middleware"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createGoal)
router.route("/all-goals").get(getAllGoals)
router.route("/edit/:goalId").put(upload.single("image"),editGoal)
router.route("/delete/:goalId").delete()

export default router