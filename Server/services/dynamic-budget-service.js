/**
 * Dynamic Budget Service
 *
 * Centralizes trip budget allocation and local cost profiles so controllers,
 * itinerary generation, and fallback estimates use the same assumptions.
 */

const CATEGORIES = ['accommodation', 'food', 'transport', 'activities'];

const DEFAULT_PERCENTAGES = {
    accommodation: 40,
    food: 25,
    transport: 20,
    activities: 15
};

const STYLE_PERCENTAGES = {
    budget: {
        accommodation: 30,
        food: 30,
        transport: 25,
        activities: 15
    },
    moderate: DEFAULT_PERCENTAGES,
    luxury: {
        accommodation: 45,
        food: 30,
        transport: 12,
        activities: 13
    }
};

const STYLE_MULTIPLIERS = {
    budget: 0.65,
    moderate: 1,
    luxury: 2.4
};

const DESTINATION_PROFILES = {
    murree: {
        multiplier: 1.15,
        costs: {
            accommodation: { min: 3500, max: 18000 },
            food: { min: 700, max: 3500 },
            transport: { min: 600, max: 3500 },
            activities: { min: 200, max: 2500 }
        }
    },
    lahore: {
        multiplier: 1,
        costs: {
            accommodation: { min: 3000, max: 20000 },
            food: { min: 500, max: 3500 },
            transport: { min: 400, max: 2500 },
            activities: { min: 100, max: 2000 }
        }
    },
    islamabad: {
        multiplier: 1.2,
        costs: {
            accommodation: { min: 4500, max: 28000 },
            food: { min: 800, max: 4500 },
            transport: { min: 500, max: 3500 },
            activities: { min: 100, max: 2500 }
        }
    },
    karachi: {
        multiplier: 1.1,
        costs: {
            accommodation: { min: 3500, max: 25000 },
            food: { min: 600, max: 4500 },
            transport: { min: 500, max: 3000 },
            activities: { min: 150, max: 2500 }
        }
    },
    'northern areas': {
        multiplier: 1.35,
        costs: {
            accommodation: { min: 4000, max: 30000 },
            food: { min: 700, max: 4000 },
            transport: { min: 1000, max: 7000 },
            activities: { min: 300, max: 5000 }
        }
    },
    'default pakistan': {
        multiplier: 1,
        costs: {
            accommodation: { min: 2500, max: 18000 },
            food: { min: 400, max: 3000 },
            transport: { min: 300, max: 2500 },
            activities: { min: 100, max: 2000 }
        }
    }
};

const normalizeTravelStyle = (travelStyle) =>
    ['budget', 'moderate', 'luxury'].includes(travelStyle) ? travelStyle : 'moderate';

const normalizeDestinationKey = (destination = '') => {
    const name = typeof destination === 'string'
        ? destination
        : destination?.name || destination?.city || destination?.formattedAddress || '';
    const normalized = String(name).toLowerCase();

    if (normalized.includes('northern') || normalized.includes('hunza') || normalized.includes('skardu') || normalized.includes('gilgit')) {
        return 'northern areas';
    }

    return ['murree', 'lahore', 'islamabad', 'karachi'].find((key) => normalized.includes(key)) || 'default pakistan';
};

const roundNumber = (value) => Math.round(Number(value) || 0);

const normalizePercentages = (percentages) => {
    const values = {};
    let total = 0;

    CATEGORIES.forEach((category) => {
        const value = Math.max(0, Number(percentages?.[category]) || 0);
        values[category] = value;
        total += value;
    });

    if (total <= 0) return { ...DEFAULT_PERCENTAGES };

    const normalized = {};
    let runningTotal = 0;

    CATEGORIES.forEach((category, index) => {
        if (index === CATEGORIES.length - 1) {
            normalized[category] = Math.max(0, Number((100 - runningTotal).toFixed(2)));
            return;
        }

        const value = Number(((values[category] / total) * 100).toFixed(2));
        normalized[category] = value;
        runningTotal += value;
    });

    return normalized;
};

const hasValidCustomPercentages = (customBudgetPercentages) => {
    if (!customBudgetPercentages) return false;

    const total = CATEGORIES.reduce((sum, category) => {
        const value = customBudgetPercentages[category];
        return typeof value === 'number' ? sum + value : sum;
    }, 0);

    return CATEGORIES.every((category) => typeof customBudgetPercentages[category] === 'number')
        && Math.abs(total - 100) < 0.01;
};

const preferenceDelta = (priority) => {
    if (typeof priority === 'number') {
        if (priority > 1) return Math.min(8, priority);
        if (priority < -1) return Math.max(-8, priority);
        return priority * 8;
    }

    const normalized = String(priority || '').toLowerCase();
    if (['high', 'important', 'premium', 'more'].includes(normalized)) return 6;
    if (['low', 'less', 'save', 'minimal'].includes(normalized)) return -6;
    return 0;
};

const calculateDynamicPercentages = ({ travelStyle = 'moderate', preferences = {}, customBudgetPercentages = null }) => {
    if (hasValidCustomPercentages(customBudgetPercentages)) {
        return { ...customBudgetPercentages };
    }

    const style = normalizeTravelStyle(travelStyle);
    const percentages = { ...STYLE_PERCENTAGES[style] };

    percentages.accommodation += preferenceDelta(preferences.accommodationPriority);
    percentages.food += preferenceDelta(preferences.foodPriority);
    percentages.transport += preferenceDelta(preferences.transportPriority);
    percentages.activities += preferenceDelta(preferences.activitiesPriority);

    if (style === 'budget') {
        percentages.accommodation -= 4;
        percentages.food += 2;
        percentages.transport += 2;
    }

    if (style === 'luxury') {
        percentages.accommodation += 4;
        percentages.food += 3;
        percentages.transport -= 3;
    }

    CATEGORIES.forEach((category) => {
        percentages[category] = Math.max(5, percentages[category]);
    });

    return normalizePercentages(percentages);
};

const getDynamicCostProfile = (params = {}) => {
    const style = normalizeTravelStyle(params.travelStyle);
    const destinationKey = normalizeDestinationKey(params.destination);
    const destinationProfile = DESTINATION_PROFILES[destinationKey] || DESTINATION_PROFILES['default pakistan'];
    const styleMultiplier = STYLE_MULTIPLIERS[style] || STYLE_MULTIPLIERS.moderate;
    const combinedMultiplier = destinationProfile.multiplier * styleMultiplier;

    const costProfile = {};
    CATEGORIES.forEach((category) => {
        const base = destinationProfile.costs[category] || DESTINATION_PROFILES['default pakistan'].costs[category];
        const min = Math.max(0, roundNumber(base.min * combinedMultiplier));
        const max = Math.max(min, roundNumber(base.max * combinedMultiplier));
        costProfile[category] = {
            min,
            max,
            avg: roundNumber((min + max) / 2)
        };
    });

    return costProfile;
};

const calculateDynamicBudgetBreakdown = (params = {}) => {
    const totalBudget = Number(params.totalBudget);
    const days = Math.max(1, Number(params.days) || 1);
    const travelers = Math.max(1, Number(params.travelers) || 1);

    if (!totalBudget || totalBudget <= 0) {
        throw new Error('Total budget must be a positive number');
    }

    const percentages = calculateDynamicPercentages(params);
    const breakdown = {};

    CATEGORIES.forEach((category) => {
        const amount = roundNumber((totalBudget * percentages[category]) / 100);
        const spent = roundNumber(params.currentSpent?.[category] || params.spent?.[category] || 0);

        breakdown[category] = {
            amount,
            percentage: percentages[category],
            spent,
            remaining: amount - spent,
            perDay: roundNumber(amount / days),
            perPerson: roundNumber(amount / travelers)
        };
    });

    return breakdown;
};

const validateBudgetPlan = (params = {}) => {
    const errors = [];
    const warnings = [];
    const totalBudget = Number(params.totalBudget);
    const days = Number(params.days);
    const travelers = Number(params.travelers);

    if (!totalBudget || totalBudget <= 0) errors.push('Total budget must be a positive number');
    if (!days || days < 1) errors.push('Days must be at least 1');
    if (!travelers || travelers < 1) errors.push('Travelers must be at least 1');

    if (params.customBudgetPercentages && !hasValidCustomPercentages(params.customBudgetPercentages)) {
        warnings.push('Custom budget percentages were not used because they do not add up to 100');
    }

    if (totalBudget > 0 && days > 0 && travelers > 0) {
        const perPersonPerDay = totalBudget / days / travelers;
        if (perPersonPerDay < 2000) {
            warnings.push('Budget per person per day is low for most paid travel options');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

const buildDynamicBudgetPlan = (params = {}) => {
    const validation = validateBudgetPlan(params);
    if (!validation.isValid) {
        throw new Error(validation.errors[0]);
    }

    const style = normalizeTravelStyle(params.travelStyle);
    const days = Math.max(1, Number(params.days) || 1);
    const travelers = Math.max(1, Number(params.travelers) || 1);
    const percentages = calculateDynamicPercentages(params);
    const budgetBreakdown = calculateDynamicBudgetBreakdown({ ...params, travelStyle: style });
    const costProfile = getDynamicCostProfile({ ...params, travelStyle: style });

    return {
        budgetBreakdown,
        costProfile,
        budgetPlan: {
            destinationKey: normalizeDestinationKey(params.destination),
            travelStyle: style,
            days,
            travelers,
            totalBudget: roundNumber(params.totalBudget),
            percentages,
            preferences: params.preferences || {},
            usesCustomPercentages: hasValidCustomPercentages(params.customBudgetPercentages),
            currency: params.currency || 'PKR',
            generatedAt: new Date()
        },
        validation
    };
};

module.exports = {
    buildDynamicBudgetPlan,
    getDynamicCostProfile,
    calculateDynamicBudgetBreakdown,
    validateBudgetPlan,
    DEFAULT_PERCENTAGES,
    DESTINATION_PROFILES
};
