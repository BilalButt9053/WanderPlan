const express=require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const   validator=require("../validators/auth-validator");
const validate = require("../middleware/validate-middleware");
const authControllers=require("../controllers/auth-controller");

router.route("/register").post(validate(validator.signup),authControllers.register);
router.route("/login").post(validate(validator.Login),authControllers.login);
router.route("/user").get(authMiddleware,authControllers.user);
router.route("/forgot-password").post(authControllers.forgotPassword);
router.route("/reset-password").post(authControllers.resetPassword);
router.route("/social-login").post(authControllers.socialLogin);

module.exports = router;