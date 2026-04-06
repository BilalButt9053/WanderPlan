const express = require("express");
const admin_controller = require("../controllers/admin-controllers");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");

// Apply middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// User management routes
router.get('/users', admin_controller.getAllUser);
router.get('/users/list', admin_controller.getUsersList);
router.get('/users/:id', admin_controller.GetUserById);
router.get('/users/:id/details', admin_controller.getUserDetails);
router.delete('/users/delete/:id', admin_controller.deleteUserById);
router.patch('/users/update/:id', admin_controller.UpdateUserById);
router.put('/users/:id/block', admin_controller.blockUser);
router.put('/users/:id/unblock', admin_controller.unblockUser);
router.post('/make-admin', admin_controller.makeUserAdmin);

module.exports = router;