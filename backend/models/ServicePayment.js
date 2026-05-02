const mongoose = require("mongoose");

const servicePaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
    },
    paymentSlip: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServicePayment", servicePaymentSchema);
