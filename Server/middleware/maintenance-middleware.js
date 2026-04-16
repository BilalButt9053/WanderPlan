const AppSettings = require('../modals/app-settings-modal');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // Keep health checks and admin operations available during maintenance.
    if (
      req.path === '/api/health' ||
      req.path.startsWith('/api/admin') ||
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/otp')
    ) {
      return next();
    }

    const settings = await AppSettings.findOne({ key: 'global' }).lean();
    const maintenanceEnabled = settings?.maintenanceMode?.enabled;

    if (maintenanceEnabled) {
      return res.status(503).json({
        success: false,
        message: settings?.maintenanceMode?.message || 'Service temporarily unavailable due to maintenance',
        code: 'MAINTENANCE_MODE',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = maintenanceMiddleware;
