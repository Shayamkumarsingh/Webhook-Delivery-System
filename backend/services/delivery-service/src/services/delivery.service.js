import client from "../utils/httpClient.js";
import DeliveryLog from "../models/deliveryLog.model.js";
import { generateSignature } from "./signature.service.js";
import {  sendMessage } from "../../../../shared/kafka/producer.js";
import {  TOPICS } from "../../../../shared/kafka/topics.js";
import { logger } from "../../../../shared/utils/logger.js";

import { connectProducer } from "../../../../shared/kafka/producer.js";

await connectProducer();

export const deliveryEvent = async (event, webhook) => {
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
      eventId: event.userId || "unknown",
      webhookUrl: webhook.url,
      status: "success",
      response: response.data,
      attempt: 1,
    });

    logger.info("webhook delivered successfully");

  } catch (err) {
     logger.error("Delivery failed: " + err.message);

    // Create delivery log for failed attempt
    await DeliveryLog.create({
      eventId: event.id || event._id?.toString(),
      webhookUrl: webhook.url,
      status: "failed",
      response: { error: err.message },
      attempt: 1,
    });

    // send to retry topic
    await sendMessage(TOPICS.RETRY, {
      event,
      webhook,
      attempt: 1,
    });
  }
};
