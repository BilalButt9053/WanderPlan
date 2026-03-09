/**
 * SavedItinerary Model - Stores generated itineraries linked to trips
 * 
 * This model persists both static (business) and AI-generated itineraries
 * with full budget tracking and cost estimation per activity.
 * 
 * Features:
 * - Links to Trip for budget integration
 * - Cost tracking per activity and category
 * - Source tracking (business vs AI)
 * - Budget validation and warnings
 */

const mongoose = require("mongoose");

/**
 * Activity Schema - Individual activity with cost estimation
 */
const SavedActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Activity title is required'],
        trim: true,
        maxlength: [200, 'Activity title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },
    // Activity type mapped to budget categories
    type: {
        type: String,
        enum: ['hotel', 'food', 'attraction', 'transport', 'shopping', 'entertainment', 'other'],
        required: true
    },
    // Budget category for expense tracking
    category: {
        type: String,
        enum: ['accommodation', 'food', 'transport', 'activities'],
        required: true
    },
    time: {
        type: String,
        trim: true,
        default: ''
    },
    duration: {
        type: Number, // Duration in minutes
        min: 0,
        default: null
    },
    // Cost estimation
    estimatedCost: {
        type: Number,
        required: true,
        min: [0, 'Cost cannot be negative'],
        default: 0
    },
    currency: {
        type: String,
        default: 'PKR',
        uppercase: true
    },
    // Cost confidence level
    costConfidence: {
        type: String,
        enum: ['exact', 'estimated', 'approximate', 'user_selected', 'user_edited'],
        default: 'estimated'
    },
    // Location details
    location: {
        name: { type: String, default: '' },
        address: { type: String, default: '' },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        placeId: { type: String, default: null }
    },
    // Source tracking
    source: {
        type: String,
        enum: ['business', 'ai', 'user', 'fallback'],
        required: true
    },
    // Business reference (if source is 'business')
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        default: null
    },
    businessName: {
        type: String,
        default: null
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItineraryTemplate',
        default: null
    },
    // Additional metadata
    tips: {
        type: String,
        maxlength: 500,
        default: ''
    },
    bookingRequired: {
        type: Boolean,
        default: false
    },
    bookingUrl: {
        type: String,
        default: ''
    },
    // User modifications
    isUpdated: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    actualCost: {
        type: Number,
        default: null
    }
}, { _id: true });

/**
 * Day Schema - Represents a single day in the itinerary
 */
const SavedDaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day number is required'],
        min: [1, 'Day number must be at least 1']
    },
    date: {
        type: Date,
        default: null
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    activities: {
        type: [SavedActivitySchema],
        default: []
    },
    // Day-level cost summary
    estimatedDayCost: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: 1000,
        default: ''
    }
}, { _id: false });

/**
 * Cost Summary Schema - Breakdown by category
 */
const CostSummarySchema = new mongoose.Schema({
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
}, { _id: false });

/**
 * Budget Status Schema - Tracks budget health
 */
const BudgetStatusSchema = new mongoose.Schema({
    isWithinBudget: { type: Boolean, default: true },
    budgetUtilization: { type: Number, default: 0 }, // Percentage
    warnings: [{ type: String }],
    categoryStatus: {
        accommodation: { 
            allocated: { type: Number, default: 0 },
            estimated: { type: Number, default: 0 },
            remaining: { type: Number, default: 0 },
            isOverBudget: { type: Boolean, default: false }
        },
        food: { 
            allocated: { type: Number, default: 0 },
            estimated: { type: Number, default: 0 },
            remaining: { type: Number, default: 0 },
            isOverBudget: { type: Boolean, default: false }
        },
        transport: { 
            allocated: { type: Number, default: 0 },
            estimated: { type: Number, default: 0 },
            remaining: { type: Number, default: 0 },
            isOverBudget: { type: Boolean, default: false }
        },
        activities: { 
            allocated: { type: Number, default: 0 },
            estimated: { type: Number, default: 0 },
            remaining: { type: Number, default: 0 },
            isOverBudget: { type: Boolean, default: false }
        }
    }
}, { _id: false });

/**
 * SavedItinerary Schema - Main document
 */
const SavedItinerarySchema = new mongoose.Schema({
    // Link to trip
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
        index: true
    },
    // Link to user (denormalized for faster queries)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup',
        required: true,
        index: true
    },
    // Itinerary metadata
    destination: {
        name: { type: String, required: true },
        city: { type: String, default: '' },
        country: { type: String, default: '' },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        }
    },
    // Trip details snapshot (for reference)
    tripSnapshot: {
        title: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        travelers: { type: Number },
        totalBudget: { type: Number },
        travelStyle: { type: String }
    },
    // Itinerary days
    days: {
        type: [SavedDaySchema],
        default: []
    },
    totalDays: {
        type: Number,
        required: true,
        min: 1
    },
    // Cost tracking
    estimatedCosts: {
        type: CostSummarySchema,
        default: () => ({})
    },
    actualCosts: {
        type: CostSummarySchema,
        default: () => ({})
    },
    // Budget integration
    budgetStatus: {
        type: BudgetStatusSchema,
        default: () => ({})
    },
    // Generation metadata
    generationDetails: {
        travelStyle: { 
            type: String, 
            enum: ['budget', 'moderate', 'luxury', 'adventure', 'family', 'leisure', 'business', 'solo', 'honeymoon', 'group', 'romantic', 'other'],
            default: 'moderate'
        },
        generatedAt: { type: Date, default: Date.now },
        regeneratedCount: { type: Number, default: 0 },
        aiActivitiesCount: { type: Number, default: 0 },
        businessActivitiesCount: { type: Number, default: 0 },
        userActivitiesCount: { type: Number, default: 0 },
        generationTime: { type: Number, default: 0 } // ms
    },
    // Manual creation flag
    isManuallyCreated: {
        type: Boolean,
        default: false
    },
    // Track last edit
    lastEditedAt: {
        type: Date,
        default: null
    },
    // Status
    status: {
        type: String,
        enum: ['draft', 'confirmed', 'in-progress', 'completed', 'archived'],
        default: 'draft'
    },
    // Version control
    version: {
        type: Number,
        default: 1
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    // Budget commitment tracking
    budgetCommitted: {
        type: Boolean,
        default: false
    },
    budgetCommittedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== INDEXES ====================

SavedItinerarySchema.index({ tripId: 1, isDeleted: 1 });
SavedItinerarySchema.index({ userId: 1, status: 1, isDeleted: 1 });
SavedItinerarySchema.index({ createdAt: -1 });

// ==================== VIRTUALS ====================

/**
 * Virtual: Total activities count
 */
SavedItinerarySchema.virtual('totalActivities').get(function() {
    return this.days.reduce((sum, day) => sum + day.activities.length, 0);
});

/**
 * Virtual: Average cost per day
 */
SavedItinerarySchema.virtual('avgCostPerDay').get(function() {
    if (this.totalDays === 0) return 0;
    return Math.round(this.estimatedCosts.total / this.totalDays);
});

/**
 * Virtual: Budget remaining after itinerary
 */
SavedItinerarySchema.virtual('budgetRemaining').get(function() {
    const totalBudget = this.tripSnapshot?.totalBudget || 0;
    return totalBudget - this.estimatedCosts.total;
});

// ==================== METHODS ====================

/**
 * Recalculate all cost summaries
 */
SavedItinerarySchema.methods.recalculateCosts = function() {
    const costs = {
        accommodation: 0,
        food: 0,
        transport: 0,
        activities: 0,
        total: 0
    };

    for (const day of this.days) {
        let dayCost = 0;
        for (const activity of day.activities) {
            const cost = activity.estimatedCost || 0;
            costs[activity.category] += cost;
            costs.total += cost;
            dayCost += cost;
        }
        day.estimatedDayCost = dayCost;
    }

    this.estimatedCosts = costs;
    return costs;
};

/**
 * Update budget status based on trip budget
 * @param {Object} tripBudget - Trip budget breakdown
 */
SavedItinerarySchema.methods.updateBudgetStatus = function(tripBudget) {
    const status = {
        isWithinBudget: true,
        budgetUtilization: 0,
        warnings: [],
        categoryStatus: {}
    };

    const categories = ['accommodation', 'food', 'transport', 'activities'];
    let totalAllocated = 0;
    let totalEstimated = 0;

    for (const category of categories) {
        const allocated = tripBudget[category]?.amount || 0;
        const spent = tripBudget[category]?.spent || 0;
        const remaining = allocated - spent;
        const estimated = this.estimatedCosts[category] || 0;

        totalAllocated += allocated;
        totalEstimated += estimated;

        const isOverBudget = estimated > remaining;

        status.categoryStatus[category] = {
            allocated,
            estimated,
            remaining: remaining - estimated,
            isOverBudget
        };

        if (isOverBudget) {
            status.isWithinBudget = false;
            status.warnings.push(
                `${category.charAt(0).toUpperCase() + category.slice(1)} budget exceeded by ${estimated - remaining} PKR`
            );
        } else if (estimated > remaining * 0.8) {
            status.warnings.push(
                `${category.charAt(0).toUpperCase() + category.slice(1)} budget is running low (${Math.round((estimated / remaining) * 100)}% of remaining)`
            );
        }
    }

    status.budgetUtilization = totalAllocated > 0 
        ? Math.round((totalEstimated / totalAllocated) * 100) 
        : 0;

    this.budgetStatus = status;
    return status;
};

/**
 * Get activities by source
 * @param {string} source - 'business' or 'ai'
 */
SavedItinerarySchema.methods.getActivitiesBySource = function(source) {
    const activities = [];
    for (const day of this.days) {
        for (const activity of day.activities) {
            if (activity.source === source) {
                activities.push({ ...activity.toObject(), day: day.day });
            }
        }
    }
    return activities;
};

// ==================== STATICS ====================

/**
 * Find itinerary for a trip
 * @param {ObjectId} tripId - Trip ID
 */
SavedItinerarySchema.statics.findByTripId = function(tripId) {
    return this.findOne({ 
        tripId, 
        isDeleted: false 
    }).sort({ version: -1 });
};

/**
 * Find all itineraries for a user
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options
 */
SavedItinerarySchema.statics.findByUserId = function(userId, options = {}) {
    const { status, limit = 20, skip = 0 } = options;
    
    const filter = { userId, isDeleted: false };
    if (status) filter.status = status;

    return this.find(filter)
        .populate('tripId', 'title destination startDate endDate')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
};

const SavedItinerary = mongoose.model('SavedItinerary', SavedItinerarySchema);

module.exports = SavedItinerary;
