const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BusinessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,
        default: ''
    },
    businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'tour', 'activity', 'transport', 'other'],
        default: 'other'
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: null
    },
    documents: [{
        type: {
            type: String,
            enum: ['license', 'permit', 'certificate', 'other']
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        isActive: {
            type: Boolean,
            default: true
        }
    },
    settings: {
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
BusinessSchema.pre('save', async function(next) {
    const business = this;
    
    if (!business.isModified('password')) {
        return next();
    }
    
    try {
        const saltRound = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(business.password, saltRound);
        business.password = hash_password;
        next();
    } catch (error) {
        next(error);
    }
});

// Update timestamp on save
BusinessSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Compare password method
BusinessSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Generate JWT token
BusinessSchema.methods.generateToken = async function() {
    try {
        return jwt.sign({
            business_id: this._id.toString(),
            email: this.email,
            businessName: this.businessName,
            status: this.status,
            isBusiness: true
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "30d"
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;
