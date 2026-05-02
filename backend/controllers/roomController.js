const Room = require("../models/Room");
const mongoose = require("mongoose");

// Create room
const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      price,
      maxPersons,
      description,
      availabilityStatus,
    } = req.body;

    let image = req.body.image || "";
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => "/uploads/rooms/" + file.filename);
      image = images[0]; // Set first image as the primary image for backward compatibility
    }

    if (!roomNumber || !roomType || !price || !maxPersons || !description) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      return res.status(400).json({
        message: "Room already exists",
      });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      price,
      maxPersons,
      description,
      image,
      images,
      availabilityStatus,
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      message: "Rooms fetched successfully",
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single room
const getSingleRoom = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid room ID format",
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json({
      message: "Room fetched successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid room ID format",
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => "/uploads/rooms/" + file.filename);
      updateData.image = updateData.images[0];
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid room ID format",
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};