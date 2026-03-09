const express = require('express');
const router = express.Router();
const businessAuthMiddleware = require('../middleware/business-auth-middleware');
const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategories,
    bulkUpdateAvailability
} = require('../controllers/menu-item-controller');

// All routes require business authentication
router.use(businessAuthMiddleware);

// Get all menu items
router.get('/', getMenuItems);

// Get all categories
router.get('/categories', getCategories);

// Get single item
router.get('/:id', getMenuItem);

// Create item
router.post('/', createMenuItem);

// Update item
router.put('/:id', updateMenuItem);

// Delete item
router.delete('/:id', deleteMenuItem);

// Bulk update availability
router.patch('/bulk/availability', bulkUpdateAvailability);

module.exports = router;
