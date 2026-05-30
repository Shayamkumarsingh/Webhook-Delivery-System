import { Queue } from "bullmq";
import IORedis from "ioredis";
import { logger } from "../../../../shared/utils/logger.js";

export const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  maxRetriesPerRequest: null,   // ← required by BullMQ
});

connection.on("error", (err) => logger.error("Redis connection error:", err));

export const retryQueue = new Queue("retry-queue", {
  connection,
});