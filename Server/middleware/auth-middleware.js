const jwt = require("jsonwebtoken");
const User = require("../modals/user-modals");

const authMiddleware =async (req,res,next) =>{
    const token = req.headers?.authorization;
    console.log("Received token:", token); // Debugging log
    if(!token) res.status(401).json({message:"Unauthorized HTTP , Token not provided 123"});
    
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
        res.status(401).json({message:"Unauthorized HTTP , Token not provideds",error:error.message});
    }

};

module.exports = authMiddleware;