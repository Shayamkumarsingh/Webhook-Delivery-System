import express from "express";
import { createProxy } from "../services/proxy.js";
import { SERVICES } from "../../config/services.config.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();



router.use("/auth", createProxy(SERVICES.AUTH));


router.use("/webhooks", verifyAuth, createProxy(SERVICES.WEBHOOK));
router.use("/events", verifyAuth, createProxy(SERVICES.EVENT));


router.use("/delivery", verifyAuth, createProxy(SERVICES.DELIVERY));
router.use("/retry", verifyAuth, createProxy(SERVICES.RETRY));
router.use("/dlq", verifyAuth, createProxy(SERVICES.DLQ));
router.use("/notifications", verifyAuth, createProxy(SERVICES.NOTIFICATION));
router.use("/rate-limit", verifyAuth, createProxy(SERVICES.RATE_LIMIT));

export default router;