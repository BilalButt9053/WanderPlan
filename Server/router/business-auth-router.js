const express = require("express");
const router = express.Router();
const businessAuthMiddleware = require("../middleware/business-auth-middleware");
const businessAuthController = require("../controllers/business-auth-controller");

router.route("/register").post(businessAuthController.registerBusiness);
router.route("/check-email").get(businessAuthController.checkBusinessEmail);
router.route("/check-email").post(businessAuthController.checkBusinessEmail);
router.route("/login").post(businessAuthController.loginBusiness);
router.route("/verify-email").post(businessAuthController.verifyBusinessEmail);
router.route("/resend-otp").post(businessAuthController.resendBusinessOTP);
router.route("/appeal").post(businessAuthMiddleware, businessAuthController.submitAppeal);
router.route("/profile").get(businessAuthMiddleware, businessAuthController.getBusinessProfile);
router.route("/profile").put(businessAuthMiddleware, businessAuthController.updateBusinessProfile);
router.route("/change-password").post(businessAuthMiddleware, businessAuthController.changePassword);
router.route("/settings/notifications").put(businessAuthMiddleware, businessAuthController.updateNotificationSettings);

module.exports = router;
