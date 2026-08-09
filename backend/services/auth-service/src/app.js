import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "../config/db.js";
import { logger } from  "../../../shared/index.js";
import { errorHandler } from "../../../shared/utils/errorHandler.js";
import { connectProducer } from "../../../shared/kafka/producer.js";



const app = express();


app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));


app.use(express.json());


app.use(morgan("combined"));


app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "auth-service" });
});


app.use("/api/auth", authRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await connectProducer();

    app.listen(process.env.PORT, () => {
      logger.info(`Auth Service running on port ${process.env.PORT}`);
    });

  } catch (error) {
    logger.error("Failed to start Auth Service", error);
    process.exit(1);
  }
};

startServer();
