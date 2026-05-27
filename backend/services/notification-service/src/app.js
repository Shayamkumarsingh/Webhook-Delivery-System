import dotenv from "dotenv";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";
import { startUserConsumer } from "./consumers/user.consumer.js";
import { logger } from "shared";
import { connectDB } from "../config/db.js";

dotenv.config();

const start = async () => {
  try {
    await connectDB();
    await startNotificationConsumer();
    await startUserConsumer();

    logger.info("Notification Service started");

  } catch (err) {
    logger.error("Notification Service failed", err);
    process.exit(1);
  }
};

start();
