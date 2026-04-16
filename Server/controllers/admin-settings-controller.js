const AppSettings = require('../modals/app-settings-modal');

const getOrCreateSettings = async () => {
  let settings = await AppSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await AppSettings.create({ key: 'global' });
  }
  return settings;
};

const getSettings = async (_req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const allowed = {};

    if (payload.regional) allowed.regional = payload.regional;
    if (payload.maintenanceMode) allowed.maintenanceMode = payload.maintenanceMode;
    if (payload.notifications) allowed.notifications = payload.notifications;

    const updated = await AppSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: allowed, $setOnInsert: { key: 'global' } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Settings updated', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
