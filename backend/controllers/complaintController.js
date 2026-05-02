const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

//
// Customer - Create complaint (with optional image)
//
const createComplaint = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Complaint message is required",
      });
    }

    const imagePath = req.file ? req.file.filename : "";

    const complaint = await Complaint.create({
      userId: req.user._id,
      message,
      image: imagePath,
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Admin - View all complaints
//
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All complaints fetched successfully",
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Customer - View own complaints
//
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.user._id,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your complaints fetched successfully",
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Customer/Admin - View single complaint
//
const getSingleComplaint = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID",
      });
    }

    const complaint = await Complaint.findById(id).populate(
      "userId",
      "name email role",
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      complaint.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      message: "Complaint fetched successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Customer/Admin - Update complaint (with optional image)
//
const updateComplaint = async (req, res) => {
  try {
    const id = req.params.id;
    const { message, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      complaint.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    complaint.message = message || complaint.message;

    if (req.user.role === "admin") {
      complaint.status = status || complaint.status;
    }

    if (req.file) {
      // delete old image if exists
      if (complaint.image) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "uploads",
          complaint.image,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      complaint.image = req.file.filename;
    }

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//
// Customer/Admin - Delete complaint
//
const deleteComplaint = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      complaint.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // delete image file if exists
    if (complaint.image) {
      const imagePath = path.join(__dirname, "..", "uploads", complaint.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Complaint.findByIdAndDelete(id);

    res.status(200).json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getSingleComplaint,
  updateComplaint,
  deleteComplaint,
};
