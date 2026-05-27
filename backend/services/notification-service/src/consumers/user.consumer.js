import { createConsumer, TOPICS, logger } from "shared";
import UserCache from "../models/userCache.model.js";

export const startUserConsumer = async () => {
  await createConsumer("user-group", TOPICS.USER, async (message) => {
    try {
      const { userId, email, type } = message;

      //  UPSERT (create or update)
      await UserCache.findOneAndUpdate(
        { userId },
        { email },
        { upsert: true, new: true }
      );

      logger.info(`User cache updated: ${userId}`);

    } catch (err) {
      logger.error("User consumer failed", err);
    }
  });
};