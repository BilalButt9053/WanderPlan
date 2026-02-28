const express = require("express");
const router = express.Router();
const businessAuthMiddleware = require("../middleware/business-auth-middleware");
const {
    getDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus,
    recordAnalytics,
    getDealStats
} = require("../controllers/deal-controller");

// All routes require business authentication
router.use(businessAuthMiddleware);

// Get deal statistics
router.get("/stats", getDealStats);

// CRUD operations
router.get("/", getDeals);
router.get("/:id", getDeal);
router.post("/", createDeal);
router.put("/:id", updateDeal);
router.delete("/:id", deleteDeal);

// Status toggle (pause/activate)
router.patch("/:id/status", toggleDealStatus);

// Analytics (can be public for tracking views)
router.post("/:id/analytics", recordAnalytics);

module.exports = router;
