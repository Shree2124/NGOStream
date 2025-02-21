import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createBeneficiary,
  deleteBeneficiary,
  enrollBeneficiaryInScheme,
  getAllBeneficiaries,
  getBeneficiariesByScheme,
  getBeneficiaryById,
  markBeneficiaryAsBenefited,
  updateBeneficiary,
} from "../controllers/beneficiary.controller";

const router = Router();

// router.use(verifyJWT);
router.route("/beneficiaries").post(createBeneficiary).get(getAllBeneficiaries);

router
  .route("/beneficiaries/:id")
  .get(getBeneficiaryById)
  .put(updateBeneficiary)
  .delete(deleteBeneficiary);

router.route("/schemes/:schemeId/enroll").post(enrollBeneficiaryInScheme);

router.route("/schemes/:schemeId/benefit").post(markBeneficiaryAsBenefited);

router.route("/schemes/:schemeId/beneficiaries").get(getBeneficiariesByScheme);

export default router;
