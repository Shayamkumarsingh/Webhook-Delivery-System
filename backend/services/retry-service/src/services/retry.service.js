import { logger } from "../../../../shared/utils/logger.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { getBackoffTime } from "../utils/backoff.js";
import { retryQueue } from "../queue/retry.queue.js";
import { publishLog } from "../../../../shared/utils/logPublisher.js";


export const processRetry = async ({ event, webhook, attempt = 1 }) => {
  const delay = getBackoffTime(attempt);

  if (!delay) {
    logger.error(
      `Max retry attempts exceeded for event ${event._id} and webhook ${webhook._id}`
    );

    await publishLog("retry-service", "error", "Max retry attempts exceeded, sending to DLQ", {
      attempt,
      webhookId: webhook?._id || webhook?.id,
      eventId: event?._id || event?.id,
    });

    await sendMessage(TOPICS.DLQ, { event, webhook, attempt });
    return;
  }

  logger.info(
    `Scheduling retry ${attempt} for event ${event?._id || event?.id || "unknown"} and webhook ${webhook?._id || webhook?.id || "unknown"} after ${delay / 1000} seconds`
  );

  await publishLog("retry-service", "info", `Scheduling retry ${attempt}`, {
    attempt,
    delay,
    webhookId: webhook?._id || webhook?.id,
    eventId: event?._id || event?.id,
  });

  await retryQueue.add(
    "retry-job",
    { event, webhook, attempt },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};