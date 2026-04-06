/**
 * OpenAI Service - Budget-Aware AI Itinerary Generation
 * 
 * Enhanced service with:
 * - Budget-aware prompt generation
 * - Cost estimation per activity
 * - Category-based budget constraints
 * - Travel style mapping to price ranges
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - OPENAI_MODEL (optional): Model to use (default: gpt-3.5-turbo)
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configuration constants
const CONFIG = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 3000,
    temperature: 0.7,
    maxRetries: 3,
    retryDelay: 1000 // ms
};

/**
 * Cost estimation ranges by category and travel style (in PKR)
 */
const COST_RANGES = {
    budget: {
        accommodation: { min: 2000, max: 5000, avg: 3500 },
        food: { min: 300, max: 1000, avg: 600 },
        transport: { min: 200, max: 1000, avg: 500 },
        activities: { min: 100, max: 500, avg: 300 }
    },
    moderate: {
        accommodation: { min: 5000, max: 12000, avg: 8000 },
        food: { min: 800, max: 2500, avg: 1500 },
        transport: { min: 500, max: 2500, avg: 1500 },
        activities: { min: 300, max: 1500, avg: 800 }
    },
    luxury: {
        accommodation: { min: 15000, max: 50000, avg: 25000 },
        food: { min: 2000, max: 8000, avg: 4000 },
        transport: { min: 2000, max: 10000, avg: 5000 },
        activities: { min: 1000, max: 5000, avg: 2500 }
    }
};

/**
 * Map activity type to budget category
 */
const TYPE_TO_CATEGORY = {
    'hotel': 'accommodation',
    'accommodation': 'accommodation',
    'stay': 'accommodation',
    'lodging': 'accommodation',
    'resort': 'accommodation',
    'hostel': 'accommodation',
    'food': 'food',
    'restaurant': 'food',
    'dining': 'food',
    'meal': 'food',
    'breakfast': 'food',
    'lunch': 'food',
    'dinner': 'food',
    'cafe': 'food',
    'transport': 'transport',
    'taxi': 'transport',
    'bus': 'transport',
    'train': 'transport',
    'flight': 'transport',
    'car': 'transport',
    'attraction': 'activities',
    'sightseeing': 'activities',
    'landmark': 'activities',
    'monument': 'activities',
    'museum': 'activities',
    'park': 'activities',
    'temple': 'activities',
    'mosque': 'activities',
    'church': 'activities',
    'beach': 'activities',
    'nature': 'activities',
    'hiking': 'activities',
    'adventure': 'activities',
    'tour': 'activities',
    'activity': 'activities',
    'entertainment': 'activities',
    'shopping': 'activities',
    'market': 'activities'
};

/**
 * Get budget category from activity type
 * @param {string} type - Activity type
 * @returns {string} Budget category
 */
const getCategory = (type) => {
    const normalizedType = String(type || '').toLowerCase().trim();
    return TYPE_TO_CATEGORY[normalizedType] || 'activities';
};

/**
 * Normalize activity type to match our enum
 * @param {string} type - Raw type from AI
 * @returns {string} Normalized type
 */
const normalizeActivityType = (type) => {
    const typeMap = {
        'hotel': 'hotel',
        'accommodation': 'hotel',
        'stay': 'hotel',
        'lodging': 'hotel',
        'resort': 'hotel',
        'hostel': 'hotel',
        'food': 'food',
        'restaurant': 'food',
        'dining': 'food',
        'meal': 'food',
        'breakfast': 'food',
        'lunch': 'food',
        'dinner': 'food',
        'cafe': 'food',
        'transport': 'transport',
        'taxi': 'transport',
        'bus': 'transport',
        'attraction': 'attraction',
        'sightseeing': 'attraction',
        'landmark': 'attraction',
        'monument': 'attraction',
        'museum': 'attraction',
        'park': 'attraction',
        'temple': 'attraction',
        'mosque': 'attraction',
        'church': 'attraction',
        'beach': 'attraction',
        'nature': 'attraction',
        'hiking': 'attraction',
        'adventure': 'attraction',
        'tour': 'attraction',
        'activity': 'attraction',
        'entertainment': 'attraction',
        'shopping': 'attraction',
        'market': 'attraction'
    };

    const normalizedType = String(type || '').toLowerCase().trim();
    return typeMap[normalizedType] || 'attraction';
};

/**
 * Estimate cost for an activity based on type and travel style
 * @param {Object} activity - Activity object
 * @param {string} travelStyle - Travel style (budget, moderate, luxury)
 * @returns {number} Estimated cost in PKR
 */
const estimateActivityCost = (activity, travelStyle = 'moderate') => {
    const category = getCategory(activity.type);
    const style = ['budget', 'moderate', 'luxury'].includes(travelStyle) ? travelStyle : 'moderate';
    const range = COST_RANGES[style][category];

    // If AI provided an estimated cost, validate and use it
    if (activity.estimatedCost && typeof activity.estimatedCost === 'number') {
        const cost = Math.round(activity.estimatedCost);
        // Ensure it's within reasonable bounds for the style
        if (cost >= range.min * 0.5 && cost <= range.max * 1.5) {
            return cost;
        }
    }

    // Generate a realistic estimate within the range
    const variance = (range.max - range.min) * 0.3;
    const baseCost = range.avg;
    const randomOffset = (Math.random() - 0.5) * 2 * variance;
    
    return Math.round(baseCost + randomOffset);
};

/**
 * Normalize AI-generated itinerary to match our database schema with costs
 * @param {Array} rawActivities - Raw activities from AI response
 * @param {string} travelStyle - Travel style for cost estimation
 * @returns {Array} Normalized activities matching DB schema
 */
const normalizeItineraryResponse = (rawActivities, travelStyle = 'moderate') => {
    if (!Array.isArray(rawActivities)) {
        console.error('[openai-service] Invalid response format: expected array, got:', typeof rawActivities);
        return [];
    }

    const normalized = rawActivities.map(day => {
        const dayNum = parseInt(day.day) || 1;
        
        // Handle various response formats
        let rawActivitiesArray = [];
        if (Array.isArray(day.activities)) {
            rawActivitiesArray = day.activities;
        } else if (Array.isArray(day.places)) {
            rawActivitiesArray = day.places;
        } else if (Array.isArray(day.items)) {
            rawActivitiesArray = day.items;
        }
        
        const activities = rawActivitiesArray.map(activity => {
            const type = normalizeActivityType(activity.type || activity.category);
            const category = getCategory(type);
            const estimatedCost = estimateActivityCost(activity, travelStyle);

            return {
                title: String(activity.title || activity.name || 'Untitled Activity').trim(),
                description: String(activity.description || activity.details || '').trim(),
                type,
                category,
                time: String(activity.time || activity.timing || '').trim(),
                location: String(activity.location || activity.address || activity.place || '').trim(),
                estimatedCost,
                costConfidence: activity.estimatedCost ? 'estimated' : 'approximate',
                source: 'ai'
            };
        }).filter(a => a.title && a.title !== 'Untitled Activity');

        return {
            day: dayNum,
            activities
        };
    });

    // Filter out days with no activities
    return normalized.filter(day => day.activities.length > 0);
};

/**
 * Fallback templates for popular Pakistan destinations
 * Used when both DB and AI fail to generate itinerary
 */
const FALLBACK_TEMPLATES = {
    default: {
        budget: [
            { title: 'Local Sightseeing', description: 'Explore local attractions and landmarks', type: 'attraction', time: '10:00 AM', estimatedCost: 500 },
            { title: 'Street Food Tour', description: 'Sample local street food delicacies', type: 'food', time: '01:00 PM', estimatedCost: 800 },
            { title: 'Evening Walk', description: 'Relax with a peaceful evening walk', type: 'attraction', time: '05:00 PM', estimatedCost: 0 }
        ],
        moderate: [
            { title: 'City Highlights Tour', description: 'Visit the most popular attractions with a guide', type: 'attraction', time: '09:00 AM', estimatedCost: 2000 },
            { title: 'Restaurant Lunch', description: 'Enjoy local cuisine at a well-rated restaurant', type: 'food', time: '01:00 PM', estimatedCost: 1500 },
            { title: 'Cultural Experience', description: 'Immerse in local culture and traditions', type: 'attraction', time: '04:00 PM', estimatedCost: 1000 }
        ],
        luxury: [
            { title: 'Private Guided Tour', description: 'Exclusive tour with personal guide and transport', type: 'attraction', time: '09:00 AM', estimatedCost: 8000 },
            { title: 'Fine Dining', description: 'Premium dining experience at top restaurant', type: 'food', time: '01:00 PM', estimatedCost: 5000 },
            { title: 'VIP Experience', description: 'Exclusive access to premium attractions', type: 'attraction', time: '04:00 PM', estimatedCost: 4000 }
        ]
    },
    murree: {
        budget: [
            { title: 'Mall Road Walk', description: 'Stroll along the famous Mall Road, enjoy local snacks', type: 'attraction', time: '10:00 AM', location: 'Mall Road, Murree', estimatedCost: 200 },
            { title: 'Pindi Point', description: 'Scenic viewpoint with panoramic mountain views', type: 'attraction', time: '12:00 PM', location: 'Pindi Point, Murree', estimatedCost: 100 },
            { title: 'Local Restaurant Lunch', description: 'Try local Pakistani cuisine', type: 'food', time: '02:00 PM', location: 'Mall Road, Murree', estimatedCost: 600 },
            { title: 'Kashmir Point', description: 'Beautiful viewpoint overlooking Kashmir valley', type: 'attraction', time: '04:00 PM', location: 'Kashmir Point, Murree', estimatedCost: 100 }
        ],
        moderate: [
            { title: 'Patriata Chair Lift', description: 'Scenic chair lift ride to mountain top with stunning views', type: 'attraction', time: '09:00 AM', location: 'Patriata (New Murree)', estimatedCost: 1500 },
            { title: 'Mall Road Shopping', description: 'Shop for local handicrafts and souvenirs', type: 'attraction', time: '12:00 PM', location: 'Mall Road, Murree', estimatedCost: 2000 },
            { title: 'PC Bhurban Lunch', description: 'Lunch at the scenic Pearl Continental hotel', type: 'food', time: '02:00 PM', location: 'PC Bhurban', estimatedCost: 3000 },
            { title: 'Ayubia National Park', description: 'Nature walk and wildlife spotting', type: 'attraction', time: '05:00 PM', location: 'Ayubia National Park', estimatedCost: 500 }
        ],
        luxury: [
            { title: 'Private Car Tour', description: 'Private vehicle tour of all Murree attractions', type: 'transport', time: '09:00 AM', location: 'Murree', estimatedCost: 8000 },
            { title: 'Bhurban Golf Course', description: 'Golf at the scenic Bhurban course', type: 'attraction', time: '11:00 AM', location: 'Bhurban', estimatedCost: 10000 },
            { title: 'Fine Dining at PC', description: 'Gourmet meal at Pearl Continental', type: 'food', time: '02:00 PM', location: 'PC Bhurban', estimatedCost: 6000 },
            { title: 'Spa Treatment', description: 'Relaxing spa session at luxury hotel', type: 'attraction', time: '05:00 PM', location: 'PC Bhurban', estimatedCost: 8000 }
        ]
    },
    lahore: {
        budget: [
            { title: 'Badshahi Mosque', description: 'Visit the iconic Mughal-era mosque', type: 'attraction', time: '09:00 AM', location: 'Badshahi Mosque, Lahore', estimatedCost: 100 },
            { title: 'Food Street', description: 'Famous street food experience', type: 'food', time: '12:00 PM', location: 'Fort Road Food Street', estimatedCost: 800 },
            { title: 'Lahore Fort', description: 'Explore the UNESCO World Heritage site', type: 'attraction', time: '03:00 PM', location: 'Lahore Fort', estimatedCost: 500 },
            { title: 'Anarkali Bazaar', description: 'Shop at the historic bazaar', type: 'attraction', time: '05:00 PM', location: 'Anarkali Bazaar', estimatedCost: 0 }
        ],
        moderate: [
            { title: 'Guided Old City Tour', description: 'Walking tour of Walled City with guide', type: 'attraction', time: '09:00 AM', location: 'Walled City, Lahore', estimatedCost: 3000 },
            { title: 'Coco\'s Den Lunch', description: 'Popular restaurant with great ambiance', type: 'food', time: '01:00 PM', location: 'Coco\'s Den, M.M. Alam Road', estimatedCost: 2500 },
            { title: 'Shalimar Gardens', description: 'Beautiful Mughal garden tour', type: 'attraction', time: '04:00 PM', location: 'Shalimar Gardens', estimatedCost: 300 },
            { title: 'Packages Mall', description: 'Shopping and entertainment', type: 'attraction', time: '06:00 PM', location: 'Packages Mall', estimatedCost: 1500 }
        ],
        luxury: [
            { title: 'Private Heritage Tour', description: 'Exclusive tour with historian guide', type: 'attraction', time: '09:00 AM', location: 'Lahore Heritage Sites', estimatedCost: 15000 },
            { title: 'Haveli Restaurant', description: 'Fine dining with Badshahi Mosque view', type: 'food', time: '01:00 PM', location: 'Cooco\'s Den Haveli', estimatedCost: 5000 },
            { title: 'Art Gallery Visit', description: 'Private viewing at Alhamra Arts Council', type: 'attraction', time: '04:00 PM', location: 'Alhamra Arts Council', estimatedCost: 2000 },
            { title: 'Dinner at Nishat', description: 'Premium dining experience', type: 'food', time: '08:00 PM', location: 'Nishat Hotels', estimatedCost: 8000 }
        ]
    },
    islamabad: {
        budget: [
            { title: 'Faisal Mosque', description: 'Visit the beautiful national mosque', type: 'attraction', time: '09:00 AM', location: 'Faisal Mosque, Islamabad', estimatedCost: 0 },
            { title: 'Daman-e-Koh', description: 'Scenic viewpoint in Margalla Hills', type: 'attraction', time: '11:00 AM', location: 'Daman-e-Koh', estimatedCost: 100 },
            { title: 'Local Food at F-7', description: 'Affordable dining in F-7 Markaz', type: 'food', time: '01:00 PM', location: 'F-7 Markaz', estimatedCost: 800 },
            { title: 'Pakistan Monument', description: 'National monument and museum', type: 'attraction', time: '04:00 PM', location: 'Pakistan Monument', estimatedCost: 200 }
        ],
        moderate: [
            { title: 'Trail 3 Hiking', description: 'Scenic hiking trail in Margalla Hills', type: 'attraction', time: '07:00 AM', location: 'Trail 3, Margalla Hills', estimatedCost: 0 },
            { title: 'Monal Brunch', description: 'Popular hilltop restaurant with views', type: 'food', time: '11:00 AM', location: 'Monal Restaurant', estimatedCost: 3500 },
            { title: 'Lok Virsa Museum', description: 'Explore Pakistani culture and heritage', type: 'attraction', time: '03:00 PM', location: 'Lok Virsa Museum', estimatedCost: 300 },
            { title: 'Centaurus Mall', description: 'Shopping and entertainment complex', type: 'attraction', time: '06:00 PM', location: 'Centaurus Mall', estimatedCost: 2000 }
        ],
        luxury: [
            { title: 'Serena Hotel Breakfast', description: 'Premium buffet at 5-star hotel', type: 'food', time: '08:00 AM', location: 'Serena Hotel', estimatedCost: 5000 },
            { title: 'Private City Tour', description: 'Chauffeur-driven tour of Islamabad', type: 'transport', time: '10:00 AM', location: 'Islamabad', estimatedCost: 10000 },
            { title: 'Lunch at Tuscany Courtyard', description: 'Upscale Italian dining', type: 'food', time: '01:00 PM', location: 'Tuscany Courtyard', estimatedCost: 6000 },
            { title: 'Spa at Serena', description: 'Luxury spa and wellness', type: 'attraction', time: '04:00 PM', location: 'Serena Hotel Spa', estimatedCost: 12000 }
        ]
    }
};

/**
 * Generate fallback itinerary when AI/DB fails
 * @param {string} destination - Destination name
 * @param {number} days - Number of days
 * @param {string} travelStyle - Travel style
 * @returns {Array} Fallback itinerary
 */
const generateFallbackItinerary = (destination, days, travelStyle = 'moderate') => {
    console.log(`[openai-service] Generating fallback itinerary for ${destination}, ${days} days, ${travelStyle}`);
    
    // Normalize destination to find template
    const normalizedDest = destination.toLowerCase().replace(/[^a-z]/g, '');
    const templates = FALLBACK_TEMPLATES[normalizedDest] || FALLBACK_TEMPLATES.default;
    const style = ['budget', 'moderate', 'luxury'].includes(travelStyle) ? travelStyle : 'moderate';
    const dayActivities = templates[style];
    
    const itinerary = [];
    for (let i = 1; i <= days; i++) {
        // Rotate activities to create variety across days
        const activities = dayActivities.map((activity, idx) => ({
            ...activity,
            title: i > 1 ? `${activity.title} - Day ${i}` : activity.title,
            type: normalizeActivityType(activity.type),
            category: getCategory(activity.type),
            location: activity.location || destination,
            source: 'fallback'
        }));
        
        itinerary.push({ day: i, activities });
    }
    
    return itinerary;
};

/**
 * Build budget-aware prompt for OpenAI
 * @param {Object} params - Generation parameters
 * @returns {string} Constructed prompt
 */
const buildBudgetAwarePrompt = (params) => {
    const {
        destination,
        days,
        travelers = 1,
        travelStyle = 'moderate',
        activitiesPerDay = 2,
        budget = null,
        excludeActivities = []
    } = params;

    // Budget constraint text
    let budgetConstraints = '';
    if (budget) {
        const dailyBudget = Math.round(budget.totalRemaining / days);
        budgetConstraints = `
BUDGET CONSTRAINTS (IMPORTANT - Follow strictly):
- Total Remaining Budget: ${budget.totalRemaining} PKR
- Daily Budget: ~${dailyBudget} PKR per day
- Per Person Budget: ~${Math.round(dailyBudget / travelers)} PKR per person per day

Category Budgets (remaining):
- Accommodation: ${budget.accommodation?.remaining || 0} PKR total
- Food: ${budget.food?.remaining || 0} PKR total  
- Transport: ${budget.transport?.remaining || 0} PKR total
- Activities: ${budget.activities?.remaining || 0} PKR total

Budget Rules:
- Keep each activity cost within the category budget limits
- For ${travelStyle} travel: ${getBudgetGuidelines(travelStyle)}
- Include estimated_cost for each activity in PKR
- DO NOT suggest expensive/luxury options if remaining budget is low
`;
    }

    // Exclusion list
    const exclusionText = excludeActivities.length > 0
        ? `\n\nEXCLUDE these activities (already in itinerary):\n${excludeActivities.map(a => `- ${a}`).join('\n')}`
        : '';

    // Main prompt
    const prompt = `Generate a ${days}-day travel itinerary for ${destination} for ${travelers} traveler(s).
Travel Style: ${travelStyle.toUpperCase()}
${budgetConstraints}

For each day, provide exactly ${activitiesPerDay} unique activities.

Return ONLY a valid JSON array with this EXACT structure:
[
  {
    "day": 1,
    "activities": [
      {
        "title": "Activity Name",
        "description": "Brief description (2-3 sentences)",
        "type": "hotel" | "food" | "attraction" | "transport",
        "time": "Suggested time (e.g., 09:00 AM)",
        "location": "Specific location/address",
        "estimatedCost": 1500
      }
    ]
  }
]

REQUIREMENTS:
1. Activities must be real places specific to ${destination}
2. Include a mix of accommodation, food, and attractions
3. estimatedCost MUST be a NUMBER in PKR (not a string)
4. Costs must be realistic for ${travelStyle} travel in Pakistan
5. Time suggestions should be realistic
6. Each activity needs a specific location
${exclusionText}

COST GUIDELINES for ${travelStyle} style:
${getCostGuidelines(travelStyle)}

Return ONLY the JSON array, no additional text or markdown.`;

    return prompt;
};

/**
 * Get budget guidelines based on travel style
 * @param {string} style - Travel style
 * @returns {string} Budget guidelines
 */
const getBudgetGuidelines = (style) => {
    const guidelines = {
        budget: 'Focus on budget-friendly options: hostels, street food, local transport, free attractions',
        moderate: 'Balance comfort and cost: mid-range hotels, good restaurants, comfortable transport',
        luxury: 'Premium experiences: luxury hotels, fine dining, private transport, exclusive tours'
    };
    return guidelines[style] || guidelines.moderate;
};

/**
 * Get cost guidelines for prompt
 * @param {string} style - Travel style
 * @returns {string} Cost guidelines text
 */
const getCostGuidelines = (style) => {
    const ranges = COST_RANGES[style] || COST_RANGES.moderate;
    return `
- Accommodation: ${ranges.accommodation.min}-${ranges.accommodation.max} PKR per night
- Food/Meals: ${ranges.food.min}-${ranges.food.max} PKR per meal
- Transport: ${ranges.transport.min}-${ranges.transport.max} PKR per trip
- Activities: ${ranges.activities.min}-${ranges.activities.max} PKR per activity`;
};

/**
 * Generate budget-aware itinerary using OpenAI
 * @param {Object} params - Generation parameters
 * @param {string} params.destination - Destination city/location
 * @param {number} params.days - Number of days
 * @param {number} params.travelers - Number of travelers
 * @param {string} params.travelStyle - Travel style (budget, moderate, luxury)
 * @param {Object} params.budget - Budget information
 * @param {number} params.activitiesPerDay - Max activities per day (default: 2)
 * @param {Array} params.excludeActivities - Activities to exclude
 * @returns {Promise<Array>} Generated itinerary days with costs
 */
const generateItinerary = async (params) => {
    const {
        destination,
        days,
        travelers = 1,
        travelStyle = 'moderate',
        budget = null,
        activitiesPerDay = 2,
        excludeActivities = []
    } = params;

    // Validate inputs
    if (!destination || !days) {
        throw new Error('Destination and days are required');
    }

    // Build budget-aware prompt
    const prompt = buildBudgetAwarePrompt({
        destination,
        days,
        travelers,
        travelStyle,
        budget,
        activitiesPerDay,
        excludeActivities
    });

    let lastError = null;

    // Retry logic for resilience
    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
        try {
            console.log(`[openai-service] Generating budget-aware itinerary (attempt ${attempt}/${CONFIG.maxRetries})`);
            console.log(`[openai-service] Budget context: ${budget ? 'Yes' : 'No'}, Style: ${travelStyle}`);

            const completion = await openai.chat.completions.create({
                model: CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional travel planner specializing in Pakistan tourism. 
You create practical, budget-conscious itineraries with accurate cost estimates.
You ALWAYS respond with valid JSON only - no markdown, no explanations.
Your cost estimates are based on real market prices in PKR.
You understand budget constraints and never suggest activities exceeding the available budget.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: CONFIG.maxTokens,
                temperature: CONFIG.temperature
            });

            const responseText = completion.choices[0]?.message?.content?.trim();
            
            if (!responseText) {
                throw new Error('Empty response from OpenAI');
            }

            console.log('[openai-service] Raw AI response (first 500 chars):', responseText.substring(0, 500));

            // Parse JSON response with multiple fallback strategies
            let parsedResponse;
            try {
                // Clean markdown code blocks
                let cleanedResponse = responseText
                    .replace(/```json\s*/gi, '')
                    .replace(/```\s*/g, '')
                    .trim();
                
                // Try to extract JSON array if response has extra text
                const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    cleanedResponse = jsonMatch[0];
                }
                
                parsedResponse = JSON.parse(cleanedResponse);
                
                // Validate structure
                if (!Array.isArray(parsedResponse)) {
                    // Check if it's wrapped in an object
                    if (parsedResponse.days && Array.isArray(parsedResponse.days)) {
                        parsedResponse = parsedResponse.days;
                    } else if (parsedResponse.itinerary && Array.isArray(parsedResponse.itinerary)) {
                        parsedResponse = parsedResponse.itinerary;
                    } else {
                        throw new Error('Response is not an array');
                    }
                }
            } catch (parseError) {
                console.error('[openai-service] JSON parse error:', parseError.message);
                console.error('[openai-service] Raw response:', responseText.substring(0, 1000));
                throw new Error('Invalid JSON response from OpenAI: ' + parseError.message);
            }

            // Normalize and validate the response with cost estimation
            const normalizedItinerary = normalizeItineraryResponse(parsedResponse, travelStyle);

            // Validate we have actual content
            const totalActivities = normalizedItinerary.reduce((sum, day) => sum + day.activities.length, 0);
            
            if (normalizedItinerary.length === 0 || totalActivities === 0) {
                console.warn('[openai-service] Normalized itinerary has no activities, using fallback');
                throw new Error('No valid activities in AI response');
            }

            // Calculate total estimated cost
            const totalCost = normalizedItinerary.reduce((sum, day) => {
                return sum + day.activities.reduce((daySum, act) => daySum + (act.estimatedCost || 0), 0);
            }, 0);

            console.log(`[openai-service] Successfully generated ${normalizedItinerary.length} days with ${totalActivities} activities, total cost: ${totalCost} PKR`);
            
            return normalizedItinerary;

        } catch (error) {
            lastError = error;
            console.error(`[openai-service] Attempt ${attempt} failed:`, error.message);

            if (attempt < CONFIG.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * attempt));
            }
        }
    }

    throw new Error(`Failed to generate itinerary after ${CONFIG.maxRetries} attempts: ${lastError.message}`);
};

/**
 * Generate travel tips for a destination
 * @param {string} destination - Destination name
 * @param {string} travelStyle - Travel style
 * @returns {Promise<Object>} Travel tips object
 */
const generateTravelTips = async (destination, travelStyle = 'moderate') => {
    try {
        const completion = await openai.chat.completions.create({
            model: CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a knowledgeable travel advisor. Provide practical, concise travel tips.'
                },
                {
                    role: 'user',
                    content: `Provide travel tips for ${destination} for ${travelStyle} travelers. Return as JSON:
{
    "bestTimeToVisit": "string",
    "localCurrency": "string",
    "language": "string",
    "safetyTips": ["tip1", "tip2", "tip3"],
    "packingEssentials": ["item1", "item2", "item3"],
    "localCustoms": ["custom1", "custom2"],
    "budgetTips": ["tip1", "tip2"],
    "avgDailyCost": { "budget": number, "moderate": number, "luxury": number }
}
Return ONLY valid JSON.`
                }
            ],
            max_tokens: 800,
            temperature: 0.6
        });

        const responseText = completion.choices[0]?.message?.content?.trim();
        const cleanedResponse = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('[openai-service] Failed to generate travel tips:', error.message);
        return {
            bestTimeToVisit: 'Varies by season',
            localCurrency: 'PKR (Pakistani Rupee)',
            language: 'Urdu, English widely spoken',
            safetyTips: ['Stay aware of surroundings', 'Keep valuables secure', 'Use registered transport'],
            packingEssentials: ['Weather-appropriate clothing', 'Travel documents', 'Power adapter'],
            localCustoms: ['Respect local traditions', 'Dress modestly at religious sites'],
            budgetTips: ['Compare prices', 'Book in advance', 'Eat at local restaurants'],
            avgDailyCost: { budget: 5000, moderate: 15000, luxury: 50000 }
        };
    }
};

/**
 * Check if OpenAI service is configured and available
 * @returns {Promise<boolean>} Whether the service is available
 */
const isServiceAvailable = async () => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('[openai-service] OPENAI_API_KEY not configured');
        return false;
    }

    try {
        await openai.models.list();
        return true;
    } catch (error) {
        console.error('[openai-service] Service unavailable:', error.message);
        return false;
    }
};

/**
 * Validate and adjust costs based on budget constraints
 * @param {Array} itinerary - Generated itinerary
 * @param {Object} budget - Budget constraints
 * @returns {Object} Validated itinerary with adjustments
 */
const validateCostsAgainstBudget = (itinerary, budget) => {
    if (!budget) return { itinerary, warnings: [], isValid: true };

    const warnings = [];
    const categoryCosts = { accommodation: 0, food: 0, transport: 0, activities: 0 };

    // Calculate total costs per category
    for (const day of itinerary) {
        for (const activity of day.activities) {
            const category = activity.category || 'activities';
            categoryCosts[category] += activity.estimatedCost || 0;
        }
    }

    // Check against budget limits
    let isValid = true;
    for (const [category, cost] of Object.entries(categoryCosts)) {
        const remaining = budget[category]?.remaining || 0;
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        
        if (cost > remaining) {
            isValid = false;
            warnings.push(
                `${categoryName} budget exceeded by Rs ${cost - remaining} (estimated: Rs ${cost}, remaining: Rs ${remaining})`
            );
        } else if (cost > remaining * 0.9) {
            const utilization = Math.round((cost / remaining) * 100);
            warnings.push(
                `${categoryName} budget ${utilization}% utilized (estimated: Rs ${cost}, remaining: Rs ${remaining})`
            );
        }
    }

    return { itinerary, warnings, isValid, categoryCosts };
};

/**
 * Enhance itinerary descriptions using AI
 * This is used to improve descriptions of real places without generating fake places
 * 
 * @param {Array} itinerary - Day-wise itinerary
 * @param {string} destination - Trip destination
 * @returns {Promise<Array>} Enhanced itinerary with improved descriptions
 */
const enhanceItineraryDescriptions = async (itinerary, destination) => {
    // Check if AI service is available
    const available = await isServiceAvailable();
    if (!available) {
        console.warn('[openai-service] AI not available for description enhancement');
        return itinerary;
    }
    
    try {
        // Prepare a list of activities that need enhanced descriptions
        const activitiesForEnhancement = [];
        for (const day of itinerary) {
            for (const activity of day.activities) {
                activitiesForEnhancement.push({
                    name: activity.title,
                    type: activity.type,
                    currentDescription: activity.description
                });
            }
        }
        
        // Limit to avoid token limits
        const toEnhance = activitiesForEnhancement.slice(0, 10);
        
        const prompt = `You are a travel writer. Improve these activity descriptions for a trip to ${destination}. 
Keep descriptions brief (1-2 sentences), engaging, and informative.
Only provide descriptions, not new places.

Activities to enhance:
${toEnhance.map((a, i) => `${i + 1}. ${a.name} (${a.type}): "${a.currentDescription}"`).join('\n')}

Respond with a JSON array of improved descriptions in the same order:
["improved description 1", "improved description 2", ...]`;

        const response = await openai.chat.completions.create({
            model: CONFIG.model,
            messages: [
                { role: 'system', content: 'You are a helpful travel content writer. Respond only with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });
        
        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
            return itinerary;
        }
        
        // Parse the enhanced descriptions
        let enhancedDescriptions;
        try {
            // Extract JSON array from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                enhancedDescriptions = JSON.parse(jsonMatch[0]);
            } else {
                return itinerary;
            }
        } catch (parseError) {
            console.warn('[openai-service] Failed to parse enhanced descriptions:', parseError.message);
            return itinerary;
        }
        
        // Apply enhanced descriptions back to itinerary
        let enhanceIndex = 0;
        const enhancedItinerary = itinerary.map(day => ({
            ...day,
            activities: day.activities.map(activity => {
                if (enhanceIndex < enhancedDescriptions.length && enhanceIndex < 10) {
                    const enhanced = enhancedDescriptions[enhanceIndex];
                    enhanceIndex++;
                    return {
                        ...activity,
                        description: typeof enhanced === 'string' ? enhanced : activity.description
                    };
                }
                return activity;
            })
        }));
        
        console.log(`[openai-service] Enhanced ${enhanceIndex} activity descriptions`);
        return enhancedItinerary;
        
    } catch (error) {
        console.error('[openai-service] Error enhancing descriptions:', error.message);
        return itinerary; // Return original on error
    }
};

module.exports = {
    generateItinerary,
    generateTravelTips,
    normalizeItineraryResponse,
    normalizeActivityType,
    estimateActivityCost,
    validateCostsAgainstBudget,
    isServiceAvailable,
    getCategory,
    generateFallbackItinerary,
    enhanceItineraryDescriptions,
    COST_RANGES,
    TYPE_TO_CATEGORY,
    FALLBACK_TEMPLATES,
    CONFIG
};
