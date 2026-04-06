/**
 * Itinerary Controller - Handles all itinerary-related API requests
 * 
 * Endpoints:
 * Public/Guest:
 * - GET /api/itineraries/hybrid - Get hybrid itinerary (static + AI)
 * - GET /api/itineraries/templates - Get static templates
 * - GET /api/itineraries/suggestions - Get destination suggestions
 * - GET /api/itineraries/templates/:id - Get specific template
 * 
 * Authenticated (Trip-linked):
 * - POST /api/itineraries/trip/:tripId/generate - Generate budget-aware itinerary for trip
 * - GET /api/itineraries/trip/:tripId - Get saved itinerary for trip
 * - PUT /api/itineraries/trip/:tripId/regenerate - Regenerate itinerary
 * - POST /api/itineraries/trip/:tripId/commit-budget - Commit itinerary costs to budget
 * - GET /api/itineraries/saved - Get user's saved itineraries
 */

const ItineraryTemplate = require('../modals/itinerary-template-modal');
const SavedItinerary = require('../modals/saved-itinerary-modal');
const Trip = require('../modals/trip-modal');
const itineraryService = require('../services/itinerary-service');
const openaiService = require('../services/openai-service');

/**
 * Get hybrid itinerary (combining static + AI)
 * GET /api/itineraries/hybrid
 * 
 * @query {string} destination - Destination city/location (required)
 * @query {number} days - Number of days (required, 1-30)
 * @query {string} travelStyle - Travel style (budget, moderate, luxury)
 */
const getHybridItinerary = async (req, res, next) => {
    try {
        const { destination, days, travelStyle = 'moderate' } = req.query;

        // Validate required parameters
        if (!destination) {
            return res.status(400).json({
                success: false,
                message: 'Destination is required',
                example: '/api/itineraries/hybrid?destination=Lahore&days=3&travelStyle=moderate'
            });
        }

        const numDays = parseInt(days);
        if (!numDays || numDays < 1 || numDays > 30) {
            return res.status(400).json({
                success: false,
                message: 'Days must be a number between 1 and 30'
            });
        }

        // Validate travel style
        const validStyles = ['budget', 'moderate', 'luxury', 'adventure', 'family', 'romantic', 'solo', 'business'];
        if (travelStyle && !validStyles.includes(travelStyle)) {
            return res.status(400).json({
                success: false,
                message: `Invalid travel style. Must be one of: ${validStyles.join(', ')}`
            });
        }

        // Generate hybrid itinerary
        const result = await itineraryService.generateHybridItinerary({
            destination: destination.trim(),
            days: numDays,
            travelStyle
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('[itinerary-controller] Hybrid itinerary error:', error);
        next(error);
    }
};

/**
 * Get static itinerary templates from database
 * GET /api/itineraries/templates
 * 
 * @query {string} destination - Filter by destination
 * @query {string} travelStyle - Filter by travel style
 * @query {number} days - Filter by max days
 * @query {number} limit - Results limit (default: 20)
 * @query {number} page - Page number (default: 1)
 */
const getTemplates = async (req, res, next) => {
    try {
        const { 
            destination, 
            travelStyle, 
            days,
            limit = 20, 
            page = 1,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build filter
        const filter = {
            status: 'published',
            isActive: true
        };

        if (destination) {
            filter.$or = [
                { 'destination.name': new RegExp(destination, 'i') },
                { 'destination.city': new RegExp(destination, 'i') }
            ];
        }

        if (travelStyle) {
            filter.travelStyle = travelStyle;
        }

        if (days) {
            filter.totalDays = { $lte: parseInt(days) };
        }

        // Pagination
        const limitNum = Math.min(parseInt(limit), 50);
        const skip = (parseInt(page) - 1) * limitNum;

        // Sort configuration
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = { [sort]: sortOrder };

        // Execute query
        const [templates, totalCount] = await Promise.all([
            ItineraryTemplate.find(filter)
                .populate('business', 'businessName logo')
                .select('-__v')
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean({ virtuals: true }),
            ItineraryTemplate.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: templates.length,
            totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            templates
        });

    } catch (error) {
        console.error('[itinerary-controller] Get templates error:', error);
        next(error);
    }
};

/**
 * Get single template by ID
 * GET /api/itineraries/templates/:id
 */
const getTemplateById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid template ID format'
            });
        }

        const template = await ItineraryTemplate.findOne({
            _id: id,
            status: 'published',
            isActive: true
        })
        .populate('business', 'businessName logo phone email website')
        .lean({ virtuals: true });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Increment view count (fire and forget)
        ItineraryTemplate.updateOne(
            { _id: id },
            { $inc: { 'analytics.views': 1 } }
        ).exec().catch(err => console.error('View count update failed:', err));

        res.status(200).json({
            success: true,
            template
        });

    } catch (error) {
        console.error('[itinerary-controller] Get template error:', error);
        next(error);
    }
};

/**
 * Get destination suggestions
 * GET /api/itineraries/suggestions
 */
const getSuggestions = async (req, res, next) => {
    try {
        const suggestions = await itineraryService.getSuggestedDestinations();

        // Also check if AI service is available
        const aiAvailable = await openaiService.isServiceAvailable();

        res.status(200).json({
            success: true,
            aiServiceAvailable: aiAvailable,
            destinations: suggestions
        });

    } catch (error) {
        console.error('[itinerary-controller] Get suggestions error:', error);
        next(error);
    }
};

/**
 * Search templates by text
 * GET /api/itineraries/search
 * 
 * @query {string} q - Search query
 * @query {number} limit - Results limit
 */
const searchTemplates = async (req, res, next) => {
    try {
        const { q, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const templates = await ItineraryTemplate.searchTemplates(q.trim(), {
            limit: Math.min(parseInt(limit), 50)
        });

        res.status(200).json({
            success: true,
            query: q,
            count: templates.length,
            templates
        });

    } catch (error) {
        console.error('[itinerary-controller] Search error:', error);
        next(error);
    }
};

/**
 * Get travel tips for a destination (AI-powered)
 * GET /api/itineraries/tips
 * 
 * @query {string} destination - Destination name
 * @query {string} travelStyle - Travel style
 */
const getTravelTips = async (req, res, next) => {
    try {
        const { destination, travelStyle = 'moderate' } = req.query;

        if (!destination) {
            return res.status(400).json({
                success: false,
                message: 'Destination is required'
            });
        }

        const tips = await openaiService.generateTravelTips(destination, travelStyle);

        res.status(200).json({
            success: true,
            destination,
            travelStyle,
            tips
        });

    } catch (error) {
        console.error('[itinerary-controller] Get tips error:', error);
        next(error);
    }
};

/**
 * Get featured itineraries
 * GET /api/itineraries/featured
 */
const getFeaturedItineraries = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const featured = await ItineraryTemplate.find({
            status: 'published',
            isActive: true,
            isFeatured: true
        })
        .populate('business', 'businessName logo')
        .select('title destination totalDays travelStyle coverImage rating analytics estimatedBudget')
        .sort({ 'analytics.usedInTrips': -1, 'rating.average': -1 })
        .limit(Math.min(parseInt(limit), 20))
        .lean();

        res.status(200).json({
            success: true,
            count: featured.length,
            itineraries: featured
        });

    } catch (error) {
        console.error('[itinerary-controller] Get featured error:', error);
        next(error);
    }
};

// ==========================================
// TRIP-LINKED BUDGET-AWARE ENDPOINTS
// ==========================================

/**
 * Generate budget-aware itinerary for a trip
 * POST /api/itineraries/trip/:tripId/generate
 * 
 * Query params:
 * - mode: 'ai' (real data itinerary) or 'manual' (return available places)
 * 
 * Requires authentication
 * Links itinerary to trip and uses trip budget for cost validation
 */
const generateTripItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { mode = 'ai' } = req.query; // Default to AI mode
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Validate mode
        const validModes = ['ai', 'manual'];
        if (!validModes.includes(mode)) {
            return res.status(400).json({
                success: false,
                message: `Invalid mode. Must be one of: ${validModes.join(', ')}`
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        // Extract destination
        const destination = trip.destination?.name || trip.destination?.city;
        if (!destination) {
            return res.status(400).json({
                success: false,
                message: 'Trip destination not set'
            });
        }

        // Calculate days
        const days = trip.durationDays || Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1;

        const travelStyle = trip.tripType || 'moderate';

        // Handle based on mode
        if (mode === 'manual') {
            // Manual mode: Return available places for user to select
            console.log(`[itinerary-controller] Manual mode: fetching available places for ${destination}`);
            
            // Get budget info for context
            const { budgetInfo } = await itineraryService.getTripBudgetInfo(tripId);
            
            // Get available places from Google + DB
            const placesResult = await itineraryService.getAvailablePlaces({
                destination,
                travelStyle
            });
            
            return res.status(200).json({
                success: true,
                mode: 'manual',
                message: 'Available places fetched. Select places to build your itinerary.',
                tripId,
                tripTitle: trip.title,
                destination,
                days: Math.min(Math.max(days, 1), 30),
                travelStyle,
                budgetInfo: {
                    totalBudget: budgetInfo.totalBudget,
                    totalRemaining: budgetInfo.totalRemaining,
                    currency: budgetInfo.currency
                },
                ...placesResult
            });
        }

        // AI mode: Generate real-data itinerary automatically
        console.log(`[itinerary-controller] AI mode: generating real-data itinerary for ${destination}`);
        
        const result = await itineraryService.generateRealDataItinerary({
            tripId,
            userId,
            destination,
            days: Math.min(Math.max(days, 1), 30),
            travelStyle,
            travelers: trip.travelers || 1,
            saveToDb: true
        });

        res.status(200).json({
            success: true,
            message: 'Itinerary generated successfully using real places',
            tripId,
            tripTitle: trip.title,
            mode: 'ai',
            ...result
        });

    } catch (error) {
        console.error('[itinerary-controller] Generate trip itinerary error:', error);
        next(error);
    }
};

/**
 * Get saved itinerary for a trip
 * GET /api/itineraries/trip/:tripId
 * 
 * Requires authentication
 */
const getTripItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Verify trip ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        // Get saved itinerary
        const itinerary = await itineraryService.getSavedItinerary(tripId);
        
        if (!itinerary) {
            return res.status(404).json({
                success: false,
                message: 'No itinerary found for this trip. Generate one using POST /api/itineraries/trip/:tripId/generate'
            });
        }

        res.status(200).json({
            success: true,
            tripId,
            tripTitle: trip.title,
            itinerary
        });

    } catch (error) {
        console.error('[itinerary-controller] Get trip itinerary error:', error);
        next(error);
    }
};

/**
 * Regenerate itinerary for a trip
 * PUT /api/itineraries/trip/:tripId/regenerate
 * 
 * Requires authentication
 * Forces regeneration even if itinerary exists
 */
const regenerateTripItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { forceAI = false, travelStyle } = req.body || {};
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        const destination = trip.destination?.name || trip.destination?.city;
        const days = trip.durationDays || Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1;

        // Allow client to override travel style for regeneration (e.g. "budget" cheaper plan)
        const allowedStyles = ['budget', 'moderate', 'luxury'];
        const finalStyle = travelStyle && allowedStyles.includes(travelStyle)
            ? travelStyle
            : (trip.tripType || 'moderate');

        // Regenerate
        const result = await itineraryService.generateHybridItinerary({
            tripId,
            userId,
            destination,
            days: Math.min(Math.max(days, 1), 30),
            travelStyle: finalStyle,
            travelers: trip.travelers || 1,
            saveToDb: true
        });

        res.status(200).json({
            success: true,
            message: 'Itinerary regenerated successfully',
            tripId,
            regenerated: true,
            ...result
        });

    } catch (error) {
        console.error('[itinerary-controller] Regenerate itinerary error:', error);
        next(error);
    }
};

/**
 * Commit itinerary costs to trip budget
 * POST /api/itineraries/trip/:tripId/commit-budget
 * 
 * Requires authentication
 * Adds estimated itinerary costs to trip's spent amounts
 */
const commitBudgetChanges = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        // Get saved itinerary
        const savedItinerary = await itineraryService.getSavedItinerary(tripId);
        if (!savedItinerary) {
            return res.status(404).json({
                success: false,
                message: 'No itinerary found for this trip'
            });
        }

        // Check if already committed
        if (savedItinerary.budgetCommitted) {
            return res.status(400).json({
                success: false,
                message: 'Budget already committed for this itinerary',
                committedAt: savedItinerary.budgetCommittedAt
            });
        }

        // Commit budget changes
        const result = await itineraryService.updateBudgetAfterItinerary(
            tripId,
            savedItinerary.estimatedCosts,
            true // commit changes
        );

        // Mark itinerary as budget committed
        savedItinerary.budgetCommitted = true;
        savedItinerary.budgetCommittedAt = new Date();
        await savedItinerary.save();

        res.status(200).json({
            success: true,
            message: 'Budget updated successfully',
            tripId,
            budgetUpdate: result
        });

    } catch (error) {
        console.error('[itinerary-controller] Commit budget error:', error);
        next(error);
    }
};

/**
 * Get all saved itineraries for the authenticated user
 * GET /api/itineraries/saved
 * 
 * Requires authentication
 */
const getUserSavedItineraries = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const itineraries = await itineraryService.getUserItineraries(userId, {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50)
        });

        res.status(200).json({
            success: true,
            count: itineraries.length,
            page: parseInt(page),
            itineraries
        });

    } catch (error) {
        console.error('[itinerary-controller] Get user itineraries error:', error);
        next(error);
    }
};

/**
 * Delete saved itinerary for a trip
 * DELETE /api/itineraries/trip/:tripId
 * 
 * Requires authentication
 */
const deleteTripItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Verify trip ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        // Delete saved itinerary
        const result = await SavedItinerary.findOneAndDelete({ tripId, userId });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'No itinerary found for this trip'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Itinerary deleted successfully',
            tripId
        });

    } catch (error) {
        console.error('[itinerary-controller] Delete itinerary error:', error);
        next(error);
    }
};

/**
 * Get activity suggestions for manual trip building
 * GET /api/itineraries/trip/:tripId/suggestions
 * 
 * Returns a list of suggested activities (from DB + AI) that user can select from
 * Requires authentication
 */
const getActivitySuggestions = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        const destination = trip.destination?.name || trip.destination?.city;
        if (!destination) {
            return res.status(400).json({
                success: false,
                message: 'Trip destination not set'
            });
        }

        const days = trip.durationDays || Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1;

        const travelStyle = trip.tripType || 'moderate';

        // Get budget info
        const { budgetInfo } = await itineraryService.getTripBudgetInfo(tripId);

        // Fetch static itineraries from DB
        const staticSuggestions = await itineraryService.fetchStaticItineraries({
            destination,
            days,
            travelStyle,
            budget: budgetInfo
        });

        // Generate AI suggestions
        let aiSuggestions = [];
        const aiAvailable = await openaiService.isServiceAvailable();
        
        if (aiAvailable) {
            try {
                aiSuggestions = await openaiService.generateItinerary({
                    destination,
                    days: Math.min(days, 3), // Limit AI generation for suggestions
                    travelStyle,
                    budget: budgetInfo,
                    activitiesPerDay: 3
                });
            } catch (err) {
                console.warn('[itinerary-controller] AI suggestions failed, using fallback:', err.message);
                aiSuggestions = openaiService.generateFallbackItinerary(destination, Math.min(days, 3), travelStyle);
            }
        } else {
            // Use fallback templates
            aiSuggestions = openaiService.generateFallbackItinerary(destination, Math.min(days, 3), travelStyle);
        }

        // Flatten all activities into a single list for selection
        const allActivities = [];
        const seenTitles = new Set();

        // Process DB activities
        for (const day of staticSuggestions) {
            for (const activity of day.activities) {
                const key = activity.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenTitles.has(key)) {
                    seenTitles.add(key);
                    allActivities.push({
                        ...activity,
                        id: `db_${activity.templateId}_${allActivities.length}`,
                        suggestedDay: day.day,
                        source: 'business'
                    });
                }
            }
        }

        // Process AI activities
        for (const day of aiSuggestions) {
            for (const activity of day.activities) {
                const key = activity.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenTitles.has(key)) {
                    seenTitles.add(key);
                    allActivities.push({
                        ...activity,
                        id: `ai_${day.day}_${allActivities.length}`,
                        suggestedDay: day.day,
                        source: activity.source || 'ai'
                    });
                }
            }
        }

        // Sort by category for better UX
        const categoryOrder = { accommodation: 0, food: 1, transport: 2, activities: 3 };
        allActivities.sort((a, b) => {
            const catA = categoryOrder[a.category] ?? 4;
            const catB = categoryOrder[b.category] ?? 4;
            return catA - catB || a.estimatedCost - b.estimatedCost;
        });

        res.status(200).json({
            success: true,
            tripId,
            destination,
            days,
            travelStyle,
            budgetInfo: {
                totalBudget: budgetInfo.totalBudget,
                totalRemaining: budgetInfo.totalRemaining,
                currency: budgetInfo.currency
            },
            suggestionsCount: allActivities.length,
            suggestions: allActivities
        });

    } catch (error) {
        console.error('[itinerary-controller] Get suggestions error:', error);
        next(error);
    }
};

/**
 * Save manually-built itinerary with user-selected activities
 * POST /api/itineraries/trip/:tripId/manual
 * 
 * Body: {
 *   days: [
 *     { day: 1, activities: [...] },
 *     { day: 2, activities: [...] }
 *   ]
 * }
 * 
 * Requires authentication
 */
const saveManualItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { days } = req.body;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Validate days array
        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Days array is required with at least one day'
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        const destination = trip.destination?.name || trip.destination?.city;
        const travelStyle = trip.tripType || 'moderate';

        // Get budget info
        const { budgetInfo } = await itineraryService.getTripBudgetInfo(tripId);

        // Normalize and validate activities
        const normalizedDays = days.map(day => {
            const activities = (day.activities || []).map(activity => ({
                title: activity.title || 'Untitled Activity',
                description: activity.description || '',
                type: openaiService.normalizeActivityType(activity.type || activity.category),
                category: openaiService.getCategory(activity.type || activity.category),
                time: activity.time || '',
                location: activity.location || '',
                estimatedCost: typeof activity.estimatedCost === 'number' 
                    ? activity.estimatedCost 
                    : (typeof activity.price === 'number' ? activity.price : 0),
                costConfidence: 'user_selected',
                source: activity.source || 'user',
                businessId: activity.businessId || null,
                businessName: activity.businessName || null
            }));

            return {
                day: parseInt(day.day) || 1,
                activities,
                estimatedDayCost: activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0)
            };
        });

        // Sort by day
        normalizedDays.sort((a, b) => a.day - b.day);

        // Calculate costs by category
        const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
        for (const day of normalizedDays) {
            for (const activity of day.activities) {
                const category = activity.category || 'activities';
                categoryCosts[category] = (categoryCosts[category] || 0) + (activity.estimatedCost || 0);
                categoryCosts.total += activity.estimatedCost || 0;
            }
        }

        // Calculate budget status
        const budgetStatus = itineraryService.calculateBudgetStatus(categoryCosts, budgetInfo);

        // Calculate statistics
        let aiCount = 0, businessCount = 0, userCount = 0;
        for (const day of normalizedDays) {
            for (const activity of day.activities) {
                if (activity.source === 'ai') aiCount++;
                else if (activity.source === 'business') businessCount++;
                else userCount++;
            }
        }

        // Save to database
        let savedItinerary = await SavedItinerary.findOne({ tripId });
        
        if (savedItinerary) {
            // Update existing
            savedItinerary.days = normalizedDays;
            savedItinerary.estimatedCosts = categoryCosts;
            savedItinerary.budgetStatus = budgetStatus;
            savedItinerary.version += 1;
            savedItinerary.isManuallyCreated = true;
            savedItinerary.generationDetails.aiActivitiesCount = aiCount;
            savedItinerary.generationDetails.businessActivitiesCount = businessCount;
            savedItinerary.generationDetails.userActivitiesCount = userCount;
            savedItinerary.generationDetails.generatedAt = new Date();
        } else {
            // Create new
            savedItinerary = new SavedItinerary({
                tripId,
                userId,
                destination: {
                    name: destination,
                    city: trip.destination?.name || destination,
                    country: trip.destination?.country || 'Pakistan'
                },
                tripSnapshot: {
                    title: trip.title || 'Trip',
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    travelers: trip.travelers || 1,
                    totalBudget: trip.totalBudget || 0,
                    travelStyle
                },
                days: normalizedDays,
                totalDays: normalizedDays.length,
                estimatedCosts: categoryCosts,
                budgetStatus,
                isManuallyCreated: true,
                generationDetails: {
                    travelStyle,
                    generatedAt: new Date(),
                    aiActivitiesCount: aiCount,
                    businessActivitiesCount: businessCount,
                    userActivitiesCount: userCount
                }
            });
        }

        await savedItinerary.save();

        // Calculate stats for response
        const stats = itineraryService.calculateItineraryStats(normalizedDays);

        res.status(200).json({
            success: true,
            message: 'Itinerary saved successfully',
            tripId,
            isManuallyCreated: true,
            itinerary: normalizedDays,
            estimatedCosts: categoryCosts,
            budgetStatus,
            budgetInfo: budgetInfo ? {
                totalBudget: budgetInfo.totalBudget,
                totalRemaining: budgetInfo.totalRemaining,
                afterItinerary: budgetInfo.totalRemaining - categoryCosts.total,
                currency: budgetInfo.currency
            } : null,
            stats,
            savedItineraryId: savedItinerary._id
        });

    } catch (error) {
        console.error('[itinerary-controller] Save manual itinerary error:', error);
        next(error);
    }
};

/**
 * Update existing itinerary (add/remove/edit activities)
 * PUT /api/itineraries/trip/:tripId
 * 
 * Body: {
 *   days: [...] // Updated days array
 * }
 * 
 * Requires authentication
 */
const updateItinerary = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const { days } = req.body;
        const userId = req.user._id;

        // Validate tripId format
        if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Validate days array
        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Days array is required'
            });
        }

        // Find trip and verify ownership
        const trip = await Trip.findOne({ _id: tripId, userId });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found or you do not have access'
            });
        }

        // Find existing itinerary
        const savedItinerary = await SavedItinerary.findOne({ tripId });
        if (!savedItinerary) {
            return res.status(404).json({
                success: false,
                message: 'No itinerary found for this trip. Create one first.'
            });
        }

        // Get budget info
        const { budgetInfo } = await itineraryService.getTripBudgetInfo(tripId);

        // Normalize activities
        const normalizedDays = days.map(day => {
            const activities = (day.activities || []).map(activity => ({
                title: activity.title || 'Untitled Activity',
                description: activity.description || '',
                type: openaiService.normalizeActivityType(activity.type || activity.category),
                category: openaiService.getCategory(activity.type || activity.category),
                time: activity.time || '',
                location: activity.location || '',
                estimatedCost: typeof activity.estimatedCost === 'number' 
                    ? activity.estimatedCost 
                    : (typeof activity.price === 'number' ? activity.price : 0),
                costConfidence: activity.costConfidence || 'user_edited',
                source: activity.source || 'user',
                businessId: activity.businessId || null,
                businessName: activity.businessName || null
            }));

            return {
                day: parseInt(day.day) || 1,
                activities,
                estimatedDayCost: activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0)
            };
        });

        // Sort by day
        normalizedDays.sort((a, b) => a.day - b.day);

        // Calculate costs by category
        const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
        for (const day of normalizedDays) {
            for (const activity of day.activities) {
                const category = activity.category || 'activities';
                categoryCosts[category] = (categoryCosts[category] || 0) + (activity.estimatedCost || 0);
                categoryCosts.total += activity.estimatedCost || 0;
            }
        }

        // Calculate budget status
        const budgetStatus = itineraryService.calculateBudgetStatus(categoryCosts, budgetInfo);

        // Calculate statistics
        const stats = itineraryService.calculateItineraryStats(normalizedDays);

        // Update saved itinerary
        savedItinerary.days = normalizedDays;
        savedItinerary.totalDays = normalizedDays.length;
        savedItinerary.estimatedCosts = categoryCosts;
        savedItinerary.budgetStatus = budgetStatus;
        savedItinerary.version += 1;
        savedItinerary.lastEditedAt = new Date();
        savedItinerary.generationDetails.aiActivitiesCount = stats.aiActivities;
        savedItinerary.generationDetails.businessActivitiesCount = stats.businessActivities;

        // If budget was committed, we need to warn the user
        if (savedItinerary.budgetCommitted) {
            savedItinerary.budgetCommitted = false; // Reset so they can recommit
            savedItinerary.budgetCommittedAt = null;
        }

        await savedItinerary.save();

        res.status(200).json({
            success: true,
            message: 'Itinerary updated successfully',
            tripId,
            version: savedItinerary.version,
            itinerary: normalizedDays,
            estimatedCosts: categoryCosts,
            budgetStatus,
            budgetInfo: budgetInfo ? {
                totalBudget: budgetInfo.totalBudget,
                totalRemaining: budgetInfo.totalRemaining,
                afterItinerary: budgetInfo.totalRemaining - categoryCosts.total,
                currency: budgetInfo.currency
            } : null,
            stats,
            savedItineraryId: savedItinerary._id
        });

    } catch (error) {
        console.error('[itinerary-controller] Update itinerary error:', error);
        next(error);
    }
};

module.exports = {
    // Public endpoints
    getHybridItinerary,
    getTemplates,
    getTemplateById,
    getSuggestions,
    searchTemplates,
    getTravelTips,
    getFeaturedItineraries,
    
    // Authenticated trip-linked endpoints
    generateTripItinerary,
    getTripItinerary,
    regenerateTripItinerary,
    commitBudgetChanges,
    getUserSavedItineraries,
    deleteTripItinerary,
    
    // Manual trip building endpoints
    getActivitySuggestions,
    saveManualItinerary,
    updateItinerary
};
