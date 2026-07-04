import express from "express";
import { getLogs, getStats, getLogById } from "../controllers/delivery.controller.js";

const router = express.Router();

router.get("/stats", getStats);   // must be before /:id
router.get("/", getLogs);
router.get("/:id", getLogById);

export default router;