import { createConsumer } from "../../../../shared/kafka/consumer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { logger } from "../../../../shared/utils/logger.js";
import { notifyFailure } from "../services/notification.service.js";

export const startNotificationConsumer = async () => {
  await createConsumer("notification-group", TOPICS.DLQ, async (message) => {
    try {
      logger.info("Received DLQ event, sending notification");
      await notifyFailure(message);
    } catch (err) {
      logger.error("Notification consumer failed", err);
    }
  });
};