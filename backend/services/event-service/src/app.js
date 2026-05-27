import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import eventRoutes from "./routes/event.routes.js";
import { connectDB } from "../config/db.js";
import { logger, errorHandler } from "shared";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "event-service" });
});

app.use("/api/events", eventRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT, () => {
      logger.info(`Event Service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start Event Service", err);
    process.exit(1);
  }
};

startServer();