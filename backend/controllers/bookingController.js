const Booking = require("../models/Booking");
const Room = require("../models/Room");
const mongoose = require("mongoose");

// Check Availability
const checkAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Please provide roomId, checkInDate and checkOutDate",
      });
    }

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);

    const conflictingBookings = await Booking.find({
      roomId,
      status: { $nin: ["Cancelled", "Rejected"] },
      checkInDate: { $lt: newCheckOut },
      checkOutDate: { $gt: newCheckIn }
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        available: false,
        message: "This room is already booked for the selected dates.",
      });
    }

    res.status(200).json({
      available: true,
      message: "Room is available for the selected dates.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create booking with NIC
const createBookingWithNic = async (req, res) => {
  try {
    const {
      roomId,
      fullName,
      nicNumber,
      phone,
      email,
      numberOfPersons,
      checkInDate,
      checkOutDate,
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !fullName || !nicNumber || !phone || !email || !numberOfPersons) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const nicRegex = /^([0-9]{9}[vV]|[0-9]{12})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!nicRegex.test(nicNumber)) {
      return res.status(400).json({
        message: "Invalid NIC format. Should be 9 numbers followed by 'V' or 12 numbers",
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number format. Must be exactly 10 digits",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        message: "Invalid room ID format",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (parseInt(numberOfPersons, 10) > room.maxPersons) {
      return res.status(400).json({
        message: `Capacity Exceeded. This room allows a maximum of ${room.maxPersons} person(s).`,
      });
    }

    if (parseInt(numberOfPersons, 10) <= 0) {
      return res.status(400).json({
        message: "Number of persons must be at least 1",
      });
    }

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);
    const timeDiff = newCheckOut.getTime() - newCheckIn.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (numberOfNights <= 0) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
      });
    }

    const totalAmount = numberOfNights * room.price;
    const halfPayment = totalAmount / 2;

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      fullName,
      nicNumber,
      phone,
      email,
      numberOfPersons,
      checkInDate,
      checkOutDate,
      numberOfNights,
      totalAmount,
      halfPayment,
      status: "Pending Payment",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const Payment = require("../models/Payment");

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("roomId", "roomNumber roomType price")
      .lean();

    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds } }).lean();

    const mergedBookings = bookings.map((booking) => {
      const payment = payments.find(
        (p) => p.bookingId.toString() === booking._id.toString()
      );
      return {
        ...booking,
        paymentId: payment ? payment._id : null,
        paymentStatus: payment ? payment.status : "No Payment",
        paymentSlip: payment ? payment.paymentSlip : null,
      };
    });

    res.status(200).json({
      message: "Bookings fetched successfully",
      count: mergedBookings.length,
      bookings: mergedBookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get my bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("roomId", "roomNumber roomType price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your bookings fetched successfully",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single booking
const getSingleBooking = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id)
      .populate("userId", "name email")
      .populate("roomId", "roomNumber roomType price");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (req.body.status === "Cancelled" && booking.status === "Completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled.",
      });
    }

    // Update payment record when booking is completed
    if (req.body.status === "Completed" && booking.status !== "Completed") {
      const payment = await Payment.findOne({ bookingId: id });
      if (payment) {
        const fullAmount = booking.totalAmount;
        
        payment.amount = fullAmount;
        payment.paidAmount = fullAmount;
        payment.revenueAmount = fullAmount;
        payment.remainingAmount = 0;
        payment.paymentCompleted = true;
        payment.bookingStatus = "Completed";
        
        await payment.save();
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  checkAvailability,
  createBookingWithNic,
  getAllBookings,
  getMyBookings,
  getSingleBooking,
  updateBooking,
  deleteBooking,
};  