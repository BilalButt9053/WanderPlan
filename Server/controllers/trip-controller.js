/**
 * Trip Controller - Handles all trip-related API requests
 * 
 * Endpoints:
 * - POST   /api/trips        - Create new trip
 * - GET    /api/trips        - Get all user trips
 * - GET    /api/trips/:id    - Get single trip
 * - PUT    /api/trips/:id    - Update trip
 * - DELETE /api/trips/:id    - Delete trip (soft delete)
 * - POST   /api/trips/:id/expense - Add expense to trip
 * - GET    /api/trips/:id/budget  - Get detailed budget summary
 */

const Trip = require("../modals/trip-modal");
const SavedItinerary = require("../modals/saved-itinerary-modal");
const Business = require("../modals/business-modal");
const budgetService = require("../services/budget-service");

/**
 * Create a new trip
 * POST /api/trips
 * 
 * @body {string} title - Trip title
 * @body {string|Object} destination - Destination (string or object with placeId)
 * @body {Date} startDate - Trip start date
 * @body {Date} endDate - Trip end date
 * @body {number} totalBudget - Total budget amount
 * @body {number} travelers - Number of travelers
 * @body {Object} customBudgetPercentages - Optional custom budget allocation
 */
const createTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const {
            title,
            destination,
            startDate,
            endDate,
            totalBudget,
            travelers,
            description,
            currency,
            tripType,
            tags,
            coverImage,
            isPublic,
            customBudgetPercentages
        } = req.body;

        // Validate required fields
        if (!title || !destination || !startDate || !endDate || !totalBudget || !travelers) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, destination, startDate, endDate, totalBudget, travelers'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be on or after start date'
            });
        }

        // Validate budget
        if (totalBudget <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Budget must be greater than 0'
            });
        }

        // Calculate budget breakdown using service
        let budgetBreakdown;
        try {
            budgetBreakdown = budgetService.calculateBudgetBreakdown(
                totalBudget, 
                customBudgetPercentages
            );
        } catch (budgetError) {
            return res.status(400).json({
                success: false,
                message: budgetError.message
            });
        }

        // Prepare destination object
        const destinationData = typeof destination === 'string' 
            ? { name: destination }
            : {
                name: destination.name,
                placeId: destination.placeId || null,
                coordinates: destination.coordinates || { lat: null, lng: null },
                country: destination.country || null,
                state: destination.state || null,
                formattedAddress: destination.formattedAddress || null
            };

        // Determine initial status
        const now = new Date();
        let status = 'planning';
        if (start > now) {
            status = 'upcoming';
        } else if (start <= now && end >= now) {
            status = 'ongoing';
        }

        // Create trip document
        const trip = new Trip({
            userId,
            title,
            destination: destinationData,
            startDate: start,
            endDate: end,
            totalBudget,
            currency: currency || 'PKR',
            budgetBreakdown,
            travelers,
            description: description || '',
            tripType: tripType || 'leisure',
            tags: tags || [],
            coverImage: coverImage || { url: null, publicId: null },
            isPublic: isPublic || false,
            status
        });

        await trip.save();

        // Prepare response with additional calculated fields
        const tripResponse = trip.toObject({ virtuals: true });
        tripResponse.budgetSummary = budgetService.getBudgetSummary(trip);

        res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            trip: tripResponse
        });

    } catch (error) {
        console.error('[trips] Create trip error:', error);
        next(error);
    }
};

/**
 * Get all trips for logged-in user
 * GET /api/trips
 * 
 * @query {string} status - Filter by status (planning, upcoming, ongoing, completed, cancelled)
 * @query {number} limit - Number of trips to return (default: 20)
 * @query {number} page - Page number for pagination (default: 1)
 * @query {string} sort - Sort field (startDate, createdAt, totalBudget)
 * @query {string} order - Sort order (asc, desc)
 * @query {boolean} includeItinerary - Include itinerary day/activity data
 */
const getUserTrips = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { 
            status, 
            limit = 20, 
            page = 1,
            sort = 'startDate',
            order = 'desc',
            tripType,
            includeItinerary = 'false'
        } = req.query;

        // Build filter
        const filter = { 
            userId, 
            isDeleted: false 
        };

        if (status) {
            filter.status = status;
        }

        if (tripType) {
            filter.tripType = tripType;
        }

        // Build sort object
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = { [sort]: sortOrder };

        // Calculate pagination
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (parseInt(page) - 1) * limitNum;

        // Execute query with pagination
        const [trips, totalCount] = await Promise.all([
            Trip.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean({ virtuals: true }),
            Trip.countDocuments(filter)
        ]);

        // Auto-update statuses and add budget summaries
        const now = new Date();
        const tripsWithDetails = trips.map(trip => {
            // Calculate virtual fields manually for lean query
            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.endDate);
            
            trip.remainingBudget = trip.totalBudget - trip.totalSpent;
            trip.durationDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            trip.budgetPerPerson = Math.round(trip.totalBudget / trip.travelers);
            trip.daysUntilTrip = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
            
            return trip;
        });

        if (includeItinerary === 'true' && tripsWithDetails.length > 0) {
            const tripIds = tripsWithDetails.map((trip) => trip._id);
            const itineraries = await SavedItinerary.find({
                userId,
                tripId: { $in: tripIds },
                isDeleted: false
            })
            .select('tripId days estimatedCosts')
            .lean();

            const itineraryMap = new Map(
                itineraries.map((it) => [it.tripId.toString(), it])
            );

            tripsWithDetails.forEach((trip) => {
                const itinerary = itineraryMap.get(trip._id.toString());
                if (itinerary) {
                    trip.itinerary = {
                        days: itinerary.days || [],
                        estimatedCosts: itinerary.estimatedCosts || null,
                        totalActivities: (itinerary.days || []).reduce(
                            (sum, day) => sum + ((day.activities || []).length),
                            0
                        )
                    };
                } else {
                    trip.itinerary = null;
                }
            });
        }

        res.status(200).json({
            success: true,
            count: trips.length,
            totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            trips: tripsWithDetails
        });

    } catch (error) {
        console.error('[trips] Get user trips error:', error);
        next(error);
    }
};

/**
 * Get single trip by ID
 * GET /api/trips/:id
 */
const getTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        const trip = await Trip.findOne({ 
            _id: id, 
            userId, 
            isDeleted: false 
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Update status if needed
        trip.updateStatus();
        await trip.save();

        // Get comprehensive response
        const tripResponse = trip.toObject({ virtuals: true });
        tripResponse.budgetSummary = budgetService.getBudgetSummary(trip);
        tripResponse.recommendations = budgetService.getBudgetRecommendations(trip);

        res.status(200).json({
            success: true,
            trip: tripResponse
        });

    } catch (error) {
        console.error('[trips] Get trip error:', error);
        next(error);
    }
};

/**
 * Update trip
 * PUT /api/trips/:id
 */
const updateTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const updates = req.body;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Find the trip
        const trip = await Trip.findOne({ 
            _id: id, 
            userId, 
            isDeleted: false 
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Validate date changes
        if (updates.startDate || updates.endDate) {
            const newStart = updates.startDate ? new Date(updates.startDate) : trip.startDate;
            const newEnd = updates.endDate ? new Date(updates.endDate) : trip.endDate;

            if (newEnd < newStart) {
                return res.status(400).json({
                    success: false,
                    message: 'End date must be on or after start date'
                });
            }

            updates.startDate = newStart;
            updates.endDate = newEnd;
        }

        // Handle budget updates
        if (updates.totalBudget && updates.totalBudget !== trip.totalBudget) {
            if (updates.totalBudget <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Budget must be greater than 0'
                });
            }

            // Recalculate breakdown while preserving spent amounts
            updates.budgetBreakdown = budgetService.recalculateBudget(
                trip.budgetBreakdown,
                updates.totalBudget
            );
        }

        // Handle custom budget percentages update
        if (updates.customBudgetPercentages) {
            try {
                const budget = updates.totalBudget || trip.totalBudget;
                updates.budgetBreakdown = budgetService.calculateBudgetBreakdown(
                    budget,
                    updates.customBudgetPercentages
                );
                // Preserve spent amounts
                for (const category of ['accommodation', 'food', 'transport', 'activities']) {
                    if (trip.budgetBreakdown[category]) {
                        updates.budgetBreakdown[category].spent = trip.budgetBreakdown[category].spent;
                    }
                }
                delete updates.customBudgetPercentages;
            } catch (budgetError) {
                return res.status(400).json({
                    success: false,
                    message: budgetError.message
                });
            }
        }

        // Handle destination updates
        if (updates.destination) {
            if (typeof updates.destination === 'string') {
                updates.destination = { 
                    ...trip.destination.toObject(),
                    name: updates.destination 
                };
            } else {
                updates.destination = {
                    ...trip.destination.toObject(),
                    ...updates.destination
                };
            }
        }

        // Prevent updating protected fields
        delete updates.userId;
        delete updates.totalSpent;
        delete updates.createdAt;
        delete updates.isDeleted;

        // Apply updates
        Object.assign(trip, updates);
        
        // Update status based on new dates
        trip.updateStatus();
        
        await trip.save();

        const tripResponse = trip.toObject({ virtuals: true });
        tripResponse.budgetSummary = budgetService.getBudgetSummary(trip);

        res.status(200).json({
            success: true,
            message: 'Trip updated successfully',
            trip: tripResponse
        });

    } catch (error) {
        console.error('[trips] Update trip error:', error);
        next(error);
    }
};

/**
 * Delete trip (soft delete)
 * DELETE /api/trips/:id
 */
const deleteTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        const trip = await Trip.findOne({ 
            _id: id, 
            userId, 
            isDeleted: false 
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Soft delete
        trip.isDeleted = true;
        trip.status = 'cancelled';
        await trip.save();

        res.status(200).json({
            success: true,
            message: 'Trip deleted successfully'
        });

    } catch (error) {
        console.error('[trips] Delete trip error:', error);
        next(error);
    }
};

/**
 * Add expense to trip
 * POST /api/trips/:id/expense
 * 
 * @body {string} category - Budget category (accommodation, food, transport, activities)
 * @body {number} amount - Expense amount
 * @body {string} description - Optional expense description
 */
const addExpense = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { category, amount, description } = req.body;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        // Validate input
        if (!category || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Category and amount are required'
            });
        }

        const validCategories = ['accommodation', 'food', 'transport', 'activities'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const trip = await Trip.findOne({ 
            _id: id, 
            userId, 
            isDeleted: false 
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Add expense using model method
        await trip.addExpense(category, amount);

        const tripResponse = trip.toObject({ virtuals: true });
        tripResponse.budgetSummary = budgetService.getBudgetSummary(trip);

        res.status(200).json({
            success: true,
            message: `Added ${amount} to ${category} expenses`,
            trip: tripResponse
        });

    } catch (error) {
        console.error('[trips] Add expense error:', error);
        next(error);
    }
};

/**
 * Get detailed budget summary for trip
 * GET /api/trips/:id/budget
 */
const getBudgetDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        const trip = await Trip.findOne({ 
            _id: id, 
            userId, 
            isDeleted: false 
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const budgetSummary = budgetService.getBudgetSummary(trip);
        const recommendations = budgetService.getBudgetRecommendations(trip);

        res.status(200).json({
            success: true,
            tripId: trip._id,
            tripTitle: trip.title,
            budget: budgetSummary,
            recommendations: recommendations.recommendations,
            healthScore: recommendations.budgetHealth
        });

    } catch (error) {
        console.error('[trips] Get budget details error:', error);
        next(error);
    }
};

/**
 * Get trip statistics for user
 * GET /api/trips/stats
 */
const getUserTripStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const stats = await Trip.aggregate([
            { 
                $match: { 
                    userId: userId, 
                    isDeleted: false 
                } 
            },
            {
                $group: {
                    _id: null,
                    totalTrips: { $sum: 1 },
                    totalBudgeted: { $sum: '$totalBudget' },
                    totalSpent: { $sum: '$totalSpent' },
                    avgBudget: { $avg: '$totalBudget' },
                    avgTravelers: { $avg: '$travelers' },
                    plannedTrips: {
                        $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] }
                    },
                    upcomingTrips: {
                        $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] }
                    },
                    ongoingTrips: {
                        $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
                    },
                    completedTrips: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalTrips: 0,
            totalBudgeted: 0,
            totalSpent: 0,
            avgBudget: 0,
            avgTravelers: 0,
            plannedTrips: 0,
            upcomingTrips: 0,
            ongoingTrips: 0,
            completedTrips: 0
        };

        // Get most visited destinations
        const topDestinations = await Trip.aggregate([
            { 
                $match: { 
                    userId: userId, 
                    isDeleted: false 
                } 
            },
            {
                $group: {
                    _id: '$destination.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                ...result,
                avgBudget: Math.round(result.avgBudget || 0),
                avgTravelers: Math.round(result.avgTravelers || 0),
                totalRemaining: result.totalBudgeted - result.totalSpent,
                topDestinations
            }
        });

    } catch (error) {
        console.error('[trips] Get user stats error:', error);
        next(error);
    }
};

/**
 * Estimate budget for a trip (uses budget service)
 * POST /api/trips/estimate
 * 
 * @body {string} destination - Destination city/country
 * @body {number} days - Number of days
 * @body {number} travelers - Number of travelers
 * @body {string} travelStyle - 'budget', 'moderate', 'luxury'
 */
const estimateTripBudget = async (req, res, next) => {
    try {
        const { destination, days, travelers, travelStyle } = req.body;

        if (!destination || !days || !travelers) {
            return res.status(400).json({
                success: false,
                message: 'destination, days, and travelers are required'
            });
        }

        const dailyEstimate = budgetService.estimateDailyBudget(destination, travelStyle);
        
        // Calculate total estimates
        const totalEstimate = {
            total: dailyEstimate.totalDaily * days * travelers,
            perPerson: dailyEstimate.totalDaily * days,
            perDay: dailyEstimate.totalDaily * travelers,
            breakdown: {}
        };

        for (const [category, amount] of Object.entries(dailyEstimate.daily)) {
            totalEstimate.breakdown[category] = {
                total: amount * days * travelers,
                perPerson: amount * days,
                perDay: amount * travelers
            };
        }

        res.status(200).json({
            success: true,
            estimate: {
                destination,
                days,
                travelers,
                travelStyle: dailyEstimate.style,
                region: dailyEstimate.region,
                currency: 'PKR',
                daily: dailyEstimate,
                total: totalEstimate,
                note: dailyEstimate.note
            }
        });

    } catch (error) {
        console.error('[trips] Estimate budget error:', error);
        next(error);
    }
};

/**
 * Add business activity into a trip itinerary
 * POST /api/trips/:id/add-activity
 */
const addActivityToTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const {
            businessId,
            title,
            estimatedCost = 0,
            source = 'business',
            day = 1
        } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        if (!businessId || !businessId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Valid businessId is required'
            });
        }

        const trip = await Trip.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const business = await Business.findById(businessId)
            .select('businessName businessType description address');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        let savedItinerary = await SavedItinerary.findOne({
            tripId: trip._id,
            userId,
            isDeleted: false
        });

        if (!savedItinerary) {
            const totalDays = Math.max(1, Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24)) + 1);

            savedItinerary = new SavedItinerary({
                tripId: trip._id,
                userId,
                destination: {
                    name: trip.destination?.name || 'Unknown',
                    city: trip.destination?.city || '',
                    country: trip.destination?.country || ''
                },
                tripSnapshot: {
                    title: trip.title,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    travelers: trip.travelers,
                    totalBudget: trip.totalBudget,
                    travelStyle: trip.tripType || 'moderate'
                },
                totalDays,
                days: Array.from({ length: totalDays }, (_, index) => ({
                    day: index + 1,
                    activities: [],
                    estimatedDayCost: 0
                })),
                isManuallyCreated: true,
                generationDetails: {
                    travelStyle: trip.tripType || 'moderate',
                    generatedAt: new Date(),
                    aiActivitiesCount: 0,
                    businessActivitiesCount: 0,
                    userActivitiesCount: 0
                }
            });
        }

        const normalizedDay = Math.max(1, parseInt(day) || 1);
        let targetDay = savedItinerary.days.find((d) => d.day === normalizedDay);

        if (!targetDay) {
            targetDay = { day: normalizedDay, activities: [], estimatedDayCost: 0 };
            savedItinerary.days.push(targetDay);
            savedItinerary.days.sort((a, b) => a.day - b.day);
        }

        const categoryMap = {
            hotel: 'accommodation',
            restaurant: 'food',
            transport: 'transport'
        };

        const typeMap = {
            hotel: 'hotel',
            restaurant: 'food',
            transport: 'transport',
            activity: 'attraction',
            tour: 'attraction',
            other: 'other'
        };

        const activity = {
            title: title || business.businessName,
            description: business.description || '',
            type: typeMap[business.businessType] || 'other',
            category: categoryMap[business.businessType] || 'activities',
            time: '',
            estimatedCost: Number(estimatedCost) || 0,
            costConfidence: 'user_selected',
            source,
            businessId: business._id,
            businessName: business.businessName,
            location: {
                name: business.businessName,
                address: [business.address?.street, business.address?.city, business.address?.country]
                    .filter(Boolean)
                    .join(', ')
            }
        };

        targetDay.activities.push(activity);
        savedItinerary.totalDays = Math.max(savedItinerary.totalDays || 0, savedItinerary.days.length);
        savedItinerary.isManuallyCreated = true;
        savedItinerary.generationDetails.businessActivitiesCount =
            (savedItinerary.generationDetails.businessActivitiesCount || 0) + 1;
        savedItinerary.generationDetails.generatedAt = new Date();

        savedItinerary.recalculateCosts();
        if (trip.budgetBreakdown) {
            savedItinerary.updateBudgetStatus(trip.budgetBreakdown);
        }

        await savedItinerary.save();

        res.status(200).json({
            success: true,
            message: 'Activity added to trip itinerary',
            tripId: trip._id,
            itinerary: savedItinerary
        });
    } catch (error) {
        console.error('[trips] Add activity to trip error:', error);
        next(error);
    }
};

/**
 * Add Google Place to trip itinerary
 * POST /api/trips/:id/add-place
 */
const addPlaceToTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const {
            placeId,
            title,
            type = 'other',
            category = 'activities',
            location,
            estimatedCost = 0,
            day = 1,
            source = 'user'
        } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        if (!placeId || !title) {
            return res.status(400).json({
                success: false,
                message: 'placeId and title are required'
            });
        }

        const trip = await Trip.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        let savedItinerary = await SavedItinerary.findOne({
            tripId: trip._id,
            userId,
            isDeleted: false
        });

        if (!savedItinerary) {
            const totalDays = Math.max(1, Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24)) + 1);

            savedItinerary = new SavedItinerary({
                tripId: trip._id,
                userId,
                destination: {
                    name: trip.destination?.name || 'Unknown',
                    city: trip.destination?.city || '',
                    country: trip.destination?.country || ''
                },
                tripSnapshot: {
                    title: trip.title,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    travelers: trip.travelers,
                    totalBudget: trip.totalBudget,
                    travelStyle: trip.tripType || 'moderate'
                },
                totalDays,
                days: Array.from({ length: totalDays }, (_, index) => ({
                    day: index + 1,
                    activities: [],
                    estimatedDayCost: 0
                })),
                isManuallyCreated: true,
                generationDetails: {
                    travelStyle: trip.tripType || 'moderate',
                    generatedAt: new Date(),
                    aiActivitiesCount: 0,
                    businessActivitiesCount: 0,
                    userActivitiesCount: 0
                }
            });
        }

        const normalizedDay = Math.max(1, parseInt(day) || 1);
        let targetDay = savedItinerary.days.find((d) => d.day === normalizedDay);

        if (!targetDay) {
            targetDay = { day: normalizedDay, activities: [], estimatedDayCost: 0 };
            savedItinerary.days.push(targetDay);
            savedItinerary.days.sort((a, b) => a.day - b.day);
        }

        const activity = {
            title,
            description: '',
            type,
            category,
            time: '',
            estimatedCost: Number(estimatedCost) || 0,
            costConfidence: 'user_selected',
            source,
            location: {
                name: location?.name || title,
                address: location?.address || '',
                coordinates: {
                    lat: location?.coordinates?.lat || null,
                    lng: location?.coordinates?.lng || null
                },
                placeId: placeId
            }
        };

        targetDay.activities.push(activity);
        savedItinerary.totalDays = Math.max(savedItinerary.totalDays || 0, savedItinerary.days.length);
        savedItinerary.isManuallyCreated = true;
        savedItinerary.generationDetails.userActivitiesCount =
            (savedItinerary.generationDetails.userActivitiesCount || 0) + 1;
        savedItinerary.generationDetails.generatedAt = new Date();

        savedItinerary.recalculateCosts();
        if (trip.budgetBreakdown) {
            savedItinerary.updateBudgetStatus(trip.budgetBreakdown);
        }

        await savedItinerary.save();

        res.status(200).json({
            success: true,
            message: 'Place added to trip itinerary',
            tripId: trip._id,
            itinerary: savedItinerary
        });
    } catch (error) {
        console.error('[trips] Add place to trip error:', error);
        next(error);
    }
};

/**
 * Start a trip - changes status from planning/upcoming to ongoing
 * POST /api/trips/:id/start
 */
const startTrip = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        const trip = await Trip.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // Check if trip can be started
        const validStatuses = ['planning', 'upcoming', 'confirmed', 'draft'];
        if (!validStatuses.includes(trip.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot start trip with status "${trip.status}". Trip must be in planning or upcoming state.`
            });
        }

        // Check if current date is on or after start date (with 1 day buffer)
        const now = new Date();
        const startDate = new Date(trip.startDate);
        const bufferMs = 24 * 60 * 60 * 1000; // 1 day buffer

        if (now < startDate.getTime() - bufferMs) {
            return res.status(400).json({
                success: false,
                message: 'Trip cannot be started more than 1 day before the start date'
            });
        }

        // Update trip status
        trip.status = 'ongoing';
        trip.isStarted = true;
        trip.startedAt = new Date();
        await trip.save();

        // Update itinerary status if exists
        const itinerary = await SavedItinerary.findOne({
            tripId: trip._id,
            userId,
            isDeleted: false
        });

        if (itinerary) {
            itinerary.status = 'in-progress';
            await itinerary.save();
        }

        res.status(200).json({
            success: true,
            message: 'Trip started successfully',
            trip: {
                _id: trip._id,
                title: trip.title,
                status: trip.status,
                isStarted: trip.isStarted,
                startedAt: trip.startedAt,
                startDate: trip.startDate,
                endDate: trip.endDate,
                destination: trip.destination,
                totalBudget: trip.totalBudget,
                totalSpent: trip.totalSpent,
                budgetBreakdown: trip.budgetBreakdown,
                currency: trip.currency,
            },
            itinerary: itinerary ? {
                _id: itinerary._id,
                days: itinerary.days,
                totalActivities: itinerary.totalActivities,
                totalEstimatedCost: itinerary.totalEstimatedCost,
            } : null
        });
    } catch (error) {
        console.error('[trips] Start trip error:', error);
        next(error);
    }
};

/**
 * Add place from map to trip itinerary with transport cost
 * POST /api/trips/:id/add-from-map
 */
const addFromMap = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const {
            placeId,
            name,
            type = 'attraction',
            category = 'activities',
            address,
            coordinates,
            estimatedCost = 0,
            day = 1,
            rating,
            photo,
            transportCost = 0,
            transportMode = 'car',
            distanceKm = 0
        } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trip ID format'
            });
        }

        if (!placeId || !name) {
            return res.status(400).json({
                success: false,
                message: 'placeId and name are required'
            });
        }

        const trip = await Trip.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        let savedItinerary = await SavedItinerary.findOne({
            tripId: trip._id,
            userId,
            isDeleted: false
        });

        // Check for duplicate place in itinerary
        if (savedItinerary) {
            const isDuplicate = savedItinerary.days.some(day =>
                day.activities.some(activity =>
                    activity.location?.placeId === placeId
                )
            );
            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'This place is already in your itinerary'
                });
            }
        }

        if (!savedItinerary) {
            const totalDays = Math.max(1, Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24)) + 1);

            savedItinerary = new SavedItinerary({
                tripId: trip._id,
                userId,
                destination: {
                    name: trip.destination?.name || 'Unknown',
                    city: trip.destination?.city || '',
                    country: trip.destination?.country || ''
                },
                tripSnapshot: {
                    title: trip.title,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    travelers: trip.travelers,
                    totalBudget: trip.totalBudget,
                    travelStyle: trip.tripType || 'moderate'
                },
                totalDays,
                days: Array.from({ length: totalDays }, (_, index) => ({
                    day: index + 1,
                    activities: [],
                    estimatedDayCost: 0
                })),
                isManuallyCreated: true,
                generationDetails: {
                    travelStyle: trip.tripType || 'moderate',
                    generatedAt: new Date(),
                    aiActivitiesCount: 0,
                    businessActivitiesCount: 0,
                    userActivitiesCount: 0
                }
            });
        }

        const normalizedDay = Math.max(1, parseInt(day) || 1);
        let targetDay = savedItinerary.days.find((d) => d.day === normalizedDay);

        if (!targetDay) {
            targetDay = { day: normalizedDay, activities: [], estimatedDayCost: 0 };
            savedItinerary.days.push(targetDay);
            savedItinerary.days.sort((a, b) => a.day - b.day);
        }

        // Map Google place type to activity type
        const typeMapping = {
            restaurant: 'food',
            food: 'food',
            cafe: 'food',
            lodging: 'hotel',
            hotel: 'hotel',
            tourist_attraction: 'attraction',
            attraction: 'attraction',
            shopping_mall: 'shopping',
            store: 'shopping',
            shopping: 'shopping'
        };

        // Map category based on type
        const categoryMapping = {
            food: 'food',
            hotel: 'accommodation',
            attraction: 'activities',
            shopping: 'activities'
        };

        const activityType = typeMapping[type] || 'attraction';
        const budgetCategory = categoryMapping[activityType] || 'activities';

        const activity = {
            title: name,
            description: `Added from map${rating ? ` - Rating: ${rating}★` : ''}`,
            type: activityType,
            category: budgetCategory,
            time: '',
            estimatedCost: Number(estimatedCost) || 0,
            costConfidence: 'user_selected',
            source: 'map',
            rating: rating || null,
            photo: photo || null,
            location: {
                name: name,
                address: address || '',
                coordinates: {
                    lat: coordinates?.lat || null,
                    lng: coordinates?.lng || null
                },
                placeId: placeId
            },
            addedAt: new Date()
        };

        targetDay.activities.push(activity);
        savedItinerary.totalDays = Math.max(savedItinerary.totalDays || 0, savedItinerary.days.length);
        savedItinerary.isManuallyCreated = true;
        savedItinerary.generationDetails.userActivitiesCount =
            (savedItinerary.generationDetails.userActivitiesCount || 0) + 1;
        savedItinerary.generationDetails.generatedAt = new Date();

        savedItinerary.recalculateCosts();
        if (trip.budgetBreakdown) {
            savedItinerary.updateBudgetStatus(trip.budgetBreakdown);
        }

        await savedItinerary.save();

        // Add transport cost to trip budget if provided
        const totalTransportCost = Number(transportCost) || 0;
        if (totalTransportCost > 0) {
            if (!trip.budgetBreakdown.transport) {
                trip.budgetBreakdown.transport = { amount: 0, percentage: 0, spent: 0 };
            }
            trip.budgetBreakdown.transport.spent =
                (trip.budgetBreakdown.transport.spent || 0) + totalTransportCost;
            trip.totalSpent = (trip.totalSpent || 0) + totalTransportCost;
            await trip.save();
        }

        // Add activity cost to trip budget
        const activityCost = Number(estimatedCost) || 0;
        if (activityCost > 0) {
            if (!trip.budgetBreakdown[budgetCategory]) {
                trip.budgetBreakdown[budgetCategory] = { amount: 0, percentage: 0, spent: 0 };
            }
            trip.budgetBreakdown[budgetCategory].spent =
                (trip.budgetBreakdown[budgetCategory].spent || 0) + activityCost;
            trip.totalSpent = (trip.totalSpent || 0) + activityCost;
            await trip.save();
        }

        res.status(200).json({
            success: true,
            message: 'Place added to trip',
            activity: activity,
            day: normalizedDay,
            tripId: trip._id,
            updatedBudget: {
                totalBudget: trip.totalBudget,
                totalSpent: trip.totalSpent,
                remainingBudget: trip.totalBudget - trip.totalSpent,
                breakdown: trip.budgetBreakdown,
                transportCostAdded: totalTransportCost,
                activityCostAdded: activityCost
            },
            itinerary: {
                _id: savedItinerary._id,
                days: savedItinerary.days,
                totalActivities: savedItinerary.totalActivities,
                totalEstimatedCost: savedItinerary.totalEstimatedCost
            }
        });
    } catch (error) {
        console.error('[trips] Add from map error:', error);
        next(error);
    }
};

module.exports = {
    createTrip,
    getUserTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    addActivityToTrip,
    addPlaceToTrip,
    addFromMap,
    startTrip,
    getBudgetDetails,
    getUserTripStats,
    estimateTripBudget
};
