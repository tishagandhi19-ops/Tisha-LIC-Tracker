const express = require("express");
const router = express.Router();

const installmentController = require("../controllers/installmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/api/installments/generate/:policyId",
  authMiddleware,
  installmentController.generateInstallments
);

router.get(
  "/api/installments/policy/:policyId",
  authMiddleware,
  installmentController.getPolicyInstallments
);

router.put(
  "/api/installments/:id",
  authMiddleware,
  installmentController.updateInstallment
);

router.delete(
  "/api/installments/policy/:policyId",
  authMiddleware,
  installmentController.deletePolicyInstallments
);

module.exports = router;