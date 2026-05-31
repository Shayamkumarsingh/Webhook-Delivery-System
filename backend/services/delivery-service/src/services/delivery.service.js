import client from "../utils/httpClient.js";
import DeliveryLog from "../models/deliveryLog.model.js";
import { generateSignature } from "./signature.service.js";
import {  sendMessage } from "../../../../shared/kafka/producer.js";
import {  TOPICS } from "../../../../shared/kafka/topics.js";
import { logger } from "../../../../shared/utils/logger.js";
import { publishLog } from "../../../../shared/utils/logPublisher.js";



export const deliveryEvent = async (event, webhook, attempt = 1) => {
  const payload = {
    userId: event.userId,
    email: event.email,
    type: event.type,
    eventType: event.eventType,
  };

  logger.info(`Sending to: ${webhook.url} with payload: ${JSON.stringify(payload)}`);

  const signature = generateSignature(payload, webhook.secret);

  try {
    const response = await client.post(webhook.url, payload, {
      headers: {
        "x-signature": signature,
      },
    });

    await DeliveryLog.create({
      eventId: event._id?.toString() || event.id?.toString() || event.userId?.toString() || "unknown",
      webhookUrl: webhook.url,
      status: "success",
      response: response.data,
      attempt,
    });

    logger.info("webhook delivered successfully");

    
    await publishLog("delivery-service", "info", "Webhook delivered successfully", {
      webhookUrl: webhook.url,
      eventId: event._id,
      attempt,
    });

  } catch (err) {
    logger.error("Delivery failed: " + err.message);

    await DeliveryLog.create({
      eventId: event._id?.toString() || event.id?.toString() || event.userId?.toString() || "unknown",
      webhookUrl: webhook.url,
      status: "failed",
      response: { error: err.message },
      attempt,
    });

    await sendMessage(TOPICS.RETRY, {
      event,
      webhook,
      attempt,
    });

   
    await publishLog("delivery-service", "error", "Webhook delivery failed", {
      webhookUrl: webhook.url,
      error: err.message,
      attempt,
    });
  }
};