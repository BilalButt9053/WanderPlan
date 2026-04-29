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
const Business = require('../modals/business-modal');
const openaiService = require('./openai-service');
const dynamicBudgetService = require('./dynamic-budget-service');
const {
    getActivityCoordinates,
    resolveActivityCoordinates,
    enrichItineraryWithCoordinates
} = require('./coordinate-service');
const axios = require('axios');

// Google Places API config
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Configuration
const CONFIG = {
    maxAIActivitiesPerDay: 4,      // Prefer complete day plans when real places are available
    maxStaticTemplates: 5,         // Max templates to fetch from DB
    similarityThreshold: 0.7,      // Threshold for duplicate detection
    defaultTravelStyle: 'moderate',
    budgetSafetyMargin: 0.1,       // 10% safety margin on budget
    minRating: 3.5,                // Minimum rating for places
    maxPlacesPerCategory: 10       // Max places to fetch per category
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const isValidLatLng = (lat, lng) =>
    lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

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
        travelStyle: trip.travelStyle || mapTripTypeToStyle(trip.tripType),
        costProfile: trip.costProfile || dynamicBudgetService.getDynamicCostProfile({
            destination: trip.destination?.name,
            travelStyle: trip.travelStyle || mapTripTypeToStyle(trip.tripType)
        }),
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
                        : openaiService.estimateActivityCost(
                            { type: activity.type, destination },
                            travelStyle,
                            budget?.costProfile
                        );

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
    const { destination, days, travelStyle, travelers, budget, existingActivities = [], destinationPlacePool = [] } = params;

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
            excludeActivities,
            costProfile: budget?.costProfile,
            destinationPlacePool
        });

        // Process and limit activities per day
        const processedItinerary = aiItinerary.map(day => ({
            day: day.day,
            activities: day.activities
                .slice(0, destinationPlacePool.length ? 5 : CONFIG.maxAIActivitiesPerDay)
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

const getCoordinateStats = (itinerary = []) => {
    const days = Array.isArray(itinerary) ? itinerary : itinerary?.days || [];
    let totalActivities = 0;
    let resolvedCoordinates = 0;
    let missingCoordinates = 0;

    for (const day of days) {
        for (const activity of day.activities || []) {
            totalActivities += 1;
            if (getActivityCoordinates(activity)) {
                resolvedCoordinates += 1;
            } else {
                missingCoordinates += 1;
            }
        }
    }

    return { totalActivities, resolvedCoordinates, missingCoordinates };
};

const getDuplicatePlaceCount = (itinerary = []) => {
    const days = Array.isArray(itinerary) ? itinerary : itinerary?.days || [];
    const seen = new Set();
    let duplicates = 0;

    for (const day of days) {
        for (const activity of day.activities || []) {
            const placeId = activity.placeId || activity.location?.placeId;
            if (!placeId) continue;
            if (seen.has(placeId)) {
                duplicates += 1;
            } else {
                seen.add(placeId);
            }
        }
    }

    return duplicates;
};

const logItineraryDiagnostics = (label, { destination, itinerary, placePool = [] }) => {
    const stats = getCoordinateStats(itinerary);
    const validPerDay = (Array.isArray(itinerary) ? itinerary : itinerary?.days || [])
        .map((day) => `Day ${day.day}: ${(day.activities || []).filter(getActivityCoordinates).length}/${(day.activities || []).length}`)
        .join(', ');

    console.log(
        `[itinerary-service] ${label}: destination=${destination}, googleCandidates=${placePool.length}, ` +
        `candidatesWithCoordinates=${placePool.filter((place) => getActivityCoordinates(place)).length}, ` +
        `generatedActivities=${stats.totalActivities}, duplicatePlaces=${getDuplicatePlaceCount(itinerary)}, ` +
        `missingCoordinates=${stats.missingCoordinates}, validActivitiesPerDay=[${validPerDay}]`
    );
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
        generationTime,
        placePool = []
    } = params;

    const repairedDays = await validateAndRepairItinerary({
        itinerary: days || itinerary,
        placePool,
        destination,
        days: Array.isArray(days || itinerary) ? (days || itinerary).length : (days || itinerary)?.days?.length || 1
    });
    const enrichedDays = await enrichItineraryWithCoordinates(repairedDays, destination);
    const coordinateStats = getCoordinateStats(enrichedDays);
    console.log(
        `[itinerary-service] Coordinate enrichment: totalActivities=${coordinateStats.totalActivities}, ` +
        `resolvedCoordinates=${coordinateStats.resolvedCoordinates}, missingCoordinates=${coordinateStats.missingCoordinates}`
    );

    // Check for existing itinerary
    let savedItinerary = await SavedItinerary.findByTripId(tripId);
    
    if (savedItinerary) {
        // Update existing
        savedItinerary.days = enrichedDays;
        savedItinerary.estimatedCosts = categoryCosts;
        savedItinerary.budgetStatus = budgetStatus;
        savedItinerary.version += 1;
        savedItinerary.generationDetails.regeneratedCount += 1;
        savedItinerary.generationDetails.generatedAt = new Date();
        savedItinerary.generationDetails.generationTime = generationTime;
    } else {
        // Create new
        const aiCount = enrichedDays.reduce((sum, day) =>
            sum + day.activities.filter(a => a.source === 'ai').length, 0);
        const businessCount = enrichedDays.reduce((sum, day) =>
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
            days: enrichedDays,
            totalDays: enrichedDays.length,
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

        const destinationPlacePool = await buildDestinationPlacePool({
            destination,
            budgetPlan: budgetInfo,
            costProfile: budgetInfo?.costProfile,
            days,
            travelStyle
        });

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
                existingActivities,
                destinationPlacePool
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
                travelStyle,
                budgetInfo?.costProfile
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

        // Step 7: Enrich activity coordinates and calculate statistics
        const repairedMerged = await validateAndRepairItinerary({
            itinerary: merged,
            placePool: destinationPlacePool,
            destination,
            days
        });
        const enrichedMerged = await enrichItineraryWithCoordinates(repairedMerged, destination);
        const coordinateStats = getCoordinateStats(enrichedMerged);
        console.log(
            `[itinerary-service] Generated itinerary coordinates: totalActivities=${coordinateStats.totalActivities}, ` +
            `resolvedCoordinates=${coordinateStats.resolvedCoordinates}, missingCoordinates=${coordinateStats.missingCoordinates}`
        );
        const stats = calculateItineraryStats(enrichedMerged);

        const generationTime = Date.now() - startTime;

        // Step 8: Save to database if requested
        let savedItinerary = null;
        if (saveToDb && tripId && userId) {
            savedItinerary = await saveItinerary({
                tripId,
                userId,
                trip,
                destination,
                days: enrichedMerged,
                itinerary: enrichedMerged,
                categoryCosts,
                budgetStatus,
                travelStyle,
                generationTime,
                placePool: destinationPlacePool
            });
        }

        console.log(`[itinerary-service] Hybrid itinerary generated in ${generationTime}ms`);

        return {
            success: true,
            destination,
            days: days,
            travelStyle,
            travelers: budgetInfo?.travelers || travelers,
            itinerary: enrichedMerged,
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

// ==========================================
// REAL DATA ITINERARY (AI PLAN WITH REAL PLACES)
// ==========================================

/**
 * Map Google place types to our app categories
 */
const mapGooglePlaceType = (types) => {
    if (!types || !types.length) return 'attraction';
    
    const typeMapping = {
        restaurant: 'restaurant',
        food: 'restaurant',
        cafe: 'cafe',
        bar: 'restaurant',
        bakery: 'restaurant',
        lodging: 'hotel',
        hotel: 'hotel',
        tourist_attraction: 'attraction',
        museum: 'attraction',
        park: 'activity',
        amusement_park: 'attraction',
        zoo: 'attraction',
        aquarium: 'attraction',
        art_gallery: 'attraction',
        shopping_mall: 'shopping',
        store: 'shopping',
        spa: 'attraction',
        mosque: 'attraction',
        church: 'attraction',
        temple: 'attraction',
        point_of_interest: 'activity'
    };
    
    for (const type of types) {
        if (typeMapping[type]) {
            return typeMapping[type];
        }
    }
    return 'attraction';
};

const normalizePlaceName = (name = '') =>
    String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

const getGooglePlacesKey = () => process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

const mapPoolCategoryToActivityType = (category) => {
    const normalized = String(category || '').toLowerCase();
    if (normalized === 'hotel') return 'hotel';
    if (normalized === 'restaurant' || normalized === 'cafe') return 'food';
    if (normalized === 'shopping') return 'shopping';
    return 'attraction';
};

const mapPoolCategoryToBudgetCategory = (category) => {
    const type = mapPoolCategoryToActivityType(category);
    return openaiService.getCategory(type);
};

const normalizeGooglePlaceCandidate = (place, requestedCategory, destination, travelStyle) => {
    const lat = toNumber(place.geometry?.location?.lat);
    const lng = toNumber(place.geometry?.location?.lng);
    if (!place.place_id || !isValidLatLng(lat, lng)) return null;

    const category = requestedCategory || mapGooglePlaceType(place.types);
    const priceLevel = Number.isInteger(place.price_level) ? place.price_level : null;
    const candidate = {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity || destination,
        category,
        rating: toNumber(place.rating) || 0,
        priceLevel,
        price_level: priceLevel ?? 2,
        location: {
            name: place.name,
            address: place.formatted_address || place.vicinity || destination,
            placeId: place.place_id,
            coordinates: { lat, lng }
        },
        source: 'google_places',
        coordinateStatus: 'resolved',
        types: place.types || []
    };

    candidate.estimatedCost = estimatePlaceCost(candidate, travelStyle);
    return candidate;
};

const candidateToActivity = (candidate, { time = '', description = '', source = candidate?.source || 'google_places' } = {}) => {
    const coordinates = getActivityCoordinates(candidate);
    const type = mapPoolCategoryToActivityType(candidate.category);
    const category = mapPoolCategoryToBudgetCategory(candidate.category);

    return {
        title: candidate.name,
        description: description || `Visit ${candidate.name}.`,
        type,
        category,
        time,
        estimatedCost: candidate.estimatedCost || 0,
        costConfidence: 'estimated',
        source,
        placeId: candidate.placeId || null,
        businessId: candidate.businessId || null,
        rating: candidate.rating || 0,
        location: {
            name: candidate.location?.name || candidate.name,
            address: candidate.location?.address || candidate.address || '',
            placeId: candidate.placeId || null,
            coordinates: {
                lat: coordinates?.lat ?? null,
                lng: coordinates?.lng ?? null
            }
        },
        latitude: coordinates?.lat ?? null,
        longitude: coordinates?.lng ?? null,
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
        coordinateStatus: coordinates ? 'resolved' : 'missing'
    };
};

const GENERIC_ACTIVITY_TITLES = [
    'city highlights tour',
    'restaurant lunch',
    'cultural experience',
    'local sightseeing',
    'street food tour',
    'evening walk',
    'private guided tour',
    'fine dining',
    'vip experience'
];

const isGenericActivity = (activity = {}) => {
    const title = String(activity.title || activity.name || '').toLowerCase().trim();
    return GENERIC_ACTIVITY_TITLES.some((generic) => title === generic || title.includes(generic));
};

const findMatchingCandidate = (activity = {}, placePool = []) => {
    const placeId = activity.placeId || activity.location?.placeId;
    if (placeId) {
        const byPlaceId = placePool.find((place) => place.placeId === placeId);
        if (byPlaceId) return byPlaceId;
    }

    const titleKey = normalizePlaceName(activity.title || activity.name);
    if (!titleKey) return null;

    return placePool.find((place) => normalizePlaceName(place.name) === titleKey) ||
        placePool.find((place) => {
            const candidateKey = normalizePlaceName(place.name);
            return candidateKey.length > 5 && (candidateKey.includes(titleKey) || titleKey.includes(candidateKey));
        }) ||
        null;
};

const pickUnusedCandidate = (placePool, usedPlaceIds, preferredCategories = []) => {
    const categories = preferredCategories.filter(Boolean);
    const categoryMatch = (candidate) => categories.length === 0 || categories.includes(candidate.category);
    return placePool.find((candidate) => categoryMatch(candidate) && !usedPlaceIds.has(candidate.placeId)) ||
        placePool.find((candidate) => categoryMatch(candidate)) ||
        placePool.find((candidate) => !usedPlaceIds.has(candidate.placeId)) ||
        placePool[0] ||
        null;
};

/**
 * Fetch places from Google Places API by text search
 * @param {string} destination - Destination city/location
 * @param {string} category - Category to search (restaurant, attraction, hotel)
 * @returns {Promise<Array>} Normalized places
 */
const fetchGooglePlaces = async (destination, category) => {
    const apiKey = getGooglePlacesKey();
    if (!apiKey) {
        console.warn('[itinerary-service] Google Places API key not configured');
        return [];
    }
    
    const categoryQueries = {
        restaurant: `best restaurants in ${destination}`,
        cafe: `best cafes in ${destination}`,
        attraction: `tourist attractions in ${destination}`,
        hotel: `hotels in ${destination}`,
        shopping: `shopping malls markets in ${destination}`,
        activity: `things to do in ${destination}`
    };
    
    const query = categoryQueries[category] || `${category} in ${destination}`;
    
    try {
        const response = await axios.get(`${PLACES_BASE_URL}/textsearch/json`, {
            params: {
                query,
                key: apiKey
            },
            timeout: 10000
        });
        
        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error('[itinerary-service] Google Places API error:', response.data.status);
            return [];
        }
        
        const places = (response.data.results || [])
            .map((place) => normalizeGooglePlaceCandidate(
                place,
                category === 'activity' ? mapGooglePlaceType(place.types) : category,
                destination,
                CONFIG.defaultTravelStyle
            ))
            .filter(Boolean)
            .filter(place => (place.rating || 0) >= CONFIG.minRating || !place.rating)
            .slice(0, CONFIG.maxPlacesPerCategory)
            .map(place => ({
                ...place,
                id: place.placeId,
                name: place.name,
                latitude: place.location.coordinates.lat,
                longitude: place.location.coordinates.lng,
                type: place.category,
                price_level: place.priceLevel ?? 2,
                photo: null,
                photoReference: place.photos?.[0]?.photo_reference || null
            }));
        
        console.log(`[itinerary-service] Fetched ${places.length} ${category} places from Google for ${destination}`);
        return places;
        
    } catch (error) {
        console.error('[itinerary-service] Error fetching Google Places:', error.message);
        return [];
    }
};

const deduplicatePlacePool = (places = []) => {
    const seenPlaceIds = new Set();
    const seenNames = new Set();
    const deduped = [];

    for (const place of places) {
        if (!place || !getActivityCoordinates(place)) continue;
        if (place.placeId && seenPlaceIds.has(place.placeId)) continue;

        const nameKey = normalizePlaceName(place.name);
        if (nameKey && seenNames.has(nameKey)) continue;

        if (place.placeId) seenPlaceIds.add(place.placeId);
        if (nameKey) seenNames.add(nameKey);
        deduped.push(place);
    }

    return deduped;
};

const buildDestinationPlacePool = async ({
    destination,
    budgetPlan = null,
    costProfile = null,
    days = 1,
    travelStyle = CONFIG.defaultTravelStyle
}) => {
    const apiKey = getGooglePlacesKey();
    if (!apiKey) {
        console.warn('[itinerary-service] Google Places API key not configured');
        return [];
    }

    const searches = [
        { googleType: 'tourist_attraction', category: 'attraction', query: `tourist attractions in ${destination}` },
        { googleType: 'restaurant', category: 'restaurant', query: `restaurants in ${destination}` },
        { googleType: 'cafe', category: 'cafe', query: `cafes in ${destination}` },
        { googleType: 'lodging', category: 'hotel', query: `hotels lodging in ${destination}` },
        { googleType: 'shopping_mall', category: 'shopping', query: `shopping malls markets in ${destination}` },
        { googleType: 'park', category: 'activity', query: `parks nature places in ${destination}` },
        { googleType: 'point_of_interest', category: 'activity', query: `points of interest things to do in ${destination}` }
    ];

    const responses = await Promise.all(searches.map(async (search) => {
        try {
            const response = await axios.get(`${PLACES_BASE_URL}/textsearch/json`, {
                params: {
                    query: search.query,
                    type: search.googleType,
                    key: apiKey
                },
                timeout: 10000
            });

            if (response.data?.status !== 'OK' && response.data?.status !== 'ZERO_RESULTS') {
                console.warn(`[itinerary-service] Google Places ${search.googleType} status: ${response.data?.status}`);
                return [];
            }

            return (response.data?.results || [])
                .map((place) => normalizeGooglePlaceCandidate(place, search.category, destination, travelStyle))
                .filter(Boolean)
                .filter((place) => (place.rating || 0) >= CONFIG.minRating || !place.rating)
                .slice(0, CONFIG.maxPlacesPerCategory);
        } catch (error) {
            console.warn(`[itinerary-service] Google Places ${search.googleType} failed: ${error.message}`);
            return [];
        }
    }));

    const placePool = deduplicatePlacePool(responses.flat())
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, Math.max(40, Math.min(80, Number(days || 1) * 16)));

    console.log(
        `[itinerary-service] destination=${destination}, googleCandidates=${placePool.length}, ` +
        `candidatesWithCoordinates=${placePool.filter((place) => getActivityCoordinates(place)).length}`
    );

    return placePool;
};

/**
 * Fetch businesses from database for a destination
 * @param {string} destination - Destination city/location
 * @returns {Promise<Array>} Normalized businesses
 */
const fetchDbBusinesses = async (destination) => {
    try {
        const businesses = await Business.find({
            isVerified: true,
            status: 'approved',
            $or: [
                { 'address.city': { $regex: destination, $options: 'i' } },
                { 'address.area': { $regex: destination, $options: 'i' } }
            ]
        })
        .select('businessName description businessType address geoLocation rating reviewCount')
        .limit(30)
        .lean();
        
        const normalized = businesses
            .filter(b => b.geoLocation?.coordinates?.length === 2)
            .map(b => ({
                id: b._id.toString(),
                businessId: b._id.toString(),
                name: b.businessName,
                latitude: b.geoLocation.coordinates[1], // GeoJSON: [lng, lat]
                longitude: b.geoLocation.coordinates[0],
                category: mapBusinessType(b.businessType),
                type: mapBusinessType(b.businessType),
                price_level: 2, // Default moderate
                rating: b.rating || 4.0,
                address: `${b.address?.area || ''}, ${b.address?.city || ''}`.trim(),
                source: 'business'
            }));
        
        console.log(`[itinerary-service] Fetched ${normalized.length} businesses from DB for ${destination}`);
        return normalized;
        
    } catch (error) {
        console.error('[itinerary-service] Error fetching DB businesses:', error.message);
        return [];
    }
};

/**
 * Map business type to category
 */
const mapBusinessType = (businessType) => {
    const typeMap = {
        'restaurant': 'restaurant',
        'cafe': 'restaurant',
        'hotel': 'hotel',
        'resort': 'hotel',
        'hostel': 'hotel',
        'tour_operator': 'attraction',
        'attraction': 'attraction',
        'shopping': 'shopping',
        'transport': 'transport'
    };
    return typeMap[businessType?.toLowerCase()] || 'attraction';
};

/**
 * Calculate distance between two points (Haversine formula)
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

/**
 * Remove duplicate places based on name similarity
 * @param {Array} places - Array of places
 * @returns {Array} Deduplicated places
 */
const deduplicatePlaces = (places) => {
    const seenPlaceIds = new Set();
    const seenNames = new Set();
    return places.filter(place => {
        if (!place?.name) return false;
        if (!getActivityCoordinates(place)) return false;
        if (place.placeId && seenPlaceIds.has(place.placeId)) return false;

        const key = normalizePlaceName(place.name);
        if (key && seenNames.has(key)) return false;

        if (place.placeId) seenPlaceIds.add(place.placeId);
        if (key) seenNames.add(key);
        return true;
    });
};

/**
 * Build day-wise itinerary from available places using distance-based grouping
 * @param {Array} places - All available places
 * @param {number} days - Number of trip days
 * @param {string} travelStyle - Travel style
 * @returns {Array} Day-wise itinerary
 */
const buildDayWiseItinerary = (places, days, travelStyle) => {
    // Group places by category
    const byCategory = {
        attraction: places.filter(p => p.category === 'attraction'),
        restaurant: places.filter(p => p.category === 'restaurant'),
        hotel: places.filter(p => p.category === 'hotel'),
        shopping: places.filter(p => p.category === 'shopping')
    };
    
    // Sort each category by rating
    Object.keys(byCategory).forEach(cat => {
        byCategory[cat].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    });
    
    const itinerary = [];
    const usedPlaces = new Set();
    
    for (let day = 1; day <= days; day++) {
        const dayActivities = [];
        let lastPlace = null;
        
        // Morning: 1 attraction
        const attraction = byCategory.attraction.find(p => !usedPlaces.has(p.id));
        if (attraction) {
            usedPlaces.add(attraction.id);
            const cost = estimatePlaceCost(attraction, travelStyle);
            dayActivities.push({
                title: attraction.name,
                description: `Visit ${attraction.name}`,
                type: 'attraction',
                category: 'activities',
                time: 'Morning (9:00 AM)',
                location: attraction.address || attraction.name,
                latitude: attraction.latitude,
                longitude: attraction.longitude,
                estimatedCost: cost,
                costConfidence: 'estimated',
                source: attraction.source,
                businessId: attraction.businessId || null,
                placeId: attraction.placeId || null,
                rating: attraction.rating
            });
            lastPlace = attraction;
        }
        
        // Lunch: 1 restaurant (prefer nearby)
        let restaurant = null;
        if (lastPlace) {
            // Find nearest restaurant
            const availableRestaurants = byCategory.restaurant.filter(p => !usedPlaces.has(p.id));
            if (availableRestaurants.length > 0) {
                availableRestaurants.sort((a, b) => {
                    const distA = calculateDistance(lastPlace.latitude, lastPlace.longitude, a.latitude, a.longitude);
                    const distB = calculateDistance(lastPlace.latitude, lastPlace.longitude, b.latitude, b.longitude);
                    return distA - distB;
                });
                restaurant = availableRestaurants[0];
            }
        } else {
            restaurant = byCategory.restaurant.find(p => !usedPlaces.has(p.id));
        }
        
        if (restaurant) {
            usedPlaces.add(restaurant.id);
            const cost = estimatePlaceCost(restaurant, travelStyle);
            dayActivities.push({
                title: restaurant.name,
                description: `Lunch at ${restaurant.name}`,
                type: 'food',
                category: 'food',
                time: 'Afternoon (1:00 PM)',
                location: restaurant.address || restaurant.name,
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                estimatedCost: cost,
                costConfidence: 'estimated',
                source: restaurant.source,
                businessId: restaurant.businessId || null,
                placeId: restaurant.placeId || null,
                rating: restaurant.rating
            });
            lastPlace = restaurant;
        }
        
        // Afternoon: 1 more activity (another attraction or shopping)
        let activity = byCategory.attraction.find(p => !usedPlaces.has(p.id));
        if (!activity) {
            activity = byCategory.shopping.find(p => !usedPlaces.has(p.id));
        }
        
        if (activity) {
            usedPlaces.add(activity.id);
            const cost = estimatePlaceCost(activity, travelStyle);
            dayActivities.push({
                title: activity.name,
                description: `Explore ${activity.name}`,
                type: activity.category === 'shopping' ? 'shopping' : 'attraction',
                category: 'activities',
                time: 'Afternoon (4:00 PM)',
                location: activity.address || activity.name,
                latitude: activity.latitude,
                longitude: activity.longitude,
                estimatedCost: cost,
                costConfidence: 'estimated',
                source: activity.source,
                businessId: activity.businessId || null,
                placeId: activity.placeId || null,
                rating: activity.rating
            });
        }
        
        // Evening: Dinner at another restaurant
        const dinnerRestaurant = byCategory.restaurant.find(p => !usedPlaces.has(p.id));
        if (dinnerRestaurant) {
            usedPlaces.add(dinnerRestaurant.id);
            const cost = estimatePlaceCost(dinnerRestaurant, travelStyle);
            dayActivities.push({
                title: dinnerRestaurant.name,
                description: `Dinner at ${dinnerRestaurant.name}`,
                type: 'food',
                category: 'food',
                time: 'Evening (7:00 PM)',
                location: dinnerRestaurant.address || dinnerRestaurant.name,
                latitude: dinnerRestaurant.latitude,
                longitude: dinnerRestaurant.longitude,
                estimatedCost: cost,
                costConfidence: 'estimated',
                source: dinnerRestaurant.source,
                businessId: dinnerRestaurant.businessId || null,
                placeId: dinnerRestaurant.placeId || null,
                rating: dinnerRestaurant.rating
            });
        }
        
        // Optional: Hotel (only for multi-day trips, add on first day)
        if (day === 1 && days > 1) {
            const hotel = byCategory.hotel.find(p => !usedPlaces.has(p.id));
            if (hotel) {
                usedPlaces.add(hotel.id);
                const cost = estimatePlaceCost(hotel, travelStyle);
                dayActivities.unshift({ // Add at beginning
                    title: hotel.name,
                    description: `Check-in at ${hotel.name}`,
                    type: 'hotel',
                    category: 'accommodation',
                    time: 'Check-in',
                    location: hotel.address || hotel.name,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                    estimatedCost: cost * days, // Total stay cost
                    costConfidence: 'estimated',
                    source: hotel.source,
                    businessId: hotel.businessId || null,
                    placeId: hotel.placeId || null,
                    rating: hotel.rating
                });
            }
        }
        
        itinerary.push({
            day,
            activities: dayActivities,
            estimatedDayCost: dayActivities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0)
        });
    }
    
    return itinerary;
};

const assignUniquePlacesToDays = (placePool = [], days = 1) => {
    const pool = deduplicatePlacePool(placePool);
    const usedPlaceIds = new Set();
    const itinerary = [];
    const slots = [
        { time: '09:00 AM', categories: ['attraction', 'activity'], description: (p) => `Start the day at ${p.name}.` },
        { time: '01:00 PM', categories: ['restaurant', 'cafe'], description: (p) => `Have lunch at ${p.name}.` },
        { time: '04:00 PM', categories: ['attraction', 'shopping', 'activity'], description: (p) => `Spend the afternoon exploring ${p.name}.` },
        { time: '07:30 PM', categories: ['restaurant', 'cafe'], description: (p) => `End the day with dinner at ${p.name}.` }
    ];

    for (let day = 1; day <= days; day++) {
        const activities = [];

        for (const slot of slots) {
            const candidate = pickUnusedCandidate(pool, usedPlaceIds, slot.categories);
            if (!candidate) continue;
            if (usedPlaceIds.has(candidate.placeId) && pool.length >= days * 2) continue;

            if (candidate.placeId) usedPlaceIds.add(candidate.placeId);
            activities.push(candidateToActivity(candidate, {
                time: slot.time,
                description: slot.description(candidate)
            }));
        }

        itinerary.push({
            day,
            title: `Day ${day} - Local Discovery`,
            activities,
            estimatedDayCost: activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0)
        });
    }

    return itinerary;
};

const validateAndRepairItinerary = async ({ itinerary, placePool = [], destination, days }) => {
    const pool = deduplicatePlacePool(placePool);
    const inputDays = Array.isArray(itinerary) ? itinerary : itinerary?.days || [];
    const repaired = [];
    const usedPlaceIds = new Set();
    const allowReuse = pool.length < Math.max(1, Number(days || inputDays.length || 1)) * 2;

    for (let dayNumber = 1; dayNumber <= days; dayNumber++) {
        const sourceDay = inputDays.find((day) => Number(day.day) === dayNumber) || { day: dayNumber, activities: [] };
        const activities = [];

        for (const activity of sourceDay.activities || []) {
            const match = findMatchingCandidate(activity, pool);
            const activityPlaceId = match?.placeId || activity.placeId || activity.location?.placeId;
            const duplicate = activityPlaceId && usedPlaceIds.has(activityPlaceId) && !allowReuse;
            const invalid = !getActivityCoordinates(activity) || isGenericActivity(activity) || duplicate;
            let nextActivity = null;

            if (match && !duplicate) {
                nextActivity = {
                    ...candidateToActivity(match, {
                        time: activity.time || '',
                        description: activity.description || `Visit ${match.name}.`,
                        source: activity.source === 'ai' ? 'ai' : 'google_places'
                    }),
                    title: match.name
                };
            } else if (!invalid) {
                nextActivity = {
                    ...activity,
                    source: activity.source || 'ai',
                    coordinateStatus: 'resolved'
                };
            } else {
                const preferred = activity.type === 'food' || activity.category === 'food'
                    ? ['restaurant', 'cafe']
                    : activity.type === 'shopping'
                        ? ['shopping', 'attraction', 'activity']
                        : ['attraction', 'activity', 'shopping'];
                const replacement = pickUnusedCandidate(pool, usedPlaceIds, preferred);
                if (replacement) {
                    nextActivity = candidateToActivity(replacement, {
                        time: activity.time || '',
                        description: `Visit ${replacement.name}.`
                    });
                }
            }

            if (!nextActivity && activity.title && !isGenericActivity(activity)) {
                nextActivity = await resolveActivityCoordinates(activity, destination);
            }

            if (!nextActivity) continue;

            const coordinates = getActivityCoordinates(nextActivity);
            if (!coordinates) {
                nextActivity.coordinateStatus = 'missing';
            }

            const placeId = nextActivity.placeId || nextActivity.location?.placeId;
            if (placeId && usedPlaceIds.has(placeId) && !allowReuse) continue;
            if (placeId) usedPlaceIds.add(placeId);

            activities.push(nextActivity);
        }

        const hasAttraction = activities.some((activity) =>
            ['attraction', 'shopping'].includes(activity.type) || activity.category === 'activities'
        );
        const hasFood = activities.some((activity) => activity.type === 'food' || activity.category === 'food');

        if (!hasAttraction) {
            const candidate = pickUnusedCandidate(pool, usedPlaceIds, ['attraction', 'activity', 'shopping']);
            if (candidate) {
                if (candidate.placeId) usedPlaceIds.add(candidate.placeId);
                activities.unshift(candidateToActivity(candidate, {
                    time: '09:00 AM',
                    description: `Start the day at ${candidate.name}.`
                }));
            }
        }

        if (!hasFood) {
            const candidate = pickUnusedCandidate(pool, usedPlaceIds, ['restaurant', 'cafe']);
            if (candidate) {
                if (candidate.placeId) usedPlaceIds.add(candidate.placeId);
                activities.push(candidateToActivity(candidate, {
                    time: activities.length ? '01:00 PM' : '12:30 PM',
                    description: `Eat at ${candidate.name}.`
                }));
            }
        }

        while (activities.filter(getActivityCoordinates).length < 2) {
            const candidate = pickUnusedCandidate(pool, usedPlaceIds, []);
            if (!candidate || (candidate.placeId && usedPlaceIds.has(candidate.placeId) && !allowReuse)) break;
            if (candidate.placeId) usedPlaceIds.add(candidate.placeId);
            activities.push(candidateToActivity(candidate, {
                time: activities.length ? '04:00 PM' : '10:00 AM',
                description: `Explore ${candidate.name}.`
            }));
        }

        repaired.push({
            ...sourceDay,
            day: dayNumber,
            title: sourceDay.title || `Day ${dayNumber} - Local Discovery`,
            activities,
            estimatedDayCost: activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0)
        });
    }

    return repaired;
};

const calculateCategoryCostsFromItinerary = (itinerary = []) => {
    const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
    for (const day of itinerary) {
        for (const activity of day.activities || []) {
            const category = activity.category || openaiService.getCategory(activity.type);
            const cost = activity.estimatedCost || 0;
            categoryCosts[category] = (categoryCosts[category] || 0) + cost;
            categoryCosts.total += cost;
        }
    }
    return categoryCosts;
};

/**
 * Estimate cost for a place based on price level and travel style
 * @param {Object} place - Place object
 * @param {string} travelStyle - Travel style (budget, moderate, luxury)
 * @returns {number} Estimated cost in PKR
 */
const estimatePlaceCost = (place, travelStyle) => {
    // Base cost multipliers by price level
    const priceLevel = place.price_level || 2;
    const baseCost = priceLevel * 1000; // 1000-4000 PKR base
    
    // Adjust by travel style
    const styleMultipliers = {
        budget: 0.7,
        moderate: 1.0,
        luxury: 1.8
    };
    const multiplier = styleMultipliers[travelStyle] || 1.0;
    
    // Category-specific adjustments
    const categoryMultipliers = {
        hotel: 5.0,      // Hotels are more expensive
        restaurant: 1.0,
        attraction: 0.5, // Attractions often have entry fees
        shopping: 2.0    // Shopping varies widely
    };
    const catMultiplier = categoryMultipliers[place.category] || 1.0;
    
    return Math.round(baseCost * multiplier * catMultiplier);
};

/**
 * Generate itinerary using real data from Google Places + DB
 * This is the main function for AI Plan mode
 * 
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Complete itinerary response
 */
const generateRealDataItinerary = async (params) => {
    const {
        tripId = null,
        destination,
        days,
        travelStyle = CONFIG.defaultTravelStyle,
        travelers = 1,
        userId = null,
        saveToDb = true
    } = params;
    
    console.log(`[itinerary-service] Generating real-data itinerary: ${destination}, ${days} days, ${travelStyle}`);
    
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
        
        // Step 2: Build a real Google Places candidate pool before AI planning
        const destinationPlacePool = await buildDestinationPlacePool({
            destination,
            budgetPlan: budgetInfo,
            costProfile: budgetInfo?.costProfile,
            days,
            travelStyle
        });

        // Step 3: Fetch businesses from DB
        const dbBusinesses = await fetchDbBusinesses(destination);
        
        // Step 4: Merge all places
        const allPlaces = [
            ...destinationPlacePool,
            ...dbBusinesses
        ];
        
        console.log(`[itinerary-service] Total places fetched: ${allPlaces.length}`);
        
        // Step 5: Deduplicate
        const uniquePlaces = deduplicatePlaces(allPlaces);
        console.log(`[itinerary-service] After deduplication: ${uniquePlaces.length} places`);
        
        // Step 6: If no places found, use fallback, then resolve coordinates before saving
        if (uniquePlaces.length === 0) {
            console.warn('[itinerary-service] No places found, using fallback itinerary');
            let fallbackItinerary = openaiService.generateFallbackItinerary(
                destination,
                days,
                travelStyle,
                budgetInfo?.costProfile
            );
            fallbackItinerary = await validateAndRepairItinerary({
                itinerary: fallbackItinerary,
                placePool: [],
                destination,
                days
            });
            fallbackItinerary = await enrichItineraryWithCoordinates(fallbackItinerary, destination);
            const coordinateStats = getCoordinateStats(fallbackItinerary);
            console.log(
                `[itinerary-service] Generated itinerary coordinates: totalActivities=${coordinateStats.totalActivities}, ` +
                `resolvedCoordinates=${coordinateStats.resolvedCoordinates}, missingCoordinates=${coordinateStats.missingCoordinates}`
            );
            
            // Calculate costs
            const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
            for (const day of fallbackItinerary) {
                for (const activity of day.activities) {
                    const category = activity.category || 'activities';
                    categoryCosts[category] += activity.estimatedCost || 0;
                    categoryCosts.total += activity.estimatedCost || 0;
                }
            }
            
            const budgetStatus = calculateBudgetStatus(categoryCosts, budgetInfo);
            const stats = calculateItineraryStats(fallbackItinerary);
            const generationTime = Date.now() - startTime;

            let savedItinerary = null;
            if (saveToDb && tripId && userId) {
                savedItinerary = await saveItinerary({
                    tripId,
                    userId,
                    trip,
                    destination,
                    days: fallbackItinerary,
                    itinerary: fallbackItinerary,
                    categoryCosts,
                    budgetStatus,
                    travelStyle,
                    generationTime,
                    placePool: []
                });
            }
            
            return {
                success: true,
                destination,
                days,
                travelStyle,
                travelers: budgetInfo?.travelers || travelers,
                itinerary: fallbackItinerary,
                estimatedCosts: categoryCosts,
                budgetStatus,
                budgetInfo: budgetInfo ? {
                    totalBudget: budgetInfo.totalBudget,
                    totalRemaining: budgetInfo.totalRemaining,
                    afterItinerary: budgetInfo.totalRemaining - categoryCosts.total,
                    currency: budgetInfo.currency
                } : null,
                stats,
                warnings: ['Using fallback itinerary - no real places found for this destination'],
                savedItineraryId: savedItinerary?._id || null,
                generatedAt: new Date().toISOString(),
                generationTime,
                mode: 'ai',
                dataSource: 'fallback'
            };
        }
        
        // Step 7: Ask AI to choose from the candidate pool, then repair deterministically
        let itinerary = [];
        const aiAvailable = await openaiService.isServiceAvailable();
        if (aiAvailable && destinationPlacePool.length > 0) {
            try {
                itinerary = await openaiService.generateItinerary({
                    destination,
                    days,
                    travelers: budgetInfo?.travelers || travelers,
                    travelStyle,
                    budget: budgetInfo,
                    activitiesPerDay: 4,
                    costProfile: budgetInfo?.costProfile,
                    destinationPlacePool
                });
            } catch (error) {
                console.warn('[itinerary-service] AI place-pool generation failed, using deterministic assignment:', error.message);
            }
        }

        if (!itinerary.length) {
            itinerary = assignUniquePlacesToDays(uniquePlaces, days);
        }

        itinerary = await validateAndRepairItinerary({
            itinerary,
            placePool: uniquePlaces,
            destination,
            days
        });
        itinerary = await enrichItineraryWithCoordinates(itinerary, destination);
        logItineraryDiagnostics('Generated itinerary coordinates', {
            destination,
            itinerary,
            placePool: destinationPlacePool
        });

        // Step 7.5: Optionally enhance descriptions with AI before saving
        try {
            itinerary = await openaiService.enhanceItineraryDescriptions(itinerary, destination);
        } catch (err) {
            console.warn('[itinerary-service] AI enhancement failed, using original descriptions:', err.message);
        }
        
        // Step 8: Calculate costs by category after repair
        const categoryCosts = calculateCategoryCostsFromItinerary(itinerary);
        
        // Step 9: Calculate budget status
        const budgetStatus = calculateBudgetStatus(categoryCosts, budgetInfo);
        
        // Step 10: Add budget warning if over budget (but don't block)
        const warnings = [...budgetStatus.warnings];
        if (budgetInfo && categoryCosts.total > budgetInfo.totalRemaining) {
            warnings.push(`Estimated total (${categoryCosts.total} PKR) exceeds remaining budget (${budgetInfo.totalRemaining} PKR)`);
        }
        
        // Step 11: Calculate statistics
        const stats = calculateItineraryStats(itinerary);
        
        const generationTime = Date.now() - startTime;
        
        // Step 12: Save to database if requested
        let savedItinerary = null;
        if (saveToDb && tripId && userId) {
            savedItinerary = await saveItinerary({
                tripId,
                userId,
                trip,
                destination,
                days: itinerary,
                itinerary,
                categoryCosts,
                budgetStatus,
                travelStyle,
                generationTime,
                placePool: uniquePlaces
            });
        }
        
        console.log(`[itinerary-service] Real-data itinerary generated in ${generationTime}ms with ${stats.totalActivities} activities`);
        
        return {
            success: true,
            destination,
            days,
            travelStyle,
            travelers: budgetInfo?.travelers || travelers,
            itinerary,
            estimatedCosts: categoryCosts,
            budgetStatus,
            budgetInfo: budgetInfo ? {
                totalBudget: budgetInfo.totalBudget,
                totalRemaining: budgetInfo.totalRemaining,
                afterItinerary: budgetInfo.totalRemaining - categoryCosts.total,
                currency: budgetInfo.currency
            } : null,
            stats,
            warnings,
            savedItineraryId: savedItinerary?._id || null,
            generatedAt: new Date().toISOString(),
            generationTime,
            mode: 'ai',
            dataSource: 'real_places'
        };
        
    } catch (error) {
        console.error('[itinerary-service] Error generating real-data itinerary:', error);
        throw error;
    }
};

/**
 * Get available places for manual mode (no auto-building)
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Available places grouped by category
 */
const getAvailablePlaces = async (params) => {
    const { destination, travelStyle = 'moderate' } = params;
    
    console.log(`[itinerary-service] Fetching available places for manual mode: ${destination}`);
    
    try {
        // Fetch from Google Places API (parallel)
        const [googleRestaurants, googleAttractions, googleHotels] = await Promise.all([
            fetchGooglePlaces(destination, 'restaurant'),
            fetchGooglePlaces(destination, 'attraction'),
            fetchGooglePlaces(destination, 'hotel')
        ]);
        
        // Fetch from DB
        const dbBusinesses = await fetchDbBusinesses(destination);
        
        // Merge and deduplicate
        const allPlaces = deduplicatePlaces([
            ...googleRestaurants,
            ...googleAttractions,
            ...googleHotels,
            ...dbBusinesses
        ]);
        
        // Add estimated costs
        const placesWithCosts = allPlaces.map(place => ({
            ...place,
            estimatedCost: estimatePlaceCost(place, travelStyle)
        }));
        
        // Group by category
        const byCategory = {
            restaurants: placesWithCosts.filter(p => p.category === 'restaurant'),
            attractions: placesWithCosts.filter(p => p.category === 'attraction'),
            hotels: placesWithCosts.filter(p => p.category === 'hotel'),
            shopping: placesWithCosts.filter(p => p.category === 'shopping'),
            other: placesWithCosts.filter(p => !['restaurant', 'attraction', 'hotel', 'shopping'].includes(p.category))
        };
        
        return {
            success: true,
            destination,
            totalCount: placesWithCosts.length,
            places: placesWithCosts,
            byCategory
        };
        
    } catch (error) {
        console.error('[itinerary-service] Error fetching available places:', error);
        throw error;
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
    CONFIG,
    // New real-data functions
    generateRealDataItinerary,
    getAvailablePlaces,
    fetchGooglePlaces,
    fetchDbBusinesses,
    buildDestinationPlacePool,
    validateAndRepairItinerary,
    assignUniquePlacesToDays
};
