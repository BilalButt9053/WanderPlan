const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const adminBusinessController = require("../controllers/admin-business-controller");

// Get all businesses (with optional status filter)
router.route('/businesses').get(authMiddleware, adminMiddleware, adminBusinessController.getAllBusinesses);

// Get business statistics
router.route('/businesses/stats').get(authMiddleware, adminMiddleware, adminBusinessController.getBusinessStats);

// Get single business
router.route('/businesses/:id').get(authMiddleware, adminMiddleware, adminBusinessController.getBusinessById);

// Approve business
router.route('/businesses/:id/approve').post(authMiddleware, adminMiddleware, adminBusinessController.approveBusiness);

// Reject business
router.route('/businesses/:id/reject').post(authMiddleware, adminMiddleware, adminBusinessController.rejectBusiness);

// Suspend business
router.route('/businesses/:id/suspend').post(authMiddleware, adminMiddleware, adminBusinessController.suspendBusiness);

// Update business
router.route('/businesses/:id').patch(authMiddleware, adminMiddleware, adminBusinessController.updateBusiness);

// Delete business
router.route('/businesses/:id').delete(authMiddleware, adminMiddleware, adminBusinessController.deleteBusiness);

module.exports = router;
