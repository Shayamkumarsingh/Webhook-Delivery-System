import DLQEvent from "../models/dlq.model.js";
import { sendMessage } from "../../../../shared/kafka/producer.js";
import { TOPICS } from "../../../../shared/kafka/topics.js";
import { logger } from "../../../../shared/utils/logger.js";
import { publishLog } from "../../../../shared/utils/logPublisher.js";

export const saveToDLQ = async (data) => {
  const result = await DLQEvent.create(data);

  
  await publishLog("dlq-service", "error", "Event moved to DLQ", {
    eventId: data.event?._id,
    webhookId: data.webhook?._id,
    attempt: data.attempt,
  });

  return result;
};

export const getAllDLQ = async () => {
  return await DLQEvent.find().sort({ createdAt: -1 });
};

export const retryFromDLQ = async (id) => {
  const item = await DLQEvent.findById(id);
  if (!item) throw new Error("DLQ item not found");

  logger.info(`Retrying DLQ item ${id}`);

  await publishLog("dlq-service", "info", "Retrying DLQ item", {
    id,
    eventId: item.event?._id,
    webhookId: item.webhook?._id,
  });

  await sendMessage(TOPICS.EVENTS, {
    ...item.event,
    retryAttempt: 1,
  });

  await DLQEvent.findByIdAndDelete(id);

  return { success: true };
};

export const deleteDLQ = async (id) => {
  return await DLQEvent.findByIdAndDelete(id);
};