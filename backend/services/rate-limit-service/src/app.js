import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkRateLimit, resetRateLimit } from "./services/rateLimit.service.js";
import { logger } from "../../../shared/utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5009;

app.use(cors());
app.use(express.json());

app.post("/check", async (req, res) => {
  try {
    const { identifier, options } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Identifier is required" });
    }

    const result = await checkRateLimit(identifier, options);
    res.json(result);
  } catch (error) {
    logger.error("Rate limit check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reset", (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Identifier is required" });
    }

    resetRateLimit(identifier);
    res.json({ message: "Rate limit reset successfully" });
  } catch (error) {
    logger.error("Rate limit reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "rate-limit-service" });
});

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Rate Limit Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start rate limit service:", error);
    process.exit(1);
  }
};

startServer();