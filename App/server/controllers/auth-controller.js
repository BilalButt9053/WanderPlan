const Signup = require("../modals/user-modals");
const register = async(req,res,next)=>{
    try{
        console.log(req.body);
        const {fullName,email,password}=req.body
       
       const userExist =await Signup.findOne({email });

       if(userExist){
        res.status(400).json({message:"email already exists"});
       }
       const UserCreated =await Signup.create({
        fullName,
        email,
        password
        });
       res.status(200).json({
        msg:"registration successful",
        token:await UserCreated.generateToken(),
        userId:UserCreated._id>toString(),
    });
    }catch(error){
        // res.status(500).json("internal server error", error);
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        console.log("login", req.body);
        
        const { email, password } = req.body;
        
        // Check if the user exists
        const userExist = await Signup.findOne({ email });
        console.log("userExist", userExist);

        if (!userExist) {
            // User does not exist, send error response
            return res.status(400).json({ message: "Invalid Credential" });
        }

        // Check if the password matches
        const match = await userExist.comparePassword(password);
        console.log("match", match);

        if (match) {
            // Password matches, send success response
            return res.status(200).json({
                msg: "Login successful",
                token: await userExist.generateToken(),
                userId: userExist._id.toString(),
            });
        } else {
            // Password does not match, send error response
            return res.status(400).json({ message: "Invalid Credential" });
        }

    } catch (error) {
        // Catch any other errors and send a 500 response
        res.status(500).json("internal server error");
        next(error); // Make sure this is the last thing called in the catch block
    }
};


const user = async (req, res,next) => {
    try {
        const userData = req.user;
        res.status(200).json({ userData });
    } catch (error) {
        // console.log(`error from the user route ${error}`);
        // res.status(500).json({ message: "Internal server error" });
        next(error)
    }
};

module.exports={register,login,user}; 
