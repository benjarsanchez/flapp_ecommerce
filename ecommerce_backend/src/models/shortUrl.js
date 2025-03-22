import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import { nanoid } from 'nanoid';

const ShortUrl = db.define('ShortUrl', {
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortCode: {
    type: DataTypes.STRING(8),
    unique: true,
    defaultValue: () => nanoid(6)
  },
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default ShortUrl;