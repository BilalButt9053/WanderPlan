const mongoose = require("mongoose");

const DealSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['deal', 'ad'],
        default: 'deal'
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'bogo', 'freeItem'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        default: 0
    },
    // For linking to specific menu items
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }],
    // Deal image/banner
    image: {
        url: String,
        publicId: String
    },
    // Validity
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Terms and conditions
    terms: {
        type: String,
        default: ''
    },
    // Usage limits
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    // Deal code for redemption
    code: {
        type: String,
        default: null
    },
    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'scheduled', 'expired', 'paused'],
        default: 'draft'
    },
    // Is featured/promoted
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Analytics
    analytics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        redemptions: { type: Number, default: 0 }
    },
    // For ads - target audience
    targetAudience: {
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 65 }
        },
        interests: [String],
        location: String
    },
    // Ad budget (for ads type)
    budget: {
        daily: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        spent: { type: Number, default: 0 }
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

// Update timestamp on save
DealSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Auto-update status based on dates
    const now = new Date();
    if (this.status !== 'draft' && this.status !== 'paused') {
        if (now < this.startDate) {
            this.status = 'scheduled';
        } else if (now > this.endDate) {
            this.status = 'expired';
        } else {
            this.status = 'active';
        }
    }
    
    next();
});

// Index for faster queries
DealSchema.index({ business: 1, status: 1 });
DealSchema.index({ business: 1, type: 1 });
DealSchema.index({ startDate: 1, endDate: 1 });

const Deal = mongoose.model('Deal', DealSchema);

module.exports = Deal;
