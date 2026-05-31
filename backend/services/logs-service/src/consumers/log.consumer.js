import { createConsumer } from "../../../../shared/kafka/consumer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { createLog } from "../services/log.service.js";
import { logger } from "../../../../shared/utils/logger.js";

export const startLogConsumer = async () => {
  await createConsumer("logs-group", TOPICS.LOGS, async (message) => {
    try {
      const { service, level, logMessage, metadata } = message;
      await createLog(service, level, logMessage, metadata);
    } catch (err) {
      logger.error("Error processing log message:", err);
    }
  });
};