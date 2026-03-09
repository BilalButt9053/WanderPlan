/**
 * Budget Service - Reusable budget calculation engine
 * 
 * This service handles all budget-related calculations for trip planning.
 * Designed to be extensible for future integrations with:
 * - Google Places API (accommodation/restaurant pricing)
 * - Maps API (transport cost estimation)
 * - Dynamic pricing adjustments
 */

// Default budget allocation percentages
const DEFAULT_BUDGET_PERCENTAGES = {
    accommodation: 40,
    food: 25,
    transport: 20,
    activities: 15
};

// Budget category configurations (for validation and extensibility)
const BUDGET_CATEGORIES = {
    accommodation: {
        name: 'Accommodation',
        description: 'Hotels, hostels, Airbnb, etc.',
        icon: 'bed',
        color: '#4CAF50'
    },
    food: {
        name: 'Food & Dining',
        description: 'Restaurants, groceries, snacks',
        icon: 'utensils',
        color: '#FF9800'
    },
    transport: {
        name: 'Transportation',
        description: 'Flights, taxis, fuel, public transport',
        icon: 'car',
        color: '#2196F3'
    },
    activities: {
        name: 'Activities & Entertainment',
        description: 'Tours, attractions, events',
        icon: 'ticket',
        color: '#9C27B0'
    }
};

/**
 * Calculate budget breakdown from total budget
 * @param {number} totalBudget - Total trip budget
 * @param {Object} customPercentages - Optional custom percentages for each category
 * @returns {Object} Budget breakdown with amounts and percentages
 * 
 * @example
 * calculateBudgetBreakdown(100000)
 * // Returns:
 * // {
 * //   accommodation: { amount: 40000, percentage: 40, spent: 0 },
 * //   food: { amount: 25000, percentage: 25, spent: 0 },
 * //   transport: { amount: 20000, percentage: 20, spent: 0 },
 * //   activities: { amount: 15000, percentage: 15, spent: 0 }
 * // }
 */
const calculateBudgetBreakdown = (totalBudget, customPercentages = null) => {
    // Validate total budget
    if (!totalBudget || totalBudget <= 0) {
        throw new Error('Total budget must be a positive number');
    }

    // Use custom percentages or defaults
    const percentages = customPercentages 
        ? validateAndNormalizePercentages(customPercentages)
        : DEFAULT_BUDGET_PERCENTAGES;

    // Calculate breakdown
    const breakdown = {};
    
    for (const [category, percentage] of Object.entries(percentages)) {
        breakdown[category] = {
            amount: Math.round((totalBudget * percentage) / 100),
            percentage: percentage,
            spent: 0
        };
    }

    return breakdown;
};

/**
 * Validate and normalize custom percentages
 * Ensures percentages add up to 100
 * @param {Object} percentages - Custom percentage allocations
 * @returns {Object} Validated percentages
 */
const validateAndNormalizePercentages = (percentages) => {
    const requiredCategories = ['accommodation', 'food', 'transport', 'activities'];
    
    // Check all required categories exist
    for (const category of requiredCategories) {
        if (typeof percentages[category] !== 'number') {
            throw new Error(`Missing or invalid percentage for category: ${category}`);
        }
        if (percentages[category] < 0 || percentages[category] > 100) {
            throw new Error(`Percentage for ${category} must be between 0 and 100`);
        }
    }

    // Check total equals 100
    const total = requiredCategories.reduce((sum, cat) => sum + percentages[cat], 0);
    
    if (Math.abs(total - 100) > 0.01) {
        throw new Error(`Percentages must add up to 100, got ${total}`);
    }

    return {
        accommodation: percentages.accommodation,
        food: percentages.food,
        transport: percentages.transport,
        activities: percentages.activities
    };
};

/**
 * Get detailed budget summary with calculations
 * @param {Object} trip - Trip document
 * @returns {Object} Comprehensive budget summary
 */
const getBudgetSummary = (trip) => {
    const { totalBudget, totalSpent, budgetBreakdown, travelers } = trip;
    const durationDays = trip.durationDays || 1;

    // Calculate remaining budgets per category
    const categoryDetails = {};
    for (const [category, data] of Object.entries(budgetBreakdown.toObject ? budgetBreakdown.toObject() : budgetBreakdown)) {
        categoryDetails[category] = {
            ...data,
            ...BUDGET_CATEGORIES[category],
            remaining: data.amount - data.spent,
            percentageUsed: data.amount > 0 ? Math.round((data.spent / data.amount) * 100) : 0,
            perDay: Math.round(data.amount / durationDays),
            perPerson: Math.round(data.amount / travelers)
        };
    }

    return {
        total: totalBudget,
        spent: totalSpent,
        remaining: totalBudget - totalSpent,
        percentageUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        perDay: Math.round(totalBudget / durationDays),
        perPerson: Math.round(totalBudget / travelers),
        perPersonPerDay: Math.round(totalBudget / travelers / durationDays),
        categories: categoryDetails,
        currency: trip.currency || 'PKR'
    };
};

/**
 * Recalculate budget breakdown when total budget changes
 * Preserves spent amounts and adjusts allocated amounts
 * @param {Object} currentBreakdown - Existing budget breakdown
 * @param {number} newTotalBudget - New total budget
 * @returns {Object} Updated budget breakdown
 */
const recalculateBudget = (currentBreakdown, newTotalBudget) => {
    if (!newTotalBudget || newTotalBudget <= 0) {
        throw new Error('New total budget must be a positive number');
    }

    const breakdown = {};
    const categories = ['accommodation', 'food', 'transport', 'activities'];

    for (const category of categories) {
        const current = currentBreakdown[category] || {};
        const percentage = current.percentage || DEFAULT_BUDGET_PERCENTAGES[category];
        
        breakdown[category] = {
            amount: Math.round((newTotalBudget * percentage) / 100),
            percentage: percentage,
            spent: current.spent || 0
        };
    }

    return breakdown;
};

/**
 * Estimate daily budget based on destination (placeholder for future API integration)
 * @param {string} destination - Destination city/country
 * @param {string} travelStyle - 'budget', 'moderate', 'luxury'
 * @returns {Object} Estimated daily costs per category
 */
const estimateDailyBudget = (destination, travelStyle = 'moderate') => {
    // TODO: Integrate with Google Places API for real-time pricing
    // This is a placeholder with sample data for Pakistani destinations
    
    const dailyEstimates = {
        pakistan: {
            budget: { accommodation: 3000, food: 1500, transport: 1000, activities: 500 },
            moderate: { accommodation: 8000, food: 3000, transport: 2500, activities: 1500 },
            luxury: { accommodation: 25000, food: 7000, transport: 5000, activities: 5000 }
        },
        international: {
            budget: { accommodation: 5000, food: 3000, transport: 2000, activities: 1000 },
            moderate: { accommodation: 15000, food: 6000, transport: 4000, activities: 3000 },
            luxury: { accommodation: 50000, food: 15000, transport: 10000, activities: 10000 }
        }
    };

    // Simple destination detection (to be enhanced with proper geo detection)
    const isPakistan = ['pakistan', 'karachi', 'lahore', 'islamabad', 'peshawar', 'quetta']
        .some(city => destination.toLowerCase().includes(city));

    const region = isPakistan ? 'pakistan' : 'international';
    const style = ['budget', 'moderate', 'luxury'].includes(travelStyle) ? travelStyle : 'moderate';

    return {
        daily: dailyEstimates[region][style],
        totalDaily: Object.values(dailyEstimates[region][style]).reduce((a, b) => a + b, 0),
        region,
        style,
        note: 'Estimates based on typical travel costs. Actual costs may vary.'
    };
};

/**
 * Generate budget recommendations based on trip details
 * @param {Object} trip - Trip document
 * @returns {Object} Budget recommendations and tips
 */
const getBudgetRecommendations = (trip) => {
    const recommendations = [];
    const { totalBudget, travelers, budgetBreakdown } = trip;
    const durationDays = trip.durationDays || 1;
    const dailyBudget = totalBudget / durationDays;
    const perPersonDaily = dailyBudget / travelers;

    // Check if budget seems reasonable
    if (perPersonDaily < 2000) {
        recommendations.push({
            type: 'warning',
            category: 'general',
            message: 'Your daily budget per person is quite low. Consider budget accommodations and local food.'
        });
    }

    // Category-specific recommendations
    for (const [category, data] of Object.entries(budgetBreakdown.toObject ? budgetBreakdown.toObject() : budgetBreakdown)) {
        const percentageUsed = data.amount > 0 ? (data.spent / data.amount) * 100 : 0;
        
        if (percentageUsed > 80) {
            recommendations.push({
                type: 'alert',
                category,
                message: `You've used ${Math.round(percentageUsed)}% of your ${category} budget. Consider adjusting other categories.`
            });
        }
    }

    // Duration-based tips
    if (durationDays > 7) {
        recommendations.push({
            type: 'tip',
            category: 'accommodation',
            message: 'For longer trips, consider weekly accommodation deals for better rates.'
        });
    }

    if (travelers > 4) {
        recommendations.push({
            type: 'tip',
            category: 'transport',
            message: 'With a larger group, consider renting a vehicle instead of multiple taxis.'
        });
    }

    return {
        recommendations,
        budgetHealth: getBudgetHealthScore(trip)
    };
};

/**
 * Calculate overall budget health score
 * @param {Object} trip - Trip document
 * @returns {Object} Health score and status
 */
const getBudgetHealthScore = (trip) => {
    const { totalBudget, totalSpent } = trip;
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    let status, score, color;

    if (percentageUsed <= 50) {
        status = 'excellent';
        score = 100 - percentageUsed;
        color = '#4CAF50';
    } else if (percentageUsed <= 75) {
        status = 'good';
        score = 75 - (percentageUsed - 50);
        color = '#8BC34A';
    } else if (percentageUsed <= 90) {
        status = 'caution';
        score = 50 - (percentageUsed - 75) * 2;
        color = '#FF9800';
    } else if (percentageUsed <= 100) {
        status = 'critical';
        score = 20 - (percentageUsed - 90) * 2;
        color = '#F44336';
    } else {
        status = 'over_budget';
        score = 0;
        color = '#D32F2F';
    }

    return {
        status,
        score: Math.max(0, Math.round(score)),
        percentageUsed: Math.round(percentageUsed),
        color
    };
};

module.exports = {
    // Core calculation functions
    calculateBudgetBreakdown,
    recalculateBudget,
    validateAndNormalizePercentages,
    
    // Summary and analysis functions
    getBudgetSummary,
    getBudgetRecommendations,
    getBudgetHealthScore,
    
    // Estimation functions (for future API integration)
    estimateDailyBudget,
    
    // Constants
    DEFAULT_BUDGET_PERCENTAGES,
    BUDGET_CATEGORIES
};
