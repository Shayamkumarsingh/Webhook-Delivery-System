import { logger } from "../../../../shared/utils/logger.js";
import { createConsumer } from "../../../../shared/kafka/consumer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { saveToDLQ } from "../services/dlq.service.js";

export const startDLQConsumer = async () => {
  await createConsumer("dlq-group", TOPICS.DLQ, async (message) => {
    try {
      logger.error("Received failed event, storing in DLQ");
      await saveToDLQ({
        ...message,
        reason: "Max retries exceeded",
      });
    } catch (err) {
      logger.error("Error processing DLQ message:", err);
    }
  });
};