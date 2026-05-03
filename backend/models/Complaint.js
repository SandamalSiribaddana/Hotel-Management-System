const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    // Reference to the user who created the complaint
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Complaint message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Uploaded image filename (optional)
    image: {
      type: String,
      default: "",
    },

    // Complaint status
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Complaint", complaintSchema);
