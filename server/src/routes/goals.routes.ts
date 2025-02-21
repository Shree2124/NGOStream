import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { createGoal, deleteGoal, editGoal, getAllGoals, getGoal } from "../controllers/goals.controller"
import { upload } from "../middlewares/multer.middleware"

const router = Router()
router.route("/goal/:goalId").get(getGoal)
router.route("/all-goals").get(getAllGoals)
router.use(verifyJWT)
router.route("/create").post(createGoal)
router.route("/edit/:goalId").put(upload.single("image"),editGoal)
router.route("/delete/:goalId").delete(deleteGoal)

export default router