import { sendEmail } from "./email.service.js";
import UserCache from "../models/userCache.model.js";
import { failureTemplate } from "../templates/failure.template.js";
import { logger } from "shared";
import axios from "axios"

import { metricsMiddleware } from "shared/middleware/metrics.middleware.js";
import { register } from "shared/utils/metrics.js";

app.use(metricsMiddleware);

//  Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});





export const notifyFailure = async ({ event, webhook }) => {
  try {
     const user = await UserCache.findOne({ userId: event.userId });

    if (!user) {
      logger.warn(`User not found in cache: ${event.userId}`);
      return;
    }



    const userEmail = user.email;

    await sendEmail({
      to: userEmail,
      subject: "Webhook Delivery Failed",
      html: failureTemplate({
        webhookUrl: webhook.url,
        eventType: event.eventType,
      }),
    });

    logger.info("Failure notification sent");

  } catch (err) {
    logger.error("Notification failed", err);
  }
};