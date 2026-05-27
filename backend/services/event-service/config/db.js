import { connectMongo } from "shared";

export const connectDB = async () => {
  await connectMongo();
};