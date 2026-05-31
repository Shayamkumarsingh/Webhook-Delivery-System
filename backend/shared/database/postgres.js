import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // needed for Neon
    }
  },
  pool: {
    max: 20,
    idle: 30000,
  },
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connected");
  } catch (err) {
    logger.error("PostgreSQL connection failed", err);
    process.exit(1);
  }
};

export default sequelize;