const jwt = require("jsonwebtoken");
const User = require("../modals/user-modals");

const authMiddleware =async (req,res,next) =>{
    const token = req.headers?.authorization;
    if(!token) {
        return res.status(401).json({message:"Unauthorized HTTP, Token not provided"});
    }

    const jwtToken = token.split(" ")[1];
    try {
        const isVerified =await jwt.verify(jwtToken,process.env.JWT_SECRET_KEY);
        const userData = await User.findOne({email:isVerified.email})
        .select({
            password:0,
            confirmPassword:0,
        })

        req.user=userData;


        next();
    } catch (error) {
        return res.status(401).json({message:"Unauthorized HTTP, Invalid token",error:error.message});
    }

};

module.exports = authMiddleware;