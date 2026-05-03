const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const ServicePayment = require("../models/ServicePayment");
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


// GET all payments (Revenue / Completed)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "Verified" })
      .populate({
        path: "bookingId",
        populate: { path: "roomId" },
      })
      .populate("userId", "name");

    const completedPayments = payments.filter(
      (p) => p.bookingId && p.bookingId.status === "Completed"
    );

    const formattedPayments = completedPayments.map((p) => {
      return {
        _id: p._id,
        bookingId: p.bookingId._id,
        customerName: p.bookingId.fullName || p.userId?.name || "Unknown",
        nic: p.bookingId.nicNumber,
        roomNumber: p.bookingId.roomId?.roomNumber || "N/A",
        roomType: p.bookingId.roomId?.roomType || "N/A",
        totalAmount: p.bookingId.totalAmount,
        paidAmount: p.paidAmount || p.amount,
        revenueAmount: p.revenueAmount || p.amount,
        remainingAmount: p.remainingAmount !== undefined ? p.remainingAmount : Math.max(0, p.bookingId.totalAmount - p.amount),
        paymentCompleted: p.paymentCompleted !== undefined ? p.paymentCompleted : p.amount >= p.bookingId.totalAmount,
        paymentStatus: p.status,
        bookingStatus: p.bookingStatus || p.bookingId.status,
        checkInDate: p.bookingId.checkInDate,
        checkOutDate: p.bookingId.checkOutDate,
        completedDate: p.updatedAt,
        paymentSlip: p.paymentSlip,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
      };
    });

    const bookingRevenue = formattedPayments.reduce((sum, payment) => {
      return sum + Number(payment.revenueAmount || payment.paidAmount || payment.totalAmount || 0);
    }, 0);

    const approvedServices = await ServicePayment.find({ status: "Approved" });
    const serviceRevenue = approvedServices.reduce((sum, service) => {
      return sum + Number(service.servicePrice || 0);
    }, 0);

    const formattedServices = approvedServices.map((p) => {
      return {
        _id: p._id,
        isServicePayment: true,
        customerName: p.customerName,
        nic: p.customerId,
        serviceName: p.serviceName,
        totalAmount: p.servicePrice,
        paidAmount: p.servicePrice,
        paymentStatus: "Verified",
        bookingStatus: p.status, // "Approved"
        completedDate: p.updatedAt,
        paymentSlip: p.paymentSlip,
        createdAt: p.createdAt,
      };
    });

    const allPayments = [...formattedPayments, ...formattedServices].sort((a, b) => {
      return new Date(b.completedDate) - new Date(a.completedDate);
    });

    const totalRevenue = bookingRevenue + serviceRevenue;

    res.status(200).json({
      message: "Payments fetched successfully",
      count: allPayments.length,
      totalRevenue,
      payments: allPayments,
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