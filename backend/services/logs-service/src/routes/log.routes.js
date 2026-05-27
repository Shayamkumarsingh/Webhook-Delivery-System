import express from "express";
import {
  createLogController,
  getLogsController,
  getLogStatsController,
} from "../controllers/log.controller.js";

const router = express.Router();

router.post("/", createLogController);
router.get("/", getLogsController);
router.get("/stats", getLogStatsController);

export default router;
