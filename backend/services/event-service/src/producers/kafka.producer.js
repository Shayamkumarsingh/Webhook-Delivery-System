import { connectProducer } from "../../../../shared/kafka/producer.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";

export const publishEvent = async (event) => {
  try {
    await sendMessage(TOPICS.EVENTS, {
      userId: event.userId,
      email: event.email,
      eventType: event.eventType,
      payload: event.payload,
    });
  } catch (err) {
    console.error("Publish Event Error:", err);
  }
};