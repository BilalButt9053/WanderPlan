const jwt = require("jsonwebtoken");
const User = require("../modals/user-modals");

// Optional auth: attaches user if token is present, but doesn't block request
const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) return next();
  
  try {
    const jwtToken = token.split(" ")[1];
    const isVerified = await jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userData = await User.findOne({ email: isVerified.email }).select({
      password: 0,
      confirmPassword: 0,
    });
    req.user = userData;
  } catch (error) {
    // Silent fail - continue without user
  }
  
  next();
};

module.exports = optionalAuthMiddleware;
