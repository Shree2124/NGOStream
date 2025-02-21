import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  addDocumentRequirement,
  createScheme,
  deleteScheme,
  getActiveSchemes,
  getAllSchemes,
  getBeneficiaryEnrollmentStatus,
  getSchemeById,
  getSchemeStatistics,
  reactivateScheme,
  removeDocumentRequirement,
  suspendScheme,
  updateDocumentRequirement,
  updateScheme,
} from "../controllers/scheme.controller";

const router = Router();

// router.use(verifyJWT);

router.route("/schemes").post(createScheme).get(getAllSchemes);

router.route("/schemes/active").get(getActiveSchemes);

router
  .route("/schemes/:id")
  .get(getSchemeById)
  .put(updateScheme)
  .delete(deleteScheme);

router.route("/schemes/:id/statistics").get(getSchemeStatistics);

router.route("/schemes/:id/documents").post(addDocumentRequirement);

router
  .route("/schemes/:id/documents/:documentName")
  .delete(removeDocumentRequirement)
  .put(updateDocumentRequirement);

router.route("/schemes/:id/suspend").post(suspendScheme);

router.route("/schemes/:id/reactivate").post(reactivateScheme);

router
  .route("/schemes/:schemeId/beneficiaries/:beneficiaryId/status")
  .get(getBeneficiaryEnrollmentStatus);

export default router;
