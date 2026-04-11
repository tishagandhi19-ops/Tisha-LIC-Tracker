const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/api/users", authMiddleware, userController.createUser);

router.get("/api/users", authMiddleware, userController.getUsers);

router.get("/api/users/:id", authMiddleware, userController.getUser);

router.put("/api/users/:id", authMiddleware, userController.updateUser);

router.delete("/api/users/:id", authMiddleware, userController.deleteUser);
router.get("/api/policiesCount",authMiddleware,userController.getPoliciesCount);
module.exports = router;