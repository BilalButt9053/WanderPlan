const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const {
  createComplaint,
  getMyComplaints,
} = require('../controllers/complaint-controller');

// Tourist routes
router.post('/', authMiddleware, createComplaint);
router.get('/', authMiddleware, getMyComplaints);

module.exports = router;

