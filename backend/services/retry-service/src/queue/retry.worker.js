import { Worker } from "bullmq";
import { connection } from "./retry.queue.js";
import { sendMessage, TOPICS, logger } from "shared";

export const retryWorker = new Worker(
  "retry-queue",
  async (job) => {
    const { event, webhook, attempt } = job.data;

    logger.info(`Processing retry attempt ${attempt}`);

    //  Re-send to Kafka → delivery will retry
    await sendMessage(TOPICS.EVENTS, {
      ...event,
      retryAttempt: attempt + 1,
    });
  },
  { connection }
);