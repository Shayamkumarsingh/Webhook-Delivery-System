import Webhook from "../models/webhook.model.js";
import crypto from "crypto";

export const createWebhook = async (userId, data) => {
  const secret = crypto.randomBytes(16).toString("hex");

  return await Webhook.create({
    ...data,
    userId,
    secret,
  });
};

export const getWebhooks = async (userId, eventType) => {
  const whereClause = {
    userId,
    isActive: true,
  };

  if (eventType) {
    whereClause.eventType = eventType;
  }

  return await Webhook.findAll({ where: whereClause });
};

export const deleteWebhook = async (id, userId) => {
  return await Webhook.destroy({
    where: {
      id,
      userId,
    },
  });
};

export const getWebhookById = async (id) => {
  return await Webhook.findByPk(id);
};

export const updateWebhook = async (id, userId, data) => {
  const webhook = await Webhook.findOne({
    where: {
      id,
      userId,
    },
  });

  if (!webhook) {
    throw { status: 404, message: "Webhook not found" };
  }

  return await webhook.update(data);
};
