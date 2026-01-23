const express = require("express");
const router = express.Router();
const businessAuthMiddleware = require("../middleware/business-auth-middleware");
const businessAuthController = require("../controllers/business-auth-controller");

router.route("/register").post(businessAuthController.registerBusiness);
router.route("/login").post(businessAuthController.loginBusiness);
router.route("/verify-email").post(businessAuthController.verifyBusinessEmail);
router.route("/profile").get(businessAuthMiddleware, businessAuthController.getBusinessProfile);
router.route("/profile").put(businessAuthMiddleware, businessAuthController.updateBusinessProfile);

module.exports = router;
