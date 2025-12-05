import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ MongoDB connection string is missing in .env.local file!");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("🟢 Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "evently",
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected Successfully!");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}