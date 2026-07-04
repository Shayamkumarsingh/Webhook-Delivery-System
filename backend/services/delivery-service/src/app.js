import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "../config/db.js";
import { startConsumer } from "./consumers/kafka.consumer.js";
import { logger } from  "../../../shared/index.js";
import { connectProducer } from "../../../shared/kafka/producer.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import { errorHandler } from "../../../shared/utils/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "delivery-service" });
});

app.use("/api/delivery", deliveryRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    await connectProducer();
    await startConsumer();

    app.listen(process.env.PORT, () => {
      logger.info(`Delivery Service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Delivery Service failed", err);
    process.exit(1);
  }
};

start();