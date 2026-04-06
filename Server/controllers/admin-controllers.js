const User = require("../modals/user-modals");

const getAllUser = async (req, res, next) => {
    try {
        const user = await User.find();
        if (!user || user === 0) {
            res.status(200).json({ message: "No User Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

const deleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.deleteOne({ _id: id });

        if (!user) {
            res.status(200).json({ message: "User Not Found" });
        }
        res.status(200).json({ message: "Deleted Successfull" });
    } catch (error) {
        next(error);
    }
}

const GetUserById =async (req,res,next)=>{
    try{
        const id = req.params.id;
        const data = await User.findOne({_id:id},{password:0});
        res.status(200).json(data);
    }catch(error){
        next(error)
    }

}

const UpdateUserById = async (req,res,next)=>{
    try {
        console.log("called")
        const id=req.params.id;
        const data = req.body;
        const updatedData =await User.findOneAndUpdate(
            {_id:id},
            {$set:data}
        )
        if(updatedData.nModfied === 0){
            res.status(200).json({message:"User Not Found or data isthe same as before"})
        }
        res.status(200).json(updatedData);
        console.log("updatedData",updatedData)
    } catch (error) {
        console.log("error=>",error)
        next(error);
    }
}

const makeUserAdmin = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isAdmin = true;
        await user.save();

        res.status(200).json({
            message: "User successfully granted admin privileges",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.log("error=>", error);
        next(error);
    }
};

/**
 * Block a user
 * PUT /api/admin/users/:id/block
 */
const blockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isAdmin) {
            return res.status(400).json({
                success: false,
                message: "Cannot block an admin user"
            });
        }

        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockReason = reason || 'Blocked by admin';
        await user.save();

        res.status(200).json({
            success: true,
            message: "User blocked successfully",
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isBlocked: user.isBlocked,
                blockedAt: user.blockedAt,
                blockReason: user.blockReason
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unblock a user
 * PUT /api/admin/users/:id/unblock
 */
const unblockUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isBlocked = false;
        user.blockedAt = null;
        user.blockReason = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users with filters and pagination
 * GET /api/admin/users/list
 */
const getUsersList = async (req, res, next) => {
    try {
        const {
            search,
            isBlocked,
            isVerified,
            isAdmin,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Build filter
        const filter = { isDeleted: { $ne: true } };

        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isBlocked !== undefined) {
            filter.isBlocked = isBlocked === 'true';
        }

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        if (isAdmin !== undefined) {
            filter.isAdmin = isAdmin === 'true';
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user details with stats
 * GET /api/admin/users/:id/details
 */
const getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Trip = require("../modals/trip-modal");
        const Review = require("../modals/review-models");

        const user = await User.findById(id).select('-password').lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get user stats
        const [tripsCount, reviewsCount, completedTrips] = await Promise.all([
            Trip.countDocuments({ userId: id, isDeleted: { $ne: true } }),
            Review.countDocuments({ 'user._id': id }),
            Trip.countDocuments({ userId: id, status: 'completed', isDeleted: { $ne: true } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                ...user,
                stats: {
                    totalTrips: tripsCount,
                    completedTrips,
                    totalReviews: reviewsCount,
                    points: user.contribution?.points || 0,
                    level: user.contribution?.level || 'beginner',
                    badges: user.contribution?.badges || []
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUser,
    deleteUserById,
    GetUserById,
    UpdateUserById,
    makeUserAdmin,
    blockUser,
    unblockUser,
    getUsersList,
    getUserDetails
};
