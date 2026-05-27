import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

export const retryQueue = new Queue("retry-queue", {
  connection,
});