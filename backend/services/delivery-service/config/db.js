import { connectPostgres } from "../../../shared/database/postgres.js";
import DeliveryLog from '../src/models/deliveryLog.model.js';

export const connectDB = async () => {
  await connectPostgres();
  // Sync the model
  await DeliveryLog.sync({ alter: true });
};
