const mongoose = require("mongoose");

/**
 * Budget Breakdown Schema - Embedded document for budget allocation
 * Stores both the calculated amounts and percentages for flexibility
 */
const BudgetBreakdownSchema = new mongoose.Schema({
    accommodation: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 40 },
        spent: { type: Number, default: 0 }
    },
    food: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 25 },
        spent: { type: Number, default: 0 }
    },
    transport: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 20 },
        spent: { type: Number, default: 0 }
    },
    activities: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 15 },
        spent: { type: Number, default: 0 }
    }
}, { _id: false });

/**
 * Trip Schema - Main trip planning document
 * Designed for integration with external APIs (Google Places, Maps)
 */
const TripSchema = new mongoose.Schema({
    // Reference to user who created the trip
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup',
        required: true,
        index: true
    },

    // Basic trip information
    title: {
        type: String,
        required: [true, 'Trip title is required'],
        trim: true,
        minlength: [3, 'Trip title must be at least 3 characters'],
        maxlength: [100, 'Trip title cannot exceed 100 characters']
    },

    // Destination information - structured for Google Places API integration
    destination: {
        name: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true
        },
        // Google Place ID for future API integration
        placeId: {
            type: String,
            default: null
        },
        // Coordinates for Maps API integration
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        // Additional location details
        country: { type: String, default: null },
        state: { type: String, default: null },
        formattedAddress: { type: String, default: null }
    },

    // Trip dates
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function(value) {
                return value >= this.startDate;
            },
            message: 'End date must be on or after start date'
        }
    },

    // Budget information
    totalBudget: {
        type: Number,
        required: [true, 'Total budget is required'],
        min: [1, 'Budget must be greater than 0']
    },
    currency: {
        type: String,
        default: 'PKR',
        uppercase: true,
        trim: true
    },

    // Calculated budget breakdown (auto-populated by service)
    budgetBreakdown: {
        type: BudgetBreakdownSchema,
        default: () => ({})
    },

    // Tracking spent amounts
    totalSpent: {
        type: Number,
        default: 0
    },

    // Number of travelers
    travelers: {
        type: Number,
        required: [true, 'Number of travelers is required'],
        min: [1, 'At least 1 traveler is required'],
        max: [50, 'Maximum 50 travelers allowed']
    },

    // Trip description/notes
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },

    // Trip status
    status: {
        type: String,
        enum: ['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'planning'
    },

    // Cover image for the trip
    coverImage: {
        url: { type: String, default: null },
        publicId: { type: String, default: null }
    },

    // Tags for categorization
    tags: [{
        type: String,
        trim: true
    }],

    // Trip type/category
    tripType: {
        type: String,
        enum: ['leisure', 'business', 'adventure', 'family', 'solo', 'honeymoon', 'group', 'other'],
        default: 'leisure'
    },

    // Privacy setting
    isPublic: {
        type: Boolean,
        default: false
    },

    // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== VIRTUALS ====================

/**
 * Virtual: Calculate remaining budget
 */
TripSchema.virtual('remainingBudget').get(function() {
    return this.totalBudget - this.totalSpent;
});

/**
 * Virtual: Calculate trip duration in days
 */
TripSchema.virtual('durationDays').get(function() {
    if (!this.startDate || !this.endDate) return 0;
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
});

/**
 * Virtual: Budget per person
 */
TripSchema.virtual('budgetPerPerson').get(function() {
    return this.travelers > 0 ? Math.round(this.totalBudget / this.travelers) : 0;
});

/**
 * Virtual: Budget per day
 */
TripSchema.virtual('budgetPerDay').get(function() {
    const days = this.durationDays;
    return days > 0 ? Math.round(this.totalBudget / days) : 0;
});

/**
 * Virtual: Days until trip starts
 */
TripSchema.virtual('daysUntilTrip').get(function() {
    if (!this.startDate) return null;
    const now = new Date();
    const diffTime = this.startDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ==================== INDEXES ====================

// Compound index for efficient user trip queries
TripSchema.index({ userId: 1, isDeleted: 1, status: 1 });
TripSchema.index({ userId: 1, startDate: -1 });
TripSchema.index({ 'destination.placeId': 1 });

// ==================== METHODS ====================

/**
 * Update spent amount for a category
 * @param {string} category - Budget category (accommodation, food, transport, activities)
 * @param {number} amount - Amount to add to spent
 */
TripSchema.methods.addExpense = function(category, amount) {
    const validCategories = ['accommodation', 'food', 'transport', 'activities'];
    if (!validCategories.includes(category)) {
        throw new Error(`Invalid category: ${category}`);
    }
    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }
    
    this.budgetBreakdown[category].spent += amount;
    this.totalSpent += amount;
    return this.save();
};

/**
 * Update trip status based on dates
 */
TripSchema.methods.updateStatus = function() {
    const now = new Date();
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    if (this.status === 'cancelled') return this;
    
    if (now < startDate) {
        this.status = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
        this.status = 'ongoing';
    } else if (now > endDate) {
        this.status = 'completed';
    }
    
    return this;
};

// ==================== STATICS ====================

/**
 * Find all active trips for a user
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options (limit, skip, sort)
 */
TripSchema.statics.findUserTrips = function(userId, options = {}) {
    const { limit = 20, skip = 0, sort = { startDate: -1 } } = options;
    
    return this.find({ 
        userId, 
        isDeleted: false 
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * Find upcoming trips for a user
 * @param {ObjectId} userId - User ID
 */
TripSchema.statics.findUpcomingTrips = function(userId) {
    const now = new Date();
    return this.find({
        userId,
        isDeleted: false,
        startDate: { $gt: now },
        status: { $ne: 'cancelled' }
    }).sort({ startDate: 1 });
};

// ==================== PRE-SAVE HOOKS ====================

/**
 * Pre-save hook to auto-update status based on dates
 */
TripSchema.pre('save', function(next) {
    // Update status based on dates if not cancelled
    if (this.status !== 'cancelled' && this.status !== 'planning') {
        this.updateStatus();
    }
    next();
});

const Trip = mongoose.model('Trip', TripSchema);

module.exports = Trip;
