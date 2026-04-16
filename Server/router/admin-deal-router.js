const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const { getAdminDeals } = require('../controllers/admin-deal-controller');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/deals', getAdminDeals);

module.exports = router;
