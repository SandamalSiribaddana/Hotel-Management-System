const Service = require("../models/Service");
const mongoose = require("mongoose");


// CREATE service
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      message: "Service created successfully",
      service,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();

    res.status(200).json({
      message: "Services fetched successfully",
      count: services.length,
      services,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET single service
const getSingleService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service fetched successfully",
      service,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE service
const updateService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE service
const deleteService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      message: "Service deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};