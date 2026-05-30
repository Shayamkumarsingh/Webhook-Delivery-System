import dotenv from 'dotenv';
dotenv.config();



export const SERVICES = {
  AUTH: process.env.AUTH_SERVICE,
  WEBHOOK: process.env.WEBHOOK_SERVICE,
  EVENT: process.env.EVENT_SERVICE,
  DELIVERY: process.env.DELIVERY_SERVICE,
  RETRY: process.env.RETRY_SERVICE,
  DLQ: process.env.DLQ_SERVICE,
  NOTIFICATION: process.env.NOTIFICATION_SERVICE,
  RATE_LIMIT: process.env.RATE_LIMIT_SERVICE,
};

