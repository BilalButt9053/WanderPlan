const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');

const {
  adminListComplaints,
  adminUpdateComplaint,
} = require('../controllers/complaint-controller');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', adminListComplaints);
router.patch('/:id', adminUpdateComplaint);

module.exports = router;

