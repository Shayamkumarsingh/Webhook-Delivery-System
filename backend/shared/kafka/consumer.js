import { Kafka } from "kafkajs";
import { sendMessage } from "./producer.js";
import { TOPICS } from "./topics.js";
import { logger } from "../utils/logger.js";

const kafka = new Kafka({
  clientId: "webhook-system",
  brokers: process.env.KAFKA_BROKER.split(","),
});

export const createConsumer = async (
  groupId,
  topic,
  handler
) => {
  const consumer = kafka.consumer({ groupId });

  try {
    await consumer.connect();

    logger.info(`Consumer Connected: ${groupId}`);

    await consumer.subscribe({
      topic,
      fromBeginning: false,
    });

    logger.info(
      `Subscribed to topic: ${topic}`
    );

    await consumer.run({
     eachMessage: async ({ message }) => {
  let data;  // ← hoist it
  try {
    data = JSON.parse(message.value.toString());
    await handler(data);
  } catch (err) {
    logger.error("Handler Error", err);
    if ((data?.retryCount || 0) < 3) {  

            logger.warn(
              `Retrying message (${(data.retryCount || 0) + 1}/3)`
            );

            await sendMessage(TOPICS.RETRY, {
              ...data,
              retryCount:
                (data.retryCount || 0) + 1,
            });

          } else {

            logger.error(
              "Max retries exceeded. Sending to DLQ"
            );

            // Dead Letter Queue
            await sendMessage(
              TOPICS.DLQ,
              data
            );
          }
        }
      },
    });

  } catch (err) {
    logger.error("Consumer Error", err);
  }

  // Graceful shutdown
  process.on("SIGINT", async () => {
    logger.info(
      `Disconnecting consumer: ${groupId}`
    );

    await consumer.disconnect();

    process.exit(0);
  });
};