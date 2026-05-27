import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import {  connectDB} from "../config/db.js";
import dlqRoutes from "./routes/dlq.routes.js";
import { logger, errorHandler } from "shared";
import { startDLQConsumer } from "./consumers/dlq.kafka.consumer.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health
app.get("/health", (req, res) => {
  res.json({ status: "DLQ Service OK" });
});

// Routes (via API Gateway)
app.use("/api/dlq", dlqRoutes);

// Error handler
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    await startDLQConsumer();

    app.listen(process.env.PORT, () => {
      logger.info(`DLQ Service running on port ${process.env.PORT}`);
    });

  } catch (err) {
    logger.error("DLQ Service failed", err);
    process.exit(1);
  }
};

start();