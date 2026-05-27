import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import logRoutes from "./routes/log.routes.js";
import { logger } from "shared";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

app.use("/logs", logRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "logs-service" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Logs Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start logs service:", error);
    process.exit(1);
  }
};

startServer();
