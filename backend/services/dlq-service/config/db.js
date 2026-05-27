import mongoose from "mongoose";
import {logger} from "shared"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("DLQ DB Connected");
  } catch (err) {
    logger.error("DLQ DB Connection Error:", err);
    process.exit(1);
  }
};