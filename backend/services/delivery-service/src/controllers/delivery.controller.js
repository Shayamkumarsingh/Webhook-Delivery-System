import DeliveryLog from "../models/deliveryLog.model.js";
import { Op } from "sequelize";

export const getLogs = async (req, res, next) => {
  try {
    const { webhookUrl, status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (webhookUrl) where.webhookUrl = { [Op.iLike]: `%${webhookUrl}%` };
    if (status) where.status = status;

    const { count, rows } = await DeliveryLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({ success: true, total: count, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const total = await DeliveryLog.count();
    const success = await DeliveryLog.count({ where: { status: "success" } });
    const failed = await DeliveryLog.count({ where: { status: "failed" } });

    res.status(200).json({
      success: true,
      data: {
        total,
        success,
        failed,
        successRate: total ? Math.round((success / total) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLogById = async (req, res, next) => {
  try {
    const log = await DeliveryLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};