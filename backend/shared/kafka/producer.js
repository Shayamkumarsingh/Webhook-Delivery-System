import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "webhook-system",
  brokers: process.env.KAFKA_BROKER.split(","), // supports multiple brokers
});

const producer = kafka.producer();

export const connectProducer = async () => {
  try {
    await producer.connect();
    console.log(" Kafka Producer Connected");
  } catch (err) {
    console.error(" Producer Connection Error:", err);
  }
};

export const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log(" Kafka Producer Disconnected");
  } catch (err) {
    console.error(" Producer Disconnect Error:", err);
  }
};

export const sendMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: message.webhookId || null, // helps partitioning
          value: JSON.stringify({
            ...message,
            retryCount: message.retryCount || 0,
          }),
        },
      ],
    });
  } catch (err) {
    console.error(" Kafka Send Error:", err);
  }
};