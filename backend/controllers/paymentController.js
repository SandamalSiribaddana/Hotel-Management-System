const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// Upload payment slip and create payment
const uploadSlip = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your bank deposit payslip",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount,
      paymentMethod,
      paymentSlip: req.file.filename,
      status: "Pending Verification",
    });

    booking.status = "Pending Admin Approval";
    await booking.save();

    res.status(201).json({
      message: "Payment submitted successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("bookingId");

    res.status(200).json({
      message: "Payments fetched successfully",
      count: payments.length,
      payments,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET single payment
const getSinglePayment = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id)
      .populate("bookingId");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json({
      message: "Payment fetched successfully",
      payment,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE payment
const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE payment
const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Payment deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  uploadSlip,
  getAllPayments,
  getSinglePayment,
  updatePayment,
  deletePayment,
};