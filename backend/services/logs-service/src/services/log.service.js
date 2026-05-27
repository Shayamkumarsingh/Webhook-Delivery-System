import Log from "../models/log.model.js";

export const createLog = async (service, level, message, metadata = {}) => {
  return await Log.create({
    service,
    level,
    message,
    metadata,
  });
};

export const getLogs = async (filters = {}) => {
  const query = {};

  if (filters.service) {
    query.service = filters.service;
  }

  if (filters.level) {
    query.level = filters.level;
  }

  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) {
      query.timestamp.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.timestamp.$lte = new Date(filters.endDate);
    }
  }

  const logs = await Log.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 100);

  return logs;
};

export const getLogStats = async () => {
  const stats = await Log.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
      },
    },
  ]);

  return stats;
};
