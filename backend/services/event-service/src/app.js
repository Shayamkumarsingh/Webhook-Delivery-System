import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import eventRoutes from "./routes/event.routes.js";
import {connectDB} from "../config/db.js";
import { metricsMiddleware } from "../../../shared/middleware/metrics.middleware.js";
import { register } from "../../../shared/utils/metrics.js";
import { logger } from "../../../shared/utils/logger.js";
import { errorHandler } from "../../../shared/utils/errorHandler.js";
import { connectProducer } from "../../../shared/kafka/producer.js";

dotenv.config();

const app = express();  // ← must be FIRST before any app.use()

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));
app.use(metricsMiddleware);

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "event-service" });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/events", eventRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await connectProducer();
    app.listen(process.env.PORT, () => {
      logger.info(`Event Service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start Event Service", err);
    process.exit(1);
  }
};

startServer();