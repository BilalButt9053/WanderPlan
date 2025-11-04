// const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const SignUp = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    }
});



SignUp.pre('save', async function () {
    const user = this;

    // If password is not modified, move on
    if (!user.isModified('password')) return;

    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
});

    SignUp.methods.comparePassword = async function(password){
        return  bcrypt.compare(password,this.password);
    }

    SignUp.methods.generateToken =async function(){
    try {
        return jwt.sign({
            user_id:this._id.toString(),
            email:this.email,
            isAdmin:this.isAdmin,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:"30d"
        }
    );
    } catch (error) {
        console.log(error);
    }

};



const Signup = new mongoose.model('Signup',SignUp);

module.exports = Signup;