import express from "express";
import { createProxy } from "../services/proxy.js";
import { SERVICES } from "../../config/services.config.js";
import { verifyAuth } from "../middleware/auth.middleware.js";
import dotenv from "dotenv";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";

dotenv.config();

const router = express.Router();

router.use("/auth", createProxy(SERVICES.AUTH, "auth"));
router.use("/webhooks", verifyAuth, rateLimitMiddleware, createProxy(SERVICES.WEBHOOK, "webhooks"));
router.use("/events", verifyAuth, rateLimitMiddleware, createProxy(SERVICES.EVENT, "events"));
router.use("/delivery", verifyAuth, createProxy(SERVICES.DELIVERY, "delivery"));
router.use("/retry", verifyAuth, createProxy(SERVICES.RETRY, "retry"));
router.use("/dlq", verifyAuth, createProxy(SERVICES.DLQ, "dlq"));
router.use("/notifications", verifyAuth, createProxy(SERVICES.NOTIFICATION, "notifications"));
router.use("/logs", verifyAuth, createProxy(SERVICES.LOGS, "logs"));
router.use("/rate-limit", verifyAuth, createProxy(SERVICES.RATE_LIMIT, "rate-limit"));

export default router;