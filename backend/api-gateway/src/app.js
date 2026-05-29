import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/routes.js";
import { limiter } from "./middleware/rateLimiter.js";
import { logger } from "../../shared/utils/logger.js";

dotenv.config();

const app = express();

app.use(helmet());

// ✅ Updated CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));



app.use(express.json());
app.use(morgan("combined"));
app.use(limiter);

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "api-gateway" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT, () => {
  logger.info(`API Gateway running on port ${process.env.PORT}`);
});