const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      required: true,
    },
    paymentSlip: {
      type: String,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending Verification", "Verified", "Rejected"],
      default: "Pending Verification",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);