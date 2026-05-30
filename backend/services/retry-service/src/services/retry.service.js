import { logger } from "../../../../shared/utils/logger.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { getBackoffTime } from "../utils/backoff.js";
import { retryQueue } from "../queue/retry.queue.js";

export const processRetry = async ({ event, webhook, attempt = 1 }) => {
  const delay = getBackoffTime(attempt);

  // Max retries exceeded — send to DLQ
  if (!delay) {
    logger.error(
      `Max retry attempts exceeded for event ${event._id} and webhook ${webhook._id}`
    );
    await sendMessage(TOPICS.DLQ, { event, webhook, attempt });
    return;
  }

  logger.info(
  `Scheduling retry ${attempt} for event ${event?._id || event?.id || "unknown"} and webhook ${webhook?._id || webhook?.id || "unknown"} after ${delay / 1000} seconds`
);

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