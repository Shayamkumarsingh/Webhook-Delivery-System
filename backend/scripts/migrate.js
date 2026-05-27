import dotenv from "dotenv";
import { sequelize } from "../shared/database/postgres.js";
import User from "../services/auth-service/src/models/user.model.js";
import Webhook from "../services/webhook-service/src/models/webhook.model.js";
import DeliveryLog from "../services/delivery-service/src/models/deliveryLog.model.js";
import { connectMongo } from "../shared/database/mongo.js";

dotenv.config();

const migratePostgres = async () => {
  try {
    console.log("Migrating PostgreSQL schemas...");

    // Sync all models without force to preserve data
    await User.sync({ alter: true });
    await Webhook.sync({ alter: true });
    await DeliveryLog.sync({ alter: true });

    console.log("PostgreSQL migrations completed successfully");

  } catch (error) {
    console.error("Error migrating PostgreSQL:", error);
    throw error;
  }
};

const migrateMongo = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectMongo();

    console.log("MongoDB connection successful");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

const migrateAll = async () => {
  try {
    await migratePostgres();
    await migrateMongo();
    console.log("All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateAll();
