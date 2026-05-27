import { connectPostgres, sequelize } from "./postgres.js";
import User from '../src/models/user.model.js';

export const connectDB = async () => {
  await connectPostgres();
  // Sync the model
  await User.sync({ alter: true });
};
