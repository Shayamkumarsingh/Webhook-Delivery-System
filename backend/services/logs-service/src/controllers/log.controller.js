import { createLog, getLogs, getLogStats } from "../services/log.service.js";

export const createLogController = async (req, res) => {
  try {
    const { service, level, message, metadata } = req.body;

    const log = await createLog(service, level, message, metadata);

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLogsController = async (req, res) => {
  try {
    const filters = {
      service: req.query.service,
      level: req.query.level,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const logs = await getLogs(filters);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLogStatsController = async (req, res) => {
  try {
    const stats = await getLogStats();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
