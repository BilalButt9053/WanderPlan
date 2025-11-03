const adminMiddleware = async (req,res,next)=>{
    try {
        const adminRole = req.user.isAdmin;
        if(!adminRole){
            res.status(403).json({message:"Access deined . User is not a admin ."})
        }
        // console.log("req.user=>",req.user.isAdmin);
        next();
    } catch (error) {
        next(error);
    }

}
module.exports = adminMiddleware;