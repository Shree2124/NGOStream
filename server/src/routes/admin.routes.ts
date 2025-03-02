import express from "express";
import {
  createAdmin,
  deleteAdmin,
  updateAdmin,
  getAdmins,
} from "./../controllers/admin.controller";

const router = express.Router();

router.post("/create", createAdmin);
router.delete("/delete/:email", deleteAdmin);
router.put("/update/:id", updateAdmin);
router.get("/list", getAdmins);

export default router;
