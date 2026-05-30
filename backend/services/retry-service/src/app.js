import dotenv from "dotenv";
import { startRetryConsumer } from "./consumers/retry.consumer.js";
import { startRetryWorker } from "./queue/retry.worker.js";
import { logger } from "../../../shared/utils/logger.js";
import { connectProducer } from "../../../shared/kafka/producer.js";

dotenv.config();

const start = async () => {
  try {
    await connectProducer();
    await startRetryConsumer();
    startRetryWorker();

    logger.info("Retry Service started successfully");
  } catch (err) {
    logger.error("Retry Service failed", err);
    process.exit(1);
  }
};

start();