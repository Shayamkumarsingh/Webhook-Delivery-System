import dotenv from "dotenv";
import { startRetryConsumer } from "./consumers/retry.consumer.js";
import { logger } from "shared";
import { retryWorker } from "./queue/retry.worker.js";

dotenv.config();

const start = async () => {
  try {
    await startRetryConsumer();

    logger.info("Retry Service (BULLMQ) started successfully");

  } catch (err) {
    logger.error("Retry Service failed", err);
    process.exit(1);
  }
};

start();