/**
 * Trip Validators - Zod schemas for trip-related request validation
 */

const { z } = require("zod");

/**
 * Destination schema - supports both string and object formats
 */
const destinationSchema = z.union([
    z.string()
        .trim()
        .min(2, { message: "Destination must be at least 2 characters" })
        .max(200, { message: "Destination cannot exceed 200 characters" }),
    z.object({
        name: z.string()
            .trim()
            .min(2, { message: "Destination name must be at least 2 characters" })
            .max(200, { message: "Destination name cannot exceed 200 characters" }),
        placeId: z.string().optional().nullable(),
        coordinates: z.object({
            lat: z.number().optional().nullable(),
            lng: z.number().optional().nullable()
        }).optional(),
        country: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        formattedAddress: z.string().optional().nullable()
    })
]);

/**
 * Custom budget percentages schema
 * All four categories must add up to 100
 */
const customBudgetPercentagesSchema = z.object({
    accommodation: z.number()
        .min(0, { message: "Accommodation percentage cannot be negative" })
        .max(100, { message: "Accommodation percentage cannot exceed 100" }),
    food: z.number()
        .min(0, { message: "Food percentage cannot be negative" })
        .max(100, { message: "Food percentage cannot exceed 100" }),
    transport: z.number()
        .min(0, { message: "Transport percentage cannot be negative" })
        .max(100, { message: "Transport percentage cannot exceed 100" }),
    activities: z.number()
        .min(0, { message: "Activities percentage cannot be negative" })
        .max(100, { message: "Activities percentage cannot exceed 100" })
}).refine(
    (data) => {
        const sum = data.accommodation + data.food + data.transport + data.activities;
        return Math.abs(sum - 100) < 0.01;
    },
    { message: "Budget percentages must add up to 100" }
);

/**
 * Cover image schema
 */
const coverImageSchema = z.object({
    url: z.string().url().optional().nullable(),
    publicId: z.string().optional().nullable()
}).optional();

/**
 * Create Trip Schema
 * POST /api/trips
 */
const createTripSchema = z.object({
    title: z.string({ required_error: "Trip title is required" })
        .trim()
        .min(3, { message: "Trip title must be at least 3 characters" })
        .max(100, { message: "Trip title cannot exceed 100 characters" }),

    destination: destinationSchema,

    startDate: z.string({ required_error: "Start date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid start date format"
        }),

    endDate: z.string({ required_error: "End date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid end date format"
        }),

    totalBudget: z.number({ required_error: "Total budget is required" })
        .positive({ message: "Budget must be greater than 0" })
        .max(999999999, { message: "Budget exceeds maximum allowed value" }),

    travelers: z.number({ required_error: "Number of travelers is required" })
        .int({ message: "Travelers must be a whole number" })
        .min(1, { message: "At least 1 traveler is required" })
        .max(50, { message: "Maximum 50 travelers allowed" }),

    description: z.string()
        .trim()
        .max(1000, { message: "Description cannot exceed 1000 characters" })
        .optional(),

    currency: z.string()
        .trim()
        .length(3, { message: "Currency must be a 3-letter code" })
        .toUpperCase()
        .optional()
        .default("PKR"),

    tripType: z.enum(['leisure', 'business', 'adventure', 'family', 'solo', 'honeymoon', 'group', 'other'])
        .optional()
        .default('leisure'),

    tags: z.array(z.string().trim().max(50))
        .max(10, { message: "Maximum 10 tags allowed" })
        .optional(),

    coverImage: coverImageSchema,

    isPublic: z.boolean().optional().default(false),

    customBudgetPercentages: customBudgetPercentagesSchema.optional()

}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
    },
    { 
        message: "End date must be on or after start date",
        path: ["endDate"]
    }
);

/**
 * Update Trip Schema
 * PUT /api/trips/:id
 * All fields optional for partial updates
 */
const updateTripSchema = z.object({
    title: z.string()
        .trim()
        .min(3, { message: "Trip title must be at least 3 characters" })
        .max(100, { message: "Trip title cannot exceed 100 characters" })
        .optional(),

    destination: destinationSchema.optional(),

    startDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid start date format"
        })
        .optional(),

    endDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid end date format"
        })
        .optional(),

    totalBudget: z.number()
        .positive({ message: "Budget must be greater than 0" })
        .max(999999999, { message: "Budget exceeds maximum allowed value" })
        .optional(),

    travelers: z.number()
        .int({ message: "Travelers must be a whole number" })
        .min(1, { message: "At least 1 traveler is required" })
        .max(50, { message: "Maximum 50 travelers allowed" })
        .optional(),

    description: z.string()
        .trim()
        .max(1000, { message: "Description cannot exceed 1000 characters" })
        .optional(),

    currency: z.string()
        .trim()
        .length(3, { message: "Currency must be a 3-letter code" })
        .toUpperCase()
        .optional(),

    tripType: z.enum(['leisure', 'business', 'adventure', 'family', 'solo', 'honeymoon', 'group', 'other'])
        .optional(),

    tags: z.array(z.string().trim().max(50))
        .max(10, { message: "Maximum 10 tags allowed" })
        .optional(),

    coverImage: coverImageSchema,

    isPublic: z.boolean().optional(),

    status: z.enum(['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'])
        .optional(),

    customBudgetPercentages: customBudgetPercentagesSchema.optional()
});

/**
 * Add Expense Schema
 * POST /api/trips/:id/expense
 */
const addExpenseSchema = z.object({
    category: z.enum(['accommodation', 'food', 'transport', 'activities'], {
        required_error: "Category is required",
        invalid_type_error: "Category must be one of: accommodation, food, transport, activities"
    }),

    amount: z.number({ required_error: "Amount is required" })
        .positive({ message: "Amount must be greater than 0" })
        .max(999999999, { message: "Amount exceeds maximum allowed value" }),

    description: z.string()
        .trim()
        .max(500, { message: "Description cannot exceed 500 characters" })
        .optional()
});

/**
 * Estimate Budget Schema
 * POST /api/trips/estimate
 */
const estimateBudgetSchema = z.object({
    destination: z.string({ required_error: "Destination is required" })
        .trim()
        .min(2, { message: "Destination must be at least 2 characters" })
        .max(200, { message: "Destination cannot exceed 200 characters" }),

    days: z.number({ required_error: "Number of days is required" })
        .int({ message: "Days must be a whole number" })
        .min(1, { message: "At least 1 day is required" })
        .max(365, { message: "Maximum 365 days allowed" }),

    travelers: z.number({ required_error: "Number of travelers is required" })
        .int({ message: "Travelers must be a whole number" })
        .min(1, { message: "At least 1 traveler is required" })
        .max(50, { message: "Maximum 50 travelers allowed" }),

    travelStyle: z.enum(['budget', 'moderate', 'luxury'])
        .optional()
        .default('moderate')
});

module.exports = {
    createTripSchema,
    updateTripSchema,
    addExpenseSchema,
    estimateBudgetSchema
};
