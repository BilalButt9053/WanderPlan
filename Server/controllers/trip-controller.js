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
            tripType
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

module.exports = {
    createTrip,
    getUserTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    getBudgetDetails,
    getUserTripStats,
    estimateTripBudget
};
