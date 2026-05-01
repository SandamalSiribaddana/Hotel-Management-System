const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../../../shared/middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "TEST ROUTE WORKING" });
});

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", authMiddleware.protect, authController.getUserProfile);

module.exports = router;