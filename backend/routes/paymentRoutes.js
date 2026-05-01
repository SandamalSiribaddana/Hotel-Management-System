const express = require("express");
const router = express.Router();

const {
  uploadSlip,
  getAllPayments,
  getSinglePayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// TEST route
router.get("/test", (req, res) => {
  res.json({ message: "PAYMENT ROUTE WORKING" });
});


router.post("/upload-slip", protect, upload.single("paymentSlip"), uploadSlip);

router.get("/", protect, getAllPayments);

router.get("/:id", protect, getSinglePayment);

router.put("/:id", protect, updatePayment);

router.delete("/:id", protect, deletePayment);


module.exports = router;