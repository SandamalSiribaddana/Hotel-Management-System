const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const staffRoutes = require("./routes/staffRoutes");
const servicePaymentRoutes = require("./routes/servicePaymentRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Make uploaded files accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hotel Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-payments", servicePaymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/staff", staffRoutes);

if (!process.env.MONGO_URI) {
  console.log("MONGO_URI is missing in .env file");
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
};

// Auto-create admin account from .env on startup
const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await User.create({
    name: ADMIN_NAME || "Admin",
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`Admin account created: ${ADMIN_EMAIL}`);
};

mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Auto-seed admin from .env
    await seedAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(" MongoDB connection failed!");
    console.error("   Error code :", error.code || "N/A");
    console.error("   Error message:", error.message);
    if (error.code === "ECONNREFUSED" || error.message.includes("querySrv") || error.message.includes("ECONNREFUSED")) {
      console.error("\n🔍 DIAGNOSIS - Likely causes:");
      console.error("   1. Your current IP is NOT whitelisted in MongoDB Atlas Network Access.");
      console.error("      → Go to: https://cloud.mongodb.com → Network Access → Add IP Address");
      console.error("      → Add your current IP or use 0.0.0.0/0 to allow all (dev only)");
      console.error("   2. The Atlas cluster may be PAUSED.");
      console.error("      → Go to: https://cloud.mongodb.com → Clusters → Resume");
      console.error("   3. A firewall/antivirus is blocking outbound port 27017.");
    } else if (error.message.includes("Authentication failed") || error.message.includes("auth")) {
      console.error("\n🔍 DIAGNOSIS: Authentication failed!");
      console.error("   → Check MONGO_URI username and password in .env file");
    }
    process.exit(1);
  });