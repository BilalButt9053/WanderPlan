const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const { createComplaint, getMyComplaints } = require('../controllers/complaint-controller');

router.use(authMiddleware);

router.post('/', createComplaint);
router.get('/', getMyComplaints);

module.exports = router;
