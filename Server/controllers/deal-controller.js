const Deal = require("../modals/deal-modal");
const MenuItem = require("../modals/menu-item-modal");
const Notification = require("../modals/notification-modal");

// Get all deals for a business
const getDeals = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { type, status } = req.query;

        const filter = { business: businessId };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const deals = await Deal.find(filter)
            .populate('menuItems', 'name price images')
            .sort({ createdAt: -1 });

        // Auto-update statuses based on dates
        const now = new Date();
        for (const deal of deals) {
            let needsUpdate = false;
            if (deal.status !== 'draft' && deal.status !== 'paused') {
                if (now < deal.startDate && deal.status !== 'scheduled') {
                    deal.status = 'scheduled';
                    needsUpdate = true;
                } else if (now > deal.endDate && deal.status !== 'expired') {
                    deal.status = 'expired';
                    needsUpdate = true;
                } else if (now >= deal.startDate && now <= deal.endDate && deal.status !== 'active') {
                    deal.status = 'active';
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                await deal.save();
            }
        }

        res.status(200).json({
            success: true,
            count: deals.length,
            deals
        });
    } catch (error) {
        console.error('[deals] Get deals error:', error);
        next(error);
    }
};

// Get single deal
const getDeal = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;

        const deal = await Deal.findOne({ _id: id, business: businessId })
            .populate('menuItems', 'name price images');

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        res.status(200).json(deal);
    } catch (error) {
        console.error('[deals] Get deal error:', error);
        next(error);
    }
};

// Create deal
const createDeal = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const {
            title,
            description,
            type,
            discountType,
            discountValue,
            menuItems,
            image,
            startDate,
            endDate,
            terms,
            usageLimit,
            code,
            isFeatured,
            targetAudience,
            budget
        } = req.body;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({ message: "Title, start date and end date are required" });
        }

        // Validate menu items belong to business
        if (menuItems && menuItems.length > 0) {
            const validItems = await MenuItem.find({
                _id: { $in: menuItems },
                business: businessId
            });
            if (validItems.length !== menuItems.length) {
                return res.status(400).json({ message: "Some menu items are invalid" });
            }
        }

        // Determine initial status
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        let status = 'draft';
        if (now < start) {
            status = 'scheduled';
        } else if (now >= start && now <= end) {
            status = 'active';
        } else if (now > end) {
            status = 'expired';
        }

        const deal = new Deal({
            business: businessId,
            title,
            description,
            type: type || 'deal',
            discountType: discountType || 'percentage',
            discountValue: discountValue || 0,
            menuItems: menuItems || [],
            image,
            startDate: start,
            endDate: end,
            terms,
            usageLimit: usageLimit || null,
            code: code || null,
            status,
            isFeatured: isFeatured || false,
            targetAudience: targetAudience || {},
            budget: budget || {}
        });

        await deal.save();

        // Populate menu items before returning
        await deal.populate('menuItems', 'name price images');

        // Create notification for the business
        await Notification.createNotification(
            businessId,
            'deal',
            'Deal Created',
            `Your ${type || 'deal'} "${title}" has been created and is ${status}.`,
            { dealId: deal._id },
            '/dashboard/deals'
        );

        res.status(201).json({
            success: true,
            message: "Deal created successfully",
            deal
        });
    } catch (error) {
        console.error('[deals] Create deal error:', error);
        next(error);
    }
};

// Update deal
const updateDeal = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;
        const updates = req.body;

        // Prevent updating business reference
        delete updates.business;

        // Validate menu items if provided
        if (updates.menuItems && updates.menuItems.length > 0) {
            const validItems = await MenuItem.find({
                _id: { $in: updates.menuItems },
                business: businessId
            });
            if (validItems.length !== updates.menuItems.length) {
                return res.status(400).json({ message: "Some menu items are invalid" });
            }
        }

        // Update status based on new dates if provided
        if (updates.startDate || updates.endDate) {
            const deal = await Deal.findOne({ _id: id, business: businessId });
            if (deal && deal.status !== 'draft' && deal.status !== 'paused') {
                const now = new Date();
                const start = new Date(updates.startDate || deal.startDate);
                const end = new Date(updates.endDate || deal.endDate);
                
                if (now < start) {
                    updates.status = 'scheduled';
                } else if (now >= start && now <= end) {
                    updates.status = 'active';
                } else if (now > end) {
                    updates.status = 'expired';
                }
            }
        }

        const deal = await Deal.findOneAndUpdate(
            { _id: id, business: businessId },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('menuItems', 'name price images');

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        res.status(200).json({
            success: true,
            message: "Deal updated successfully",
            deal
        });
    } catch (error) {
        console.error('[deals] Update deal error:', error);
        next(error);
    }
};

// Delete deal
const deleteDeal = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;

        const deal = await Deal.findOneAndDelete({ _id: id, business: businessId });

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        res.status(200).json({
            success: true,
            message: "Deal deleted successfully"
        });
    } catch (error) {
        console.error('[deals] Delete deal error:', error);
        next(error);
    }
};

// Toggle deal status (pause/activate)
const toggleDealStatus = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'paused', 'draft'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const deal = await Deal.findOne({ _id: id, business: businessId });

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        // If activating, check dates
        if (status === 'active') {
            const now = new Date();
            if (now < deal.startDate) {
                deal.status = 'scheduled';
            } else if (now > deal.endDate) {
                return res.status(400).json({ message: "Cannot activate an expired deal" });
            } else {
                deal.status = 'active';
            }
        } else {
            deal.status = status;
        }

        await deal.save();

        res.status(200).json({
            success: true,
            message: `Deal ${status === 'paused' ? 'paused' : 'activated'} successfully`,
            deal
        });
    } catch (error) {
        console.error('[deals] Toggle status error:', error);
        next(error);
    }
};

// Record analytics (views, clicks)
const recordAnalytics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'view', 'click', 'redemption'

        if (!['view', 'click', 'redemption'].includes(type)) {
            return res.status(400).json({ message: "Invalid analytics type" });
        }

        const updateField = type === 'view' ? 'analytics.views' 
            : type === 'click' ? 'analytics.clicks' 
            : 'analytics.redemptions';

        const deal = await Deal.findByIdAndUpdate(
            id,
            { $inc: { [updateField]: 1 } },
            { new: true }
        );

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        // If redemption, also increment usedCount
        if (type === 'redemption') {
            deal.usedCount += 1;
            await deal.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('[deals] Record analytics error:', error);
        next(error);
    }
};

// Get deal statistics
const getDealStats = async (req, res, next) => {
    try {
        const businessId = req.business.business_id;

        const stats = await Deal.aggregate([
            { $match: { business: new require('mongoose').Types.ObjectId(businessId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$analytics.views' },
                    totalClicks: { $sum: '$analytics.clicks' },
                    totalRedemptions: { $sum: '$analytics.redemptions' }
                }
            }
        ]);

        const totalDeals = await Deal.countDocuments({ business: businessId, type: 'deal' });
        const totalAds = await Deal.countDocuments({ business: businessId, type: 'ad' });
        const activeDeals = await Deal.countDocuments({ business: businessId, status: 'active' });

        res.status(200).json({
            success: true,
            stats: {
                totalDeals,
                totalAds,
                activeDeals,
                byStatus: stats
            }
        });
    } catch (error) {
        console.error('[deals] Get stats error:', error);
        next(error);
    }
};

module.exports = {
    getDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus,
    recordAnalytics,
    getDealStats
};
