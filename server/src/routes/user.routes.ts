import { Router } from "express"
import { createUser, getUser, getUsers, loginUser, logoutUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware"
import {upload} from "../middlewares/multer.middleware"

const router = Router()
router.route("/login").post(loginUser)

router.use(verifyJWT)
router.route("/logout").post(logoutUser)
router.route("/current-user").get(getUser)
router.route("/add-member").post(upload.single("avatar"),createUser)
router.route("/all-members").get(getUsers)


export default router