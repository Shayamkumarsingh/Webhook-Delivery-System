import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import { startConsumer } from "./consumers/kafka.consumer.js";
import { logger } from  "../../../shared/index.js";



const start = async () => {
  try {
    await connectDB();
    await startConsumer();

    logger.info("Delivery Service started");
  } catch (err) {
    logger.error("Delivery Service failed", err);
    process.exit(1);
  }
};

start();