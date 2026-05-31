import { sendEmail } from "./email.service.js";
import UserCache from "../models/userCache.model.js";
import { failureTemplate } from "../templates/failure.template.js";
import { logger } from "../../../../shared/utils/logger.js";

export const notifyFailure = async ({ event, webhook }) => {
  try {
    const user = await UserCache.findOne({ userId: event.userId });

    if (!user) {
      logger.warn(`User not found in cache: ${event.userId}`);
      return;
    }

    await sendEmail({
      to: user.email,
      subject: "Webhook Delivery Failed",
      html: failureTemplate({
        webhookUrl: webhook.url,
        eventType: event.eventType,
      }),
    });

    logger.info(`Failure notification sent to ${user.email}`);

  } catch (err) {
    logger.error("Notification failed", err);
  }
};