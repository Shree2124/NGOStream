import { Router } from "express"
import { createUser, getUser, loginUser, logoutUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware"

const router = Router()
router.route("/login").post(loginUser)

router.use(verifyJWT)
router.route("/logout").post(logoutUser)
router.route("/current-user").get(getUser)
router.route("/add-member").post(createUser)


export default router