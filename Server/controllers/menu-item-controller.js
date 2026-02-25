const MenuItem = require("../modals/menu-item-modal");

// Get all menu items for a business
const getMenuItems = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { category, available } = req.query;

        const filter = { business: businessId };
        if (category) filter.category = category;
        if (available !== undefined) filter.isAvailable = available === 'true';

        const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items
        });
    } catch (error) {
        console.error('[menu-items] Get items error:', error);
        next(error);
    }
};

// Get single menu item
const getMenuItem = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;

        const item = await MenuItem.findOne({ _id: id, business: businessId });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('[menu-items] Get item error:', error);
        next(error);
    }
};

// Create menu item
const createMenuItem = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { name, description, price, discountedPrice, category, images, tags, isAvailable, isFeatured } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        const item = new MenuItem({
            business: businessId,
            name,
            description,
            price: parseFloat(price),
            discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
            category: category || 'General',
            images: images || [],
            tags: tags || [],
            isAvailable: isAvailable !== false,
            isFeatured: isFeatured || false
        });

        await item.save();

        res.status(201).json({
            success: true,
            message: "Item created successfully",
            item
        });
    } catch (error) {
        console.error('[menu-items] Create item error:', error);
        next(error);
    }
};

// Update menu item
const updateMenuItem = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;
        const updates = req.body;

        // Prevent updating business reference
        delete updates.business;

        const item = await MenuItem.findOneAndUpdate(
            { _id: id, business: businessId },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item
        });
    } catch (error) {
        console.error('[menu-items] Update item error:', error);
        next(error);
    }
};

// Delete menu item
const deleteMenuItem = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;

        const item = await MenuItem.findOneAndDelete({ _id: id, business: businessId });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({
            success: true,
            message: "Item deleted successfully"
        });
    } catch (error) {
        console.error('[menu-items] Delete item error:', error);
        next(error);
    }
};

// Get all categories for a business
const getCategories = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;

        const categories = await MenuItem.distinct('category', { business: businessId });

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('[menu-items] Get categories error:', error);
        next(error);
    }
};

// Bulk update availability
const bulkUpdateAvailability = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { itemIds, isAvailable } = req.body;

        if (!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ message: "Item IDs array is required" });
        }

        await MenuItem.updateMany(
            { _id: { $in: itemIds }, business: businessId },
            { isAvailable, updatedAt: Date.now() }
        );

        res.status(200).json({
            success: true,
            message: `${itemIds.length} items updated successfully`
        });
    } catch (error) {
        console.error('[menu-items] Bulk update error:', error);
        next(error);
    }
};

module.exports = {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategories,
    bulkUpdateAvailability
};
