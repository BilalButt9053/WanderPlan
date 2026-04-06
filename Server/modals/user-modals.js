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
    profilePhoto: {
        type: String,
        default: null
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedAt: {
        type: Date,
        default: null
    },
    blockReason: {
        type: String,
        default: null
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    socialLogins: [{
        provider: {
            type: String,
            enum: ['google', 'facebook'],
        },
        providerId: {
            type: String,
        },
        connectedAt: {
            type: Date,
            default: Date.now
        }
    }]
    ,
    // Gamification / contributor profile (used by Rewards/Profile screens)
    contribution: {
        points: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ type: String, trim: true }],
        lastAwardedAt: { type: Date, default: null }
    },
    // Notification preferences
    notificationPreferences: {
        pushNotifications: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: false },
        reviewNotifications: { type: Boolean, default: true },
        tripReminders: { type: Boolean, default: true }
    },
    // Privacy settings
    privacySettings: {
        showLocation: { type: Boolean, default: true },
        showTrips: { type: Boolean, default: true },
        showReviews: { type: Boolean, default: true }
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

    SignUp.methods.jwtToken =async function(){
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