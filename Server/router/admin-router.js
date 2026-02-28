const express = require("express");
const admin_controller = require("../controllers/admin-controllers");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware=require("../middleware/admin-middleware")


router.route('/users').get(authMiddleware,adminMiddleware,admin_controller.getAllUser);
router.route('/users/delete/:id').delete(authMiddleware,adminMiddleware,admin_controller.deleteUserById);
router.route('/users/:id').get(authMiddleware,adminMiddleware,admin_controller.GetUserById);
router.route('/users/update/:id').patch(authMiddleware,adminMiddleware,admin_controller.UpdateUserById);
router.route('/make-admin').post(authMiddleware,adminMiddleware,admin_controller.makeUserAdmin);

module.exports = router;