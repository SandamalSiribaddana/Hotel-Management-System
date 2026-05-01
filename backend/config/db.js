const mongoose = require("mongoose");

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
};

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in .env file");
  }

  return mongoose.connect(mongoUri, mongoOptions);
}

module.exports = { connectDB };

