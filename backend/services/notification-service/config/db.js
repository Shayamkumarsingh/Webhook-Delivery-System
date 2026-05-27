import { connectMongo } from "shared";
import UserCache from '../src/models/userCache.model.js';

export const connectDB = async () => {
  await connectMongo();
  // Sync the model
  await UserCache.sync();
};
