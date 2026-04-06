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
    addActivityToTrip,
    addPlaceToTrip,
    addFromMap,
    startTrip,
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
 * POST /api/trips/:id/add-activity
 * Add business activity to itinerary of a trip
 * Body: { businessId, title, estimatedCost, source, day }
 */
router.post("/:id/add-activity", addActivityToTrip);

/**
 * POST /api/trips/:id/add-place
 * Add Google Place to itinerary of a trip
 * Body: { placeId, title, type, category, location, estimatedCost, day }
 */
router.post("/:id/add-place", addPlaceToTrip);

/**
 * POST /api/trips/:id/add-from-map
 * Add place from map to trip (with transport cost)
 * Body: { placeId, name, type, coordinates, estimatedCost, day, transportCost, transportMode }
 */
router.post("/:id/add-from-map", addFromMap);

/**
 * POST /api/trips/:id/start
 * Start a trip (change status to ongoing)
 */
router.post("/:id/start", startTrip);

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
