import express from "express";
import { createProxy } from "../services/proxy.js";
import { SERVICES } from "../../config/services.config.js";
import { verifyAuth } from "../middleware/auth.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();



// routes.js
router.use("/auth",      createProxy(SERVICES.AUTH,     "auth"));
router.use("/webhooks",  verifyAuth, createProxy(SERVICES.WEBHOOK,  "webhooks"));
router.use("/events",    verifyAuth, createProxy(SERVICES.EVENT,    "events"));
router.use("/delivery",  verifyAuth, createProxy(SERVICES.DELIVERY, "delivery"));


router.use("/retry", verifyAuth, createProxy(SERVICES.RETRY));
router.use("/dlq", verifyAuth, createProxy(SERVICES.DLQ));
router.use("/notifications", verifyAuth, createProxy(SERVICES.NOTIFICATION));
router.use("/rate-limit", verifyAuth, createProxy(SERVICES.RATE_LIMIT));

export default router;