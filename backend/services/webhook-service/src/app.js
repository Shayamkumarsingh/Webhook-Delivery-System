import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import webhookRoutes from "./routes/webhook.routes.js";
import { connectDB } from "../config/db.js";
import { logger } from  "../../../shared/index.js";
import { errorHandler } from "../../../shared/utils/errorHandler.js";
import { connectProducer } from "../../../shared/kafka/producer.js";



const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "webhook-service" });
});

app.use("/api/webhooks", webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await connectProducer();

    app.listen(process.env.PORT, () => {
      logger.info(`Webhook Service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start Webhook Service", err);
    process.exit(1);
  }
};

startServer();
