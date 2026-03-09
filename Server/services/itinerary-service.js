/**
 * Itinerary Service - Budget-Aware Hybrid Itinerary Generation
 * 
 * Enhanced service with:
 * - Budget-aware filtering for DB templates
 * - Cost estimation and tracking per activity
 * - Dynamic budget deduction after generation
 * - Integration with Trip budget system
 * - Persistent itinerary storage
 * 
 * Features:
 * - Fetch static templates from database with budget filtering
 * - Generate dynamic content via OpenAI with budget constraints
 * - Merge and deduplicate activities
 * - Source tracking (business vs AI)
 * - Cost validation and warnings
 */

const Trip = require('../modals/trip-modal');
const ItineraryTemplate = require('../modals/itinerary-template-modal');
const SavedItinerary = require('../modals/saved-itinerary-modal');
const openaiService = require('./openai-service');

// Configuration
const CONFIG = {
    maxAIActivitiesPerDay: 2,      // Limit AI activities per day
    maxStaticTemplates: 5,         // Max templates to fetch from DB
    similarityThreshold: 0.7,      // Threshold for duplicate detection
    defaultTravelStyle: 'moderate',
    budgetSafetyMargin: 0.1       // 10% safety margin on budget
};

/**
 * Get budget information from a trip
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>} Budget information
 */
const getTripBudgetInfo = async (tripId) => {
    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new Error('Trip not found');
    }

    const budgetInfo = {
        tripId: trip._id,
        totalBudget: trip.totalBudget,
        totalSpent: trip.totalSpent,
        totalRemaining: trip.totalBudget - trip.totalSpent,
        currency: trip.currency || 'PKR',
        travelers: trip.travelers,
        days: trip.durationDays || 1,
        travelStyle: mapTripTypeToStyle(trip.tripType),
        accommodation: {
            allocated: trip.budgetBreakdown?.accommodation?.amount || 0,
            spent: trip.budgetBreakdown?.accommodation?.spent || 0,
            remaining: (trip.budgetBreakdown?.accommodation?.amount || 0) - 
                       (trip.budgetBreakdown?.accommodation?.spent || 0)
        },
        food: {
            allocated: trip.budgetBreakdown?.food?.amount || 0,
            spent: trip.budgetBreakdown?.food?.spent || 0,
            remaining: (trip.budgetBreakdown?.food?.amount || 0) - 
                       (trip.budgetBreakdown?.food?.spent || 0)
        },
        transport: {
            allocated: trip.budgetBreakdown?.transport?.amount || 0,
            spent: trip.budgetBreakdown?.transport?.spent || 0,
            remaining: (trip.budgetBreakdown?.transport?.amount || 0) - 
                       (trip.budgetBreakdown?.transport?.spent || 0)
        },
        activities: {
            allocated: trip.budgetBreakdown?.activities?.amount || 0,
            spent: trip.budgetBreakdown?.activities?.spent || 0,
            remaining: (trip.budgetBreakdown?.activities?.amount || 0) - 
                       (trip.budgetBreakdown?.activities?.spent || 0)
        }
    };

    return { trip, budgetInfo };
};

/**
 * Map trip type to travel style
 * @param {string} tripType - Trip type from model
 * @returns {string} Travel style
 */
const mapTripTypeToStyle = (tripType) => {
    const styleMap = {
        'leisure': 'moderate',
        'business': 'luxury',
        'adventure': 'moderate',
        'family': 'moderate',
        'solo': 'budget',
        'honeymoon': 'luxury',
        'group': 'budget',
        'other': 'moderate'
    };
    return styleMap[tripType] || 'moderate';
};

/**
 * Fetch static itineraries from database with budget filtering
 * @param {Object} params - Query parameters
 * @param {string} params.destination - Destination to search for
 * @param {number} params.days - Number of trip days
 * @param {string} params.travelStyle - Travel style preference
 * @param {Object} params.budget - Budget constraints
 * @returns {Promise<Array>} Array of itinerary days with source: "business"
 */
const fetchStaticItineraries = async (params) => {
    const { destination, days, travelStyle, budget = null } = params;

    console.log(`[itinerary-service] Fetching static itineraries for ${destination}`);

    try {
        // Find matching templates
        const templates = await ItineraryTemplate.findByDestination(destination, {
            travelStyle,
            days,
            limit: CONFIG.maxStaticTemplates
        });

        if (!templates || templates.length === 0) {
            console.log('[itinerary-service] No static templates found');
            return [];
        }

        console.log(`[itinerary-service] Found ${templates.length} static template(s)`);

        // Extract and normalize activities from templates
        const staticItinerary = [];
        const seenActivities = new Set();

        for (const template of templates) {
            for (const day of template.days) {
                if (day.day > days) continue;

                let dayEntry = staticItinerary.find(d => d.day === day.day);
                if (!dayEntry) {
                    dayEntry = { day: day.day, activities: [] };
                    staticItinerary.push(dayEntry);
                }

                for (const activity of day.activities) {
                    const activityKey = normalizeForComparison(activity.title);
                    if (seenActivities.has(activityKey)) continue;
                    seenActivities.add(activityKey);

                    // Get cost from activity or estimate
                    const activityCost = activity.cost?.amount || 0;
                    const category = openaiService.getCategory(activity.type);

                    // Budget filtering: skip expensive items if budget is low
                    if (budget && activityCost > 0) {
                        const categoryRemaining = budget[category]?.remaining || 0;
                        const categoryDailyBudget = categoryRemaining / days;
                        
                        // Skip if activity costs more than daily category budget
                        if (activityCost > categoryDailyBudget * 1.5) {
                            console.log(`[itinerary-service] Skipping expensive activity: ${activity.title} (${activityCost} > ${categoryDailyBudget})`);
                            continue;
                        }
                    }

                    // Estimate cost if not provided
                    const estimatedCost = activityCost > 0 
                        ? activityCost 
                        : openaiService.estimateActivityCost({ type: activity.type }, travelStyle);

                    dayEntry.activities.push({
                        title: activity.title,
                        description: activity.description || '',
                        type: activity.type,
                        category,
                        time: activity.time || '',
                        location: activity.location?.name || activity.location?.address || '',
                        estimatedCost,
                        costConfidence: activityCost > 0 ? 'exact' : 'estimated',
                        source: 'business',
                        businessId: template.business._id?.toString() || template.business.toString(),
                        businessName: template.business.businessName || null,
                        templateId: template._id.toString()
                    });
                }
            }
        }

        staticItinerary.sort((a, b) => a.day - b.day);
        return staticItinerary;

    } catch (error) {
        console.error('[itinerary-service] Error fetching static itineraries:', error.message);
        throw error;
    }
};

/**
 * Generate AI itinerary with budget awareness
 * @param {Object} params - Generation parameters
 * @returns {Promise<Array>} Array of itinerary days with source: "ai"
 */
const generateAIItinerary = async (params) => {
    const { destination, days, travelStyle, travelers, budget, existingActivities = [] } = params;

    console.log(`[itinerary-service] Generating AI itinerary for ${destination}`);

    const isAvailable = await openaiService.isServiceAvailable();
    if (!isAvailable) {
        console.warn('[itinerary-service] OpenAI service unavailable, skipping AI generation');
        return [];
    }

    try {
        const excludeActivities = existingActivities.map(a => a.title);

        // Generate itinerary with budget constraints
        const aiItinerary = await openaiService.generateItinerary({
            destination,
            days,
            travelers,
            travelStyle,
            budget,
            activitiesPerDay: CONFIG.maxAIActivitiesPerDay,
            excludeActivities
        });

        // Process and limit activities per day
        const processedItinerary = aiItinerary.map(day => ({
            day: day.day,
            activities: day.activities
                .slice(0, CONFIG.maxAIActivitiesPerDay)
                .map(activity => ({
                    ...activity,
                    source: 'ai'
                }))
        }));

        console.log(`[itinerary-service] Generated ${processedItinerary.length} AI days`);
        return processedItinerary;

    } catch (error) {
        console.error('[itinerary-service] Error generating AI itinerary:', error.message);
        return [];
    }
};

/**
 * Normalize text for comparison (duplicate detection)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalizeForComparison = (text) => {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Check if two activities are duplicates
 * @param {Object} activity1 - First activity
 * @param {Object} activity2 - Second activity
 * @returns {boolean} Whether activities are duplicates
 */
const isDuplicate = (activity1, activity2) => {
    const title1 = normalizeForComparison(activity1.title);
    const title2 = normalizeForComparison(activity2.title);

    if (title1 === title2) return true;

    if (title1.length > 5 && title2.length > 5) {
        if (title1.includes(title2) || title2.includes(title1)) {
            return true;
        }
    }

    const words1 = new Set(title1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(title2.split(/\s+/).filter(w => w.length > 2));
    
    if (words1.size === 0 || words2.size === 0) return false;

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    const similarity = intersection.size / union.size;

    return similarity >= CONFIG.similarityThreshold;
};

/**
 * Merge static and AI itineraries with budget validation
 * @param {Array} staticItinerary - Static itinerary days
 * @param {Array} aiItinerary - AI-generated itinerary days
 * @param {number} totalDays - Total requested days
 * @param {Object} budget - Budget constraints
 * @returns {Object} Merged itinerary with cost summary
 */
const mergeItineraries = (staticItinerary, aiItinerary, totalDays, budget = null) => {
    console.log('[itinerary-service] Merging itineraries');

    const mergedMap = new Map();

    // Initialize all days
    for (let i = 1; i <= totalDays; i++) {
        mergedMap.set(i, { day: i, activities: [], estimatedDayCost: 0 });
    }

    // Track costs by category
    const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
    const categoryRemaining = budget ? {
        accommodation: budget.accommodation?.remaining || Infinity,
        food: budget.food?.remaining || Infinity,
        transport: budget.transport?.remaining || Infinity,
        activities: budget.activities?.remaining || Infinity
    } : null;

    // Add static activities first (priority)
    for (const day of staticItinerary) {
        if (day.day <= totalDays) {
            const existing = mergedMap.get(day.day);
            for (const activity of day.activities) {
                // Check if adding this would exceed category budget
                if (categoryRemaining) {
                    const category = activity.category || 'activities';
                    if (categoryCosts[category] + activity.estimatedCost > categoryRemaining[category]) {
                        console.log(`[itinerary-service] Skipping ${activity.title}: would exceed ${category} budget`);
                        continue;
                    }
                }

                existing.activities.push(activity);
                existing.estimatedDayCost += activity.estimatedCost || 0;
                
                const category = activity.category || 'activities';
                categoryCosts[category] += activity.estimatedCost || 0;
                categoryCosts.total += activity.estimatedCost || 0;
            }
        }
    }

    // Add AI activities (avoiding duplicates and respecting budget)
    for (const day of aiItinerary) {
        if (day.day <= totalDays) {
            const existing = mergedMap.get(day.day);
            
            for (const aiActivity of day.activities) {
                // Check for duplicates
                const duplicate = existing.activities.some(a => isDuplicate(a, aiActivity));
                if (duplicate) {
                    console.log(`[itinerary-service] Skipping duplicate: ${aiActivity.title}`);
                    continue;
                }

                // Check budget
                if (categoryRemaining) {
                    const category = aiActivity.category || 'activities';
                    if (categoryCosts[category] + aiActivity.estimatedCost > categoryRemaining[category]) {
                        console.log(`[itinerary-service] Skipping AI ${aiActivity.title}: would exceed ${category} budget`);
                        continue;
                    }
                }

                existing.activities.push(aiActivity);
                existing.estimatedDayCost += aiActivity.estimatedCost || 0;
                
                const category = aiActivity.category || 'activities';
                categoryCosts[category] += aiActivity.estimatedCost || 0;
                categoryCosts.total += aiActivity.estimatedCost || 0;
            }
        }
    }

    // Convert to sorted array
    const merged = Array.from(mergedMap.values()).sort((a, b) => a.day - b.day);

    // Sort activities within each day by time and source
    merged.forEach(day => {
        day.activities.sort((a, b) => {
            if (a.source !== b.source) {
                return a.source === 'business' ? -1 : 1;
            }
            return parseTime(a.time) - parseTime(b.time);
        });
    });

    return { merged, categoryCosts };
};

/**
 * Parse time string to minutes for sorting
 * @param {string} timeStr - Time string
 * @returns {number} Minutes from midnight
 */
const parseTime = (timeStr) => {
    if (!timeStr) return 720;

    const normalized = String(timeStr).toLowerCase().trim();

    const relativeMap = {
        'early morning': 360,
        'morning': 540,
        'late morning': 660,
        'noon': 720,
        'afternoon': 900,
        'late afternoon': 1020,
        'evening': 1140,
        'night': 1260
    };

    for (const [key, minutes] of Object.entries(relativeMap)) {
        if (normalized.includes(key)) return minutes;
    }

    const timeMatch = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]) || 0;
        const period = timeMatch[3]?.toLowerCase();

        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    }

    return 720;
};

/**
 * Calculate budget status after itinerary generation
 * @param {Object} categoryCosts - Costs by category
 * @param {Object} budget - Original budget info
 * @returns {Object} Budget status
 */
const calculateBudgetStatus = (categoryCosts, budget) => {
    const status = {
        isWithinBudget: true,
        budgetUtilization: 0,
        warnings: [],
        categoryStatus: {}
    };

    if (!budget) return status;

    const categories = ['accommodation', 'food', 'transport', 'activities'];
    let totalAllocated = 0;
    let totalEstimated = 0;

    for (const category of categories) {
        const allocated = budget[category]?.allocated || 0;
        const spent = budget[category]?.spent || 0;
        const remaining = budget[category]?.remaining || 0;
        const estimated = categoryCosts[category] || 0;

        totalAllocated += remaining;
        totalEstimated += estimated;

        const isOverBudget = estimated > remaining;
        const utilization = remaining > 0 ? Math.round((estimated / remaining) * 100) : 0;

        status.categoryStatus[category] = {
            allocated,
            spent,
            remaining,
            estimated,
            afterItinerary: remaining - estimated,
            isOverBudget,
            utilization
        };

        if (isOverBudget) {
            status.isWithinBudget = false;
            status.warnings.push(
                `${category.charAt(0).toUpperCase() + category.slice(1)} budget exceeded by ${estimated - remaining} PKR`
            );
        } else if (utilization > 80) {
            status.warnings.push(
                `${category.charAt(0).toUpperCase() + category.slice(1)} budget ${utilization}% utilized`
            );
        }
    }

    status.budgetUtilization = totalAllocated > 0 
        ? Math.round((totalEstimated / totalAllocated) * 100) 
        : 0;

    return status;
};

/**
 * Update trip budget after itinerary generation
 * @param {string} tripId - Trip ID
 * @param {Object} categoryCosts - Costs by category from itinerary
 * @param {boolean} commitChanges - Whether to save changes to DB
 * @returns {Promise<Object>} Updated budget info
 */
const updateBudgetAfterItinerary = async (tripId, categoryCosts, commitChanges = false) => {
    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new Error('Trip not found');
    }

    const updates = {
        accommodation: categoryCosts.accommodation || 0,
        food: categoryCosts.food || 0,
        transport: categoryCosts.transport || 0,
        activities: categoryCosts.activities || 0
    };

    const projectedSpent = {
        accommodation: (trip.budgetBreakdown?.accommodation?.spent || 0) + updates.accommodation,
        food: (trip.budgetBreakdown?.food?.spent || 0) + updates.food,
        transport: (trip.budgetBreakdown?.transport?.spent || 0) + updates.transport,
        activities: (trip.budgetBreakdown?.activities?.spent || 0) + updates.activities
    };

    const projectedTotal = projectedSpent.accommodation + projectedSpent.food + 
                          projectedSpent.transport + projectedSpent.activities;

    if (commitChanges) {
        // Update spent amounts in trip
        for (const category of Object.keys(updates)) {
            if (updates[category] > 0) {
                trip.budgetBreakdown[category].spent += updates[category];
            }
        }
        trip.totalSpent = projectedTotal;
        await trip.save();
        console.log(`[itinerary-service] Updated trip budget: total spent = ${projectedTotal} PKR`);
    }

    return {
        tripId,
        estimatedAdditions: updates,
        projectedSpent,
        projectedTotal,
        projectedRemaining: trip.totalBudget - projectedTotal,
        isOverBudget: projectedTotal > trip.totalBudget
    };
};

/**
 * Save generated itinerary to database
 * @param {Object} params - Save parameters
 * @returns {Promise<Object>} Saved itinerary document
 */
const saveItinerary = async (params) => {
    const {
        tripId,
        userId,
        trip,
        destination,
        days,
        itinerary,
        categoryCosts,
        budgetStatus,
        travelStyle,
        generationTime
    } = params;

    // Check for existing itinerary
    let savedItinerary = await SavedItinerary.findByTripId(tripId);
    
    if (savedItinerary) {
        // Update existing
        savedItinerary.days = days;
        savedItinerary.estimatedCosts = categoryCosts;
        savedItinerary.budgetStatus = budgetStatus;
        savedItinerary.version += 1;
        savedItinerary.generationDetails.regeneratedCount += 1;
        savedItinerary.generationDetails.generatedAt = new Date();
        savedItinerary.generationDetails.generationTime = generationTime;
    } else {
        // Create new
        const aiCount = itinerary.reduce((sum, day) => 
            sum + day.activities.filter(a => a.source === 'ai').length, 0);
        const businessCount = itinerary.reduce((sum, day) => 
            sum + day.activities.filter(a => a.source === 'business').length, 0);

        savedItinerary = new SavedItinerary({
            tripId,
            userId,
            destination: {
                name: destination,
                city: trip?.destination?.name || destination,
                country: trip?.destination?.country || 'Pakistan'
            },
            tripSnapshot: {
                title: trip?.title || 'Trip',
                startDate: trip?.startDate,
                endDate: trip?.endDate,
                travelers: trip?.travelers || 1,
                totalBudget: trip?.totalBudget || 0,
                travelStyle
            },
            days: itinerary,
            totalDays: itinerary.length,
            estimatedCosts: categoryCosts,
            budgetStatus,
            generationDetails: {
                travelStyle,
                generatedAt: new Date(),
                aiActivitiesCount: aiCount,
                businessActivitiesCount: businessCount,
                generationTime
            }
        });
    }

    await savedItinerary.save();
    console.log(`[itinerary-service] Saved itinerary for trip ${tripId}`);

    return savedItinerary;
};

/**
 * Generate complete budget-aware hybrid itinerary
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Complete itinerary response
 */
const generateHybridItinerary = async (params) => {
    const {
        tripId = null,
        destination,
        days,
        travelStyle = CONFIG.defaultTravelStyle,
        travelers = 1,
        userId = null,
        saveToDb = true
    } = params;

    console.log(`[itinerary-service] Generating hybrid itinerary: ${destination}, ${days} days, ${travelStyle}`);

    const startTime = Date.now();
    let trip = null;
    let budgetInfo = null;

    try {
        // Step 1: Get budget info if tripId provided
        if (tripId) {
            const result = await getTripBudgetInfo(tripId);
            trip = result.trip;
            budgetInfo = result.budgetInfo;
            console.log(`[itinerary-service] Budget context loaded: ${budgetInfo.totalRemaining} PKR remaining`);
        }

        // Step 2: Fetch static itineraries with budget filtering
        const staticItinerary = await fetchStaticItineraries({
            destination,
            days,
            travelStyle,
            budget: budgetInfo
        });

        // Collect existing activities for AI exclusion
        const existingActivities = staticItinerary.flatMap(day => day.activities);

        // Step 3: Generate AI itinerary if needed
        let aiItinerary = [];
        const hasEnoughContent = staticItinerary.length >= days && 
            staticItinerary.every(day => day.activities.length >= 2);

        if (!hasEnoughContent) {
            aiItinerary = await generateAIItinerary({
                destination,
                days,
                travelStyle,
                travelers: budgetInfo?.travelers || travelers,
                budget: budgetInfo,
                existingActivities
            });
        } else {
            console.log('[itinerary-service] Sufficient static content, skipping AI generation');
        }

        // Step 3.5: Use fallback if both static and AI failed
        const totalStaticActivities = staticItinerary.reduce((sum, d) => sum + d.activities.length, 0);
        const totalAIActivities = aiItinerary.reduce((sum, d) => sum + d.activities.length, 0);
        
        if (totalStaticActivities === 0 && totalAIActivities === 0) {
            console.warn('[itinerary-service] Both static and AI returned empty, using fallback templates');
            const fallbackItinerary = openaiService.generateFallbackItinerary(
                destination, 
                days, 
                travelStyle
            );
            aiItinerary = fallbackItinerary;
        }

        // Step 4: Merge itineraries with budget validation
        const { merged, categoryCosts } = mergeItineraries(
            staticItinerary, 
            aiItinerary, 
            days, 
            budgetInfo
        );

        // Step 5: Calculate budget status
        const budgetStatus = calculateBudgetStatus(categoryCosts, budgetInfo);

        // Step 6: Validate costs
        const validation = openaiService.validateCostsAgainstBudget(merged, budgetInfo);

        // Step 7: Calculate statistics
        const stats = calculateItineraryStats(merged);

        const generationTime = Date.now() - startTime;

        // Step 8: Save to database if requested
        let savedItinerary = null;
        if (saveToDb && tripId && userId) {
            savedItinerary = await saveItinerary({
                tripId,
                userId,
                trip,
                destination,
                days: merged,
                itinerary: merged,
                categoryCosts,
                budgetStatus,
                travelStyle,
                generationTime
            });
        }

        console.log(`[itinerary-service] Hybrid itinerary generated in ${generationTime}ms`);

        return {
            success: true,
            destination,
            days: days,
            travelStyle,
            travelers: budgetInfo?.travelers || travelers,
            itinerary: merged,
            estimatedCosts: categoryCosts,
            budgetStatus,
            budgetInfo: budgetInfo ? {
                totalBudget: budgetInfo.totalBudget,
                totalRemaining: budgetInfo.totalRemaining,
                afterItinerary: budgetInfo.totalRemaining - categoryCosts.total,
                currency: budgetInfo.currency
            } : null,
            stats,
            warnings: [...budgetStatus.warnings, ...validation.warnings],
            savedItineraryId: savedItinerary?._id || null,
            generatedAt: new Date().toISOString(),
            generationTime
        };

    } catch (error) {
        console.error('[itinerary-service] Error generating hybrid itinerary:', error);
        throw error;
    }
};

/**
 * Calculate itinerary statistics
 * @param {Array} itinerary - Merged itinerary
 * @returns {Object} Statistics
 */
const calculateItineraryStats = (itinerary) => {
    let totalActivities = 0;
    let businessActivities = 0;
    let aiActivities = 0;
    const typeCount = {};

    for (const day of itinerary) {
        for (const activity of day.activities) {
            totalActivities++;
            
            if (activity.source === 'business') {
                businessActivities++;
            } else {
                aiActivities++;
            }

            const type = activity.type || 'other';
            typeCount[type] = (typeCount[type] || 0) + 1;
        }
    }

    return {
        totalDays: itinerary.length,
        totalActivities,
        businessActivities,
        aiActivities,
        avgActivitiesPerDay: totalActivities / itinerary.length || 0,
        activityTypes: typeCount,
        businessPercentage: totalActivities > 0 
            ? Math.round((businessActivities / totalActivities) * 100) 
            : 0
    };
};

/**
 * Get saved itinerary for a trip
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>} Saved itinerary
 */
const getSavedItinerary = async (tripId) => {
    const itinerary = await SavedItinerary.findByTripId(tripId);
    if (!itinerary) {
        return null;
    }
    return itinerary;
};

/**
 * Get all saved itineraries for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of itineraries
 */
const getUserItineraries = async (userId, options = {}) => {
    return SavedItinerary.findByUserId(userId, options);
};

/**
 * Get suggested destinations
 * @returns {Promise<Array>} Popular destinations
 */
const getSuggestedDestinations = async () => {
    try {
        const suggestions = await ItineraryTemplate.aggregate([
            { $match: { status: 'published', isActive: true } },
            { 
                $group: { 
                    _id: '$destination.city',
                    destination: { $first: '$destination' },
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating.average' }
                }
            },
            { $sort: { count: -1, avgRating: -1 } },
            { $limit: 10 }
        ]);

        return suggestions.map(s => ({
            name: s.destination?.name || s._id,
            city: s._id,
            country: s.destination?.country || 'Pakistan',
            templateCount: s.count,
            avgRating: Math.round((s.avgRating || 0) * 10) / 10
        }));
    } catch (error) {
        console.error('[itinerary-service] Error getting suggestions:', error);
        return [];
    }
};

module.exports = {
    generateHybridItinerary,
    fetchStaticItineraries,
    generateAIItinerary,
    mergeItineraries,
    getTripBudgetInfo,
    updateBudgetAfterItinerary,
    calculateBudgetStatus,
    saveItinerary,
    getSavedItinerary,
    getUserItineraries,
    getSuggestedDestinations,
    calculateItineraryStats,
    CONFIG
};
