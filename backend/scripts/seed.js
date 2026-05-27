import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { sequelize } from "../shared/database/postgres.js";
import User from "../services/auth-service/src/models/user.model.js";
import { connectMongo } from "../shared/database/mongo.js";

dotenv.config();

const seedPostgres = async () => {
  try {
    console.log("Seeding PostgreSQL...");

    // Sync all models
    await sequelize.sync({ force: true });

    // Create a test user
    const hashedPassword = await bcrypt.hash("test123", 10);
    const user = await User.create({
      email: "test@example.com",
      password: hashedPassword,
      apiKey: "test-api-key-12345",
    });

    console.log("PostgreSQL seeded successfully");
    console.log("Test user created:", user.email);

  } catch (error) {
    console.error("Error seeding PostgreSQL:", error);
    throw error;
  }
};

const seedMongo = async () => {
  try {
    console.log("Seeding MongoDB...");

    await connectMongo();

    // MongoDB collections will be created automatically when needed
    console.log("MongoDB seeded successfully");

  } catch (error) {
    console.error("Error seeding MongoDB:", error);
    throw error;
  }
};

const seedAll = async () => {
  try {
    await seedPostgres();
    await seedMongo();
    console.log("All databases seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAll();
