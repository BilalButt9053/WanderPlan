const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountedPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        default: 'General'
    },
    images: [{
        url: String,
        publicId: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }],
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
MenuItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
MenuItemSchema.index({ business: 1, category: 1 });
MenuItemSchema.index({ business: 1, isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
