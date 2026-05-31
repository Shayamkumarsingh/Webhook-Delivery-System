import dotenv from "dotenv";
dotenv.config();
import { startNotificationConsumer } from "./consumers/notification.consumer.js";
import { startUserConsumer } from "./consumers/user.consumer.js";
import { logger } from "../../../shared/utils/logger.js";
import { connectDB } from "../config/db.js";
import { connectProducer } from "../../../shared/kafka/producer.js";

const start = async () => {
  try {
    await connectDB();
    await connectProducer();
    await startNotificationConsumer();
    await startUserConsumer();

    logger.info("Notification Service started");
  } catch (err) {
    logger.error("Notification Service failed", err);
    process.exit(1);
  }
};

start();