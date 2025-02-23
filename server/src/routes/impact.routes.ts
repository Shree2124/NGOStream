import {Router} from "express"
import { createImpact, deleteImpact, updateImpact, getAllImpacts } from "../controllers/impact.controller"
import { upload } from "../middlewares/multer.middleware"

const router = Router()
router.route("/get").get(getAllImpacts)
router.route("/create").post(upload.array("images", 5),createImpact)
router.route("/edit/:id").put(upload.array("images", 5),updateImpact)
router.route("/delete/:id").delete(deleteImpact)

export default router