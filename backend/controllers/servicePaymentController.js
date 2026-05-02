const ServicePayment = require("../models/ServicePayment");

// CREATE service payment request
const createServicePayment = async (req, res) => {
  try {
    const { customerName, customerId, phoneNumber, serviceName, servicePrice } = req.body;
    let paymentSlip = "";

    if (req.file) {
      paymentSlip = req.file.path.replace(/\\/g, "/");
    } else {
      return res.status(400).json({ message: "Payment slip is required" });
    }

    // Attach userId if auth token is present (optional for backward compat)
    const userId = req.user ? req.user._id : null;

    const servicePayment = await ServicePayment.create({
      userId,
      customerName,
      customerId,
      phoneNumber,
      serviceName,
      servicePrice,
      paymentSlip,
      status: "Pending Approval",
    });

    res.status(201).json({
      message: "Service request submitted successfully",
      servicePayment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET all service payments (for admin)
const getAllServicePayments = async (req, res) => {
  try {
    const servicePayments = await ServicePayment.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Service payments fetched successfully",
      count: servicePayments.length,
      servicePayments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE service payment status (Approve/Reject)
const updateServicePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedPayment = await ServicePayment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Service payment not found" });
    }

    res.status(200).json({
      message: `Service payment ${status.toLowerCase()} successfully`,
      servicePayment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET service payments for logged-in customer
const getMyServicePayments = async (req, res) => {
  try {
    const servicePayments = await ServicePayment.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your service requests fetched successfully",
      count: servicePayments.length,
      servicePayments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createServicePayment,
  getAllServicePayments,
  updateServicePaymentStatus,
  getMyServicePayments,
};
