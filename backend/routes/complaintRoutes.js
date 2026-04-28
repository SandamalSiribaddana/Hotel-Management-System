const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getSingleComplaint,
  updateComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// helper for multer errors
const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, function (error) {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Image size must be less than or equal to 3 MB",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  });
};

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "COMPLAINT ROUTE WORKING" });
});

// Customer - Create complaint with optional image
router.post("/", protect, handleUpload, createComplaint);

// Customer - View own complaints
router.get("/my", protect, getMyComplaints);

// Admin - View all complaints
router.get("/", protect, adminOnly, getAllComplaints);

// Customer/Admin - View single complaint
router.get("/:id", protect, getSingleComplaint);

// Customer/Admin - Update complaint with optional image
router.put("/:id", protect, handleUpload, updateComplaint);

// Customer/Admin - Delete complaint
router.delete("/:id", protect, deleteComplaint);

module.exports = router;