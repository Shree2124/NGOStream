import { Router } from "express"
import { createUser, editUser, getUser, getUsers, loginUser, logoutUser, deleteUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware"
import {upload} from "../middlewares/multer.middleware"

const router = Router()
router.route("/login").post(loginUser)

router.use(verifyJWT)
router.route("/logout").post(logoutUser)
router.route("/current-user").get(getUser)
router.route("/add-member").post(upload.single("avatar"),createUser)
router.route("/all-members").get(getUsers)
router.route("/edit-member/:userId").put(upload.single("avatar"),editUser)
router.route("/delete-member/:userId").delete(deleteUser)


export default router