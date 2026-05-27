import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 20,
    idle: 30000,
  },
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection failed");
    process.exit(1);
  }
};

export default sequelize;
