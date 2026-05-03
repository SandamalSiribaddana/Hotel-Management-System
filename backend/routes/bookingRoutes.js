const express = require("express");
const router = express.Router();


const {
  checkAvailability,
  createBookingWithNic,
  getAllBookings,
  getMyBookings,
  getSingleBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Check Availability
router.post("/check-availability", protect, checkAvailability);

// Create booking with NIC
router.post("/create-with-nic", protect, createBookingWithNic);

// Get all bookings
router.get("/", protect, getAllBookings);

// Get my bookings
router.get("/my", protect, getMyBookings);

// Get single booking
router.get("/:id", protect, getSingleBooking);

// Update booking
router.put("/:id", protect, updateBooking);

// Delete booking
router.delete("/:id", protect, deleteBooking);

module.exports = router;