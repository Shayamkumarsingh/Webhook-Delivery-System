import { DataTypes } from 'sequelize';
import { sequelize } from '../../../../shared/database/postgres.js';

const Webhook = sequelize.define('Webhook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'webhooks',
});

export default Webhook;
