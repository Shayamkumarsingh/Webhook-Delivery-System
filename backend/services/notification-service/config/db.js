import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Notification DB Connected to mongodb");
  } catch (err) {
    logger.error("Notification DB Connection Error:", err);
    process.exit(1);
  }
};