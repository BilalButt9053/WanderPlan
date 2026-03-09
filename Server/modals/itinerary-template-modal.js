/**
 * ItineraryTemplate Model - Stores static itinerary templates created by businesses
 * 
 * Used by the hybrid itinerary system to fetch pre-defined activities
 * that can be merged with AI-generated content.
 */

const mongoose = require("mongoose");

/**
 * Activity Schema - Individual activity within a day
 */
const ActivitySchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: {
            values: ['hotel', 'food', 'attraction', 'transport', 'shopping', 'entertainment', 'other'],
            message: 'Type must be one of: hotel, food, attraction, transport, shopping, entertainment, other'
        },
        required: [true, 'Activity type is required']
    },
    time: {
        type: String,
        trim: true,
        default: ''  // e.g., "09:00 AM", "Morning", "14:00-16:00"
    },
    duration: {
        type: Number, // Duration in minutes
        min: [0, 'Duration cannot be negative'],
        default: null
    },
    location: {
        name: { type: String, default: '' },
        address: { type: String, default: '' },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        placeId: { type: String, default: null } // Google Places ID
    },
    cost: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'PKR' },
        notes: { type: String, default: '' } // e.g., "per person", "estimated"
    },
    images: [{
        url: { type: String },
        publicId: { type: String }
    }],
    tips: {
        type: String,
        maxlength: [500, 'Tips cannot exceed 500 characters'],
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
    contactInfo: {
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        website: { type: String, default: '' }
    }
}, { _id: true });

/**
 * Day Schema - Represents a single day in the itinerary
 */
const DaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day number is required'],
        min: [1, 'Day number must be at least 1']
    },
    title: {
        type: String,
        trim: true,
        default: '' // e.g., "Arrival & City Exploration"
    },
    activities: {
        type: [ActivitySchema],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'Each day must have at least one activity'
        }
    }
}, { _id: false });

/**
 * ItineraryTemplate Schema - Main template document
 */
const ItineraryTemplateSchema = new mongoose.Schema({
    // Reference to the business that created this template
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },

    // Template metadata
    title: {
        type: String,
        required: [true, 'Template title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        default: ''
    },

    // Destination information
    destination: {
        name: {
            type: String,
            required: [true, 'Destination name is required'],
            trim: true,
            index: true
        },
        city: { type: String, default: '', index: true },
        state: { type: String, default: '' },
        country: { type: String, default: 'Pakistan', index: true },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        placeId: { type: String, default: null }
    },

    // Itinerary details
    days: {
        type: [DaySchema],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'Itinerary must have at least one day'
        }
    },
    totalDays: {
        type: Number,
        required: true,
        min: [1, 'Total days must be at least 1']
    },

    // Travel style & categorization
    travelStyle: {
        type: String,
        enum: ['budget', 'moderate', 'luxury', 'adventure', 'family', 'romantic', 'solo', 'business'],
        default: 'moderate',
        index: true
    },
    categories: [{
        type: String,
        enum: ['culture', 'nature', 'food', 'adventure', 'relaxation', 'shopping', 'nightlife', 'history', 'religious', 'wildlife']
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Budget information
    estimatedBudget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'PKR' },
        perPerson: { type: Boolean, default: true }
    },

    // Target audience
    suitableFor: [{
        type: String,
        enum: ['couples', 'families', 'solo', 'groups', 'seniors', 'kids', 'all']
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'challenging'],
        default: 'easy'
    },

    // Best time to visit
    bestSeasons: [{
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter', 'monsoon', 'all']
    }],
    bestMonths: [{
        type: Number,
        min: 1,
        max: 12
    }],

    // Media
    coverImage: {
        url: { type: String, default: null },
        publicId: { type: String, default: null }
    },
    gallery: [{
        url: { type: String },
        publicId: { type: String },
        caption: { type: String, default: '' }
    }],

    // Status & visibility
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Analytics
    analytics: {
        views: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        usedInTrips: { type: Number, default: 0 }
    },

    // Reviews summary (aggregated from reviews collection)
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },

    // SEO & metadata
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    metaDescription: {
        type: String,
        maxlength: [300, 'Meta description cannot exceed 300 characters'],
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== INDEXES ====================

// Compound index for searching itineraries by destination and travel style
ItineraryTemplateSchema.index({ 
    'destination.name': 'text', 
    'destination.city': 'text', 
    title: 'text', 
    tags: 'text' 
});

// Query optimization indexes
ItineraryTemplateSchema.index({ 'destination.city': 1, travelStyle: 1, status: 1, isActive: 1 });
ItineraryTemplateSchema.index({ totalDays: 1, travelStyle: 1 });
ItineraryTemplateSchema.index({ createdAt: -1 });

// ==================== VIRTUALS ====================

/**
 * Virtual: Get activities count
 */
ItineraryTemplateSchema.virtual('totalActivities').get(function() {
    return this.days.reduce((sum, day) => sum + day.activities.length, 0);
});

/**
 * Virtual: Average activities per day
 */
ItineraryTemplateSchema.virtual('avgActivitiesPerDay').get(function() {
    if (this.days.length === 0) return 0;
    return Math.round(this.totalActivities / this.days.length);
});

// ==================== PRE-SAVE HOOKS ====================

/**
 * Auto-generate slug from title and destination
 */
ItineraryTemplateSchema.pre('save', function(next) {
    if (this.isModified('title') || this.isModified('destination.name')) {
        const baseSlug = `${this.title}-${this.destination.name}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
    }
    
    // Ensure totalDays matches days array
    this.totalDays = this.days.length;
    
    next();
});

// ==================== STATICS ====================

/**
 * Find published templates for a destination
 * @param {string} destination - Destination name or city
 * @param {Object} options - Query options
 */
ItineraryTemplateSchema.statics.findByDestination = function(destination, options = {}) {
    const { travelStyle, days, limit = 10, skip = 0 } = options;
    
    const query = {
        status: 'published',
        isActive: true,
        $or: [
            { 'destination.name': new RegExp(destination, 'i') },
            { 'destination.city': new RegExp(destination, 'i') }
        ]
    };

    if (travelStyle) {
        query.travelStyle = travelStyle;
    }

    if (days) {
        query.totalDays = { $lte: days };
    }

    return this.find(query)
        .populate('business', 'businessName logo')
        .sort({ 'analytics.usedInTrips': -1, 'rating.average': -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Search templates with text search
 * @param {string} searchText - Search query
 */
ItineraryTemplateSchema.statics.searchTemplates = function(searchText, options = {}) {
    const { limit = 20 } = options;
    
    return this.find(
        { 
            $text: { $search: searchText },
            status: 'published',
            isActive: true
        },
        { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

// ==================== METHODS ====================

/**
 * Increment analytics counter
 * @param {string} field - Field to increment (views, saves, shares, usedInTrips)
 */
ItineraryTemplateSchema.methods.incrementAnalytics = function(field) {
    const validFields = ['views', 'saves', 'shares', 'usedInTrips'];
    if (!validFields.includes(field)) {
        throw new Error(`Invalid analytics field: ${field}`);
    }
    this.analytics[field] += 1;
    return this.save();
};

/**
 * Get activities for specific days range
 * @param {number} startDay - Start day (1-indexed)
 * @param {number} endDay - End day (1-indexed)
 */
ItineraryTemplateSchema.methods.getActivitiesForDays = function(startDay, endDay) {
    return this.days
        .filter(d => d.day >= startDay && d.day <= endDay)
        .map(d => ({
            day: d.day,
            title: d.title,
            activities: d.activities.map(a => ({
                title: a.title,
                description: a.description,
                type: a.type,
                time: a.time,
                duration: a.duration,
                location: a.location,
                cost: a.cost
            }))
        }));
};

const ItineraryTemplate = mongoose.model('ItineraryTemplate', ItineraryTemplateSchema);

module.exports = ItineraryTemplate;
