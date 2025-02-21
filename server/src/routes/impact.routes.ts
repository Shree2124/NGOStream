import {Router} from "express"
import { createImpact } from "../controllers/impact.controller"
import { upload } from "../middlewares/multer.middleware"

const router = Router()

router.route("/create").post(upload.array("images", 5),createImpact)

export default router