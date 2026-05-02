const express = require("express");
const router = express.Router();
const uploadService = require("../middleware/uploadService");
const { protect } = require("../middleware/authMiddleware");

const {
  createServicePayment,
  getAllServicePayments,
  updateServicePaymentStatus,
  getMyServicePayments,
} = require("../controllers/servicePaymentController");


router.post("/", protect, uploadService.single("paymentSlip"), createServicePayment);


router.get("/", getAllServicePayments);


router.put("/:id/status", updateServicePaymentStatus);


router.get("/my-requests", protect, getMyServicePayments);

module.exports = router;
