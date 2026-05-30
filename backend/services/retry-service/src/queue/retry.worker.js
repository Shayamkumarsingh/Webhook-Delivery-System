import { Worker } from "bullmq";
import { connection } from "./retry.queue.js";
import { logger } from "../../../../shared/utils/logger.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";

export const startRetryWorker = () => {
  const worker = new Worker(
    "retry-queue",
    async (job) => {
      const { event, webhook, attempt } = job.data;
      logger.info(`Processing retry attempt ${attempt}`);

      // Re-send to webhook delivery topic so delivery service picks it up
      await sendMessage(TOPICS.DELIVERY, {
  event,
  webhook,
  attempt: attempt + 1,
});
    },
    { connection }
  );

  worker.on("failed", (job, err) => {
    logger.error(`Retry job failed for attempt ${job.data.attempt}:`, err);
  });

  return worker;
};