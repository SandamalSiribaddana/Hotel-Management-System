const express = require("express");
const router = express.Router();

const authController = require("./authController");
const { protect } = require("../common/middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "TEST ROUTE WORKING" });
});

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", protect, authController.getUserProfile);

module.exports = router;

