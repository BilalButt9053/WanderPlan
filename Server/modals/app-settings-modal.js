const mongoose = require('mongoose');

const AppSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    regional: {
      timezone: { type: String, default: 'utc' },
      currency: { type: String, default: 'usd' },
      language: { type: String, default: 'en' },
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'The platform is under maintenance. Please try again shortly.',
      },
    },
    notifications: {
      realtimePollingSeconds: { type: Number, default: 15, min: 5, max: 120 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppSettings', AppSettingsSchema);
