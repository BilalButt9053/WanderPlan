const express = require('express');
const router = express.Router();
const {
  getBusinesses,
  getBusinessDetail,
  getMenuItems,
  getMenuItemDetail,
  getDeals,
  getDealDetail,
  getCategories,
  searchAll
} = require('../controllers/public-controller');

// Public endpoints - no authentication required

// Search across all
router.get('/search', searchAll);

// Categories
router.get('/categories', getCategories);

// Businesses
router.get('/businesses', getBusinesses);
router.get('/businesses/:id', getBusinessDetail);

// Menu Items
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemDetail);

// Deals
router.get('/deals', getDeals);
router.get('/deals/:id', getDealDetail);

module.exports = router;
