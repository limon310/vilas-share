import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    "Usage: node src/scripts/set-admin.js your-email@example.com"
  );
  process.exit(1);
}

try {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    throw new Error(
      "User not found. Register and log in with that email first."
    );
  }

  console.log(`Admin role assigned to ${user.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}