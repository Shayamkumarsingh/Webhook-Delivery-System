import client from "../utils/httpClient.js";
import DeliveryLog from "../models/deliveryLog.model.js";
import { generateSignature } from "./signature.service.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { logger } from "../../../../shared/utils/logger.js";
import { publishLog } from "../../../../shared/utils/logPublisher.js";

export const deliveryEvent = async (event, webhook, attempt = 1) => {
  const eventId = event._id?.toString() || event.id?.toString() || `evt_${Date.now()}`;

  // Standard Webhook Delivery Payload
  const payload = {
    id: eventId,
    eventId: eventId,
    eventType: event.eventType || event.type,
    email: event.email,
    userId: event.userId,
    data: event.payload || {},
    payload: event.payload || {},
    timestamp: event.createdAt || new Date().toISOString(),
    attempt,
  };

  logger.info(`Dispatching to endpoint: ${webhook.url} (Attempt #${attempt})`);

  const secret = webhook.secret || "webhook_secret";
  const signature = generateSignature(payload, secret);

  try {
    const response = await client.post(webhook.url, payload, {
      headers: {
        "x-signature": signature,
        "x-event-id": eventId,
        "x-delivery-attempt": attempt.toString(),
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    await DeliveryLog.create({
      eventId,
      webhookUrl: webhook.url,
      status: "success",
      response: response.data || { status: response.status, statusText: response.statusText },
      attempt,
    });

    logger.info(`Webhook successfully delivered to ${webhook.url}`);

    await publishLog("delivery-service", "info", `Webhook successfully delivered to ${webhook.url}`, {
      webhookUrl: webhook.url,
      eventId,
      attempt,
    });

  } catch (err) {
    const errorMessage = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message || "HTTP Delivery Error";

    logger.error(`Delivery failed for ${webhook.url}: ${errorMessage}`);

    await DeliveryLog.create({
      eventId,
      webhookUrl: webhook.url,
      status: "failed",
      response: {
        error: errorMessage,
        statusCode: err.response?.status,
      },
      attempt,
    });

    // Schedule automatic retry with exponential backoff
    await sendMessage(TOPICS.RETRY, {
      event: { ...event, _id: eventId, id: eventId },
      webhook,
      attempt,
    });

    await publishLog("delivery-service", "error", `Webhook delivery failed for ${webhook.url}: ${errorMessage}`, {
      webhookUrl: webhook.url,
      eventId,
      error: errorMessage,
      attempt,
    });
  }
};