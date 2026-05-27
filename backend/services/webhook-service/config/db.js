import { connectPostgres } from "../../../shared/database/postgres.js";
import Webhook from '../src/models/webhook.model.js';

export const connectDB = async () => {
  await connectPostgres();
  // Sync the model
  await Webhook.sync({ alter: true });
};
