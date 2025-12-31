const Business = require("../modals/business-modal");
const { sendApprovalEmail } = require("../controllers/business-auth-controller");

// Get all businesses
const getAllBusinesses = async (req, res, next) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const businesses = await Business.find(query).select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            count: businesses.length,
            businesses: businesses
        });
    } catch (error) {
        console.error('[admin-business] Get all businesses error', error);
        next(error);
    }
};

// Get business by ID
const getBusinessById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const business = await Business.findById(id).select('-password');

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json(business);
    } catch (error) {
        console.error('[admin-business] Get business error', error);
        next(error);
    }
};

// Approve business
const approveBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.user_id;

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        if (business.status === 'approved') {
            return res.status(400).json({ message: "Business is already approved" });
        }

        if (!business.isVerified) {
            return res.status(400).json({ message: "Business email is not verified yet" });
        }

        business.status = 'approved';
        business.approvedBy = adminId;
        business.approvedAt = new Date();
        business.rejectionReason = null;

        await business.save();

        // Send approval email
        try {
            await sendApprovalEmail(business.email, business.businessName, 'approved');
        } catch (emailError) {
            console.error('[admin-business] Error sending approval email', emailError);
            // Don't fail the approval if email fails
        }

        res.status(200).json({
            message: "Business approved successfully",
            business: {
                _id: business._id,
                businessName: business.businessName,
                email: business.email,
                status: business.status,
                approvedAt: business.approvedAt
            }
        });
    } catch (error) {
        console.error('[admin-business] Approve business error', error);
        next(error);
    }
};

// Reject business
const rejectBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        if (business.status === 'rejected') {
            return res.status(400).json({ message: "Business is already rejected" });
        }

        business.status = 'rejected';
        business.rejectionReason = reason || 'No reason provided';
        business.approvedBy = null;
        business.approvedAt = null;

        await business.save();

        // Send rejection email
        try {
            await sendApprovalEmail(business.email, business.businessName, 'rejected', business.rejectionReason);
        } catch (emailError) {
            console.error('[admin-business] Error sending rejection email', emailError);
        }

        res.status(200).json({
            message: "Business rejected",
            business: {
                _id: business._id,
                businessName: business.businessName,
                email: business.email,
                status: business.status,
                rejectionReason: business.rejectionReason
            }
        });
    } catch (error) {
        console.error('[admin-business] Reject business error', error);
        next(error);
    }
};

// Suspend business
const suspendBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        business.status = 'suspended';
        business.rejectionReason = reason || 'Account suspended by admin';

        await business.save();

        res.status(200).json({
            message: "Business suspended",
            business: {
                _id: business._id,
                businessName: business.businessName,
                status: business.status
            }
        });
    } catch (error) {
        console.error('[admin-business] Suspend business error', error);
        next(error);
    }
};

// Delete business
const deleteBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;

        const business = await Business.deleteOne({ _id: id });

        if (business.deletedCount === 0) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({ message: "Business deleted successfully" });
    } catch (error) {
        console.error('[admin-business] Delete business error', error);
        next(error);
    }
};

// Update business
const updateBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent updating sensitive fields
        delete updateData.password;
        delete updateData.status;
        delete updateData.approvedBy;
        delete updateData.approvedAt;

        const business = await Business.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({
            message: "Business updated successfully",
            business: business
        });
    } catch (error) {
        console.error('[admin-business] Update business error', error);
        next(error);
    }
};

// Get business statistics
const getBusinessStats = async (req, res, next) => {
    try {
        const stats = await Business.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Business.countDocuments();
        const verified = await Business.countDocuments({ isVerified: true });

        const formattedStats = {
            total,
            verified,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        res.status(200).json(formattedStats);
    } catch (error) {
        console.error('[admin-business] Get stats error', error);
        next(error);
    }
};

module.exports = {
    getAllBusinesses,
    getBusinessById,
    approveBusiness,
    rejectBusiness,
    suspendBusiness,
    deleteBusiness,
    updateBusiness,
    getBusinessStats
};
