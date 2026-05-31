import { sendMessage } from "../kafka/producer.js";
import { TOPICS } from "../kafka/topics.js";

export const publishLog = async (service, level, logMessage, metadata = {}) => {
  try {
    await sendMessage(TOPICS.LOGS, {
      service,
      level,
      logMessage,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Never let logging break the main flow
    console.error("Failed to publish log:", err.message);
  }
};