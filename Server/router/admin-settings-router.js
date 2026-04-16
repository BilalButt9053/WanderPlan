const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const { getSettings, updateSettings } = require('../controllers/admin-settings-controller');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
