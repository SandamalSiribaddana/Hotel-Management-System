const Staff = require("../models/Staff");
const mongoose = require("mongoose");

// Create staff
const createStaff = async (req, res) => {
  try {
    const { name, role, phone, email, salary } = req.body;

    if (!name || !role || !phone || !email || !salary) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingStaff = await Staff.findOne({ email });

    if (existingStaff) {
      return res.status(400).json({
        message: "Staff with this email already exists",
      });
    }

    const staff = await Staff.create({
      name,
      role,
      phone,
      email,
      salary,
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Staff fetched successfully",
      count: staff.length,
      staff,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get single staff
const getSingleStaff = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID",
      });
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json({
      message: "Staff fetched successfully",
      staff,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Update staff
const updateStaff = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID",
      });
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Staff updated successfully",
      staff: updatedStaff,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID",
      });
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    await Staff.findByIdAndDelete(id);

    res.status(200).json({
      message: "Staff deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
};      