import { connectProducer } from "../../../../shared/kafka/producer.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";

export const publishEvent = async (event) => {
  try {
    const eventId = event._id?.toString() || event.id?.toString() || `evt_${Date.now()}`;
    await sendMessage(TOPICS.EVENTS, {
      _id: eventId,
      id: eventId,
      userId: event.userId?.toString(),
      email: event.email,
      eventType: event.eventType,
      payload: event.payload || {},
      createdAt: event.createdAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error("Publish Event Error:", err);
  }
};