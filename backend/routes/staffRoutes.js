const express = require("express");
const router = express.Router();

const {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "STAFF ROUTE WORKING" });
});

// Admin only CRUD
router.post("/", protect, adminOnly, createStaff);
router.get("/", protect, adminOnly, getAllStaff);
router.get("/:id", protect, adminOnly, getSingleStaff);
router.put("/:id", protect, adminOnly, updateStaff);
router.delete("/:id", protect, adminOnly, deleteStaff);

module.exports = router;