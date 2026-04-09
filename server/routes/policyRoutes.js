const express = require("express");
const router = express.Router();

const policyController = require("../controllers/policyController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/api/policies", authMiddleware, policyController.createPolicy);

router.get("/api/users/:userId/policies", authMiddleware, policyController.getUserPolicies);

router.get("/api/policies/:id", authMiddleware, policyController.getPolicy);

router.put("/api/policies/:id", authMiddleware, policyController.updatePolicy);

router.delete("/api/policies/:id", authMiddleware, policyController.deletePolicy);

module.exports = router;