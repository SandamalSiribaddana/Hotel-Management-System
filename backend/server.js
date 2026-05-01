const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");
const User = require("./user/User");

const authRoutes = require("./auth/authRoutes");
const { notFound, errorHandler } = require("./exception/errorHandler");

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
  res.send("Hotel Backend (base template) is running");
});

app.use("/api/auth", authRoutes);

// Auto-create admin account from .env on startup
const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
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

  console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
};

app.use(notFound);
app.use(errorHandler);

connectDB(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Auto-seed admin from .env
    await seedAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed!");
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