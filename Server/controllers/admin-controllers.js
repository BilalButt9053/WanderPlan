const User = require("../modals/user-modals");

const getAllUser = async (req, res, next) => {
    try {
        const user = await User.find();
        if (!user || user === 0) {
            res.status(200).json({ message: "No User Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

const deleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.deleteOne({ _id: id });

        if (!user) {
            res.status(200).json({ message: "User Not Found" });
        }
        res.status(200).json({ message: "Deleted Successfull" });
    } catch (error) {
        next(error);
    }
}

const GetUserById =async (req,res,next)=>{
    try{
        const id = req.params.id;
        const data = await User.findOne({_id:id},{password:0});
        res.status(200).json(data);
    }catch(error){
        next(error)
    }

}

const UpdateUserById = async (req,res,next)=>{
    try {
        console.log("called")
        const id=req.params.id;
        const data = req.body;
        const updatedData =await User.findOneAndUpdate(
            {_id:id},
            {$set:data}
        )
        if(updatedData.nModfied === 0){
            res.status(200).json({message:"User Not Found or data isthe same as before"})
        }
        res.status(200).json(updatedData);
        console.log("updatedData",updatedData)
    } catch (error) {
        console.log("error=>",error)
        next(error);
    }
}

const makeUserAdmin = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.isAdmin = true;
        await user.save();
        
        res.status(200).json({ 
            message: "User successfully granted admin privileges",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.log("error=>", error);
        next(error);
    }
};

module.exports = { getAllUser,  deleteUserById,GetUserById,UpdateUserById,makeUserAdmin};
