const jwt = require("jsonwebtoken");

const businessAuthMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Token not provided" });
    }

    const jwtToken = token.replace("Bearer", "").trim();

    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
        
        // Check if this is a business token
        if (!isVerified.isBusiness) {
            return res.status(403).json({ message: "Access denied. Business authentication required" });
        }

        req.business = isVerified;
        req.token = token;
        req.businessId = isVerified.business_id;

        next();
    } catch (error) {
        console.error("Business auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized. Invalid token" });
    }
};

module.exports = businessAuthMiddleware;
