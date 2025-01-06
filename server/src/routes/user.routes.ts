import { Router } from "express"
import { getSystemUsers, getUser, loginUser, logoutUser, registerUser, verifyUser } from "../controllers/user.controller"
import { verifyJWT } from "../middlewares/auth.middleware"

const router = Router()

router.route("/register").post(registerUser)
router.route("/verify-user").post(verifyUser)
router.route("/login").post(loginUser)

router.use(verifyJWT)
router.route("/logout").post(logoutUser)
router.route("/current-user").post(getUser)

export default router