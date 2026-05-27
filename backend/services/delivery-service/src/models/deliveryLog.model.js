import { DataTypes } from 'sequelize';
import { sequelize } from '../../../../shared/database/postgres.js';

const DeliveryLog = sequelize.define('DeliveryLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  eventId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  response: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  attempt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  tableName: 'delivery_logs',
});

export default DeliveryLog;
