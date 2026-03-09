/**
 * Itinerary Routes - Public and authenticated endpoints for itinerary management
 * 
 * Base path: /api/itineraries
 * 
 * Public Routes:
 * - GET /hybrid - Generate hybrid itinerary (guest mode)
 * - GET /featured - Featured itineraries
 * - GET /suggestions - Destination suggestions
 * - GET /search - Search templates
 * - GET /tips - AI travel tips
 * - GET /templates - Browse templates
 * - GET /templates/:id - Get template details
 * 
 * Authenticated Routes (Trip-linked):
 * - GET /saved - User's saved itineraries
 * - POST /trip/:tripId/generate - Generate itinerary for trip
 * - GET /trip/:tripId - Get trip's itinerary
 * - PUT /trip/:tripId/regenerate - Regenerate itinerary
 * - POST /trip/:tripId/commit-budget - Commit costs to budget
 * - DELETE /trip/:tripId - Delete trip's itinerary
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const optionalAuthMiddleware = require("../middleware/optional-auth-middleware");
const {
    getHybridItinerary,
    getTemplates,
    getTemplateById,
    getSuggestions,
    searchTemplates,
    getTravelTips,
    getFeaturedItineraries,
    generateTripItinerary,
    getTripItinerary,
    regenerateTripItinerary,
    commitBudgetChanges,
    getUserSavedItineraries,
    deleteTripItinerary,
    getActivitySuggestions,
    saveManualItinerary,
    updateItinerary
} = require("../controllers/itinerary-controller");

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/itineraries/hybrid
 * Generate hybrid itinerary (static + AI)
 * Query: destination (required), days (required), travelStyle
 * 
 * Example: /api/itineraries/hybrid?destination=Lahore&days=3&travelStyle=moderate
 */
router.get("/hybrid", optionalAuthMiddleware, getHybridItinerary);

/**
 * GET /api/itineraries/featured
 * Get featured/popular itinerary templates
 */
router.get("/featured", getFeaturedItineraries);

/**
 * GET /api/itineraries/suggestions
 * Get popular destination suggestions
 */
router.get("/suggestions", getSuggestions);

/**
 * GET /api/itineraries/search
 * Search templates by text
 * Query: q (required), limit
 */
router.get("/search", searchTemplates);

/**
 * GET /api/itineraries/tips
 * Get AI-generated travel tips for a destination
 * Query: destination (required), travelStyle
 */
router.get("/tips", getTravelTips);

/**
 * GET /api/itineraries/templates
 * Browse all published itinerary templates
 * Query: destination, travelStyle, days, limit, page, sort, order
 */
router.get("/templates", getTemplates);

/**
 * GET /api/itineraries/templates/:id
 * Get specific template by ID
 */
router.get("/templates/:id", getTemplateById);

// ==================== AUTHENTICATED ROUTES ====================
// These routes require user authentication and work with trip data

/**
 * GET /api/itineraries/saved
 * Get all saved itineraries for the authenticated user
 * Query: page, limit
 */
router.get("/saved", authMiddleware, getUserSavedItineraries);

/**
 * POST /api/itineraries/trip/:tripId/generate
 * Generate budget-aware itinerary for a specific trip
 * Uses trip destination, dates, and budget for generation
 */
router.post("/trip/:tripId/generate", authMiddleware, generateTripItinerary);

/**
 * GET /api/itineraries/trip/:tripId
 * Get saved itinerary for a specific trip
 */
router.get("/trip/:tripId", authMiddleware, getTripItinerary);

/**
 * PUT /api/itineraries/trip/:tripId/regenerate
 * Regenerate itinerary for a trip (replaces existing)
 * Body: { forceAI: boolean }
 */
router.put("/trip/:tripId/regenerate", authMiddleware, regenerateTripItinerary);

/**
 * POST /api/itineraries/trip/:tripId/commit-budget
 * Commit itinerary estimated costs to trip budget
 * This marks expenses as "spent" in the trip budget
 */
router.post("/trip/:tripId/commit-budget", authMiddleware, commitBudgetChanges);

/**
 * GET /api/itineraries/trip/:tripId/suggestions
 * Get activity suggestions for manual trip building
 * Returns list of AI + DB activities user can select from
 */
router.get("/trip/:tripId/suggestions", authMiddleware, getActivitySuggestions);

/**
 * POST /api/itineraries/trip/:tripId/manual
 * Save manually-built itinerary with user-selected activities
 * Body: { days: [{ day: 1, activities: [...] }] }
 */
router.post("/trip/:tripId/manual", authMiddleware, saveManualItinerary);

/**
 * PUT /api/itineraries/trip/:tripId
 * Update existing itinerary (add/remove/edit activities)
 * Body: { days: [...] }
 */
router.put("/trip/:tripId", authMiddleware, updateItinerary);

/**
 * DELETE /api/itineraries/trip/:tripId
 * Delete saved itinerary for a trip
 */
router.delete("/trip/:tripId", authMiddleware, deleteTripItinerary);

module.exports = router;
