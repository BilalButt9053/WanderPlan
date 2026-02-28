/**
 * Trip Routes - Defines all trip-related API endpoints
 * All routes require JWT authentication
 * 
 * Base path: /api/trips
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const validate = require("../middleware/validate-middleware");
const { createTripSchema, updateTripSchema, addExpenseSchema, estimateBudgetSchema } = require("../validators/trip-validator");
const {
    createTrip,
    getUserTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    getBudgetDetails,
    getUserTripStats,
    estimateTripBudget
} = require("../controllers/trip-controller");

// All routes require authentication
router.use(authMiddleware);

// ==================== STATISTICS & UTILITIES ====================

/**
 * GET /api/trips/stats
 * Get user's trip statistics
 */
router.get("/stats", getUserTripStats);

/**
 * POST /api/trips/estimate
 * Estimate budget for a potential trip
 * Body: { destination, days, travelers, travelStyle }
 */
router.post("/estimate", validate(estimateBudgetSchema), estimateTripBudget);

// ==================== TRIP CRUD OPERATIONS ====================

/**
 * GET /api/trips
 * Get all trips for logged-in user
 * Query params: status, limit, page, sort, order, tripType
 */
router.get("/", getUserTrips);

/**
 * POST /api/trips
 * Create a new trip
 * Body: { title, destination, startDate, endDate, totalBudget, travelers, ... }
 */
router.post("/", validate(createTripSchema), createTrip);

/**
 * GET /api/trips/:id
 * Get single trip by ID
 */
router.get("/:id", getTrip);

/**
 * PUT /api/trips/:id
 * Update trip
 * Body: Fields to update
 */
router.put("/:id", validate(updateTripSchema), updateTrip);

/**
 * DELETE /api/trips/:id
 * Delete trip (soft delete)
 */
router.delete("/:id", deleteTrip);

// ==================== BUDGET OPERATIONS ====================

/**
 * GET /api/trips/:id/budget
 * Get detailed budget breakdown and recommendations
 */
router.get("/:id/budget", getBudgetDetails);

/**
 * POST /api/trips/:id/expense
 * Add an expense to a trip
 * Body: { category, amount, description }
 */
router.post("/:id/expense", validate(addExpenseSchema), addExpense);

module.exports = router;
