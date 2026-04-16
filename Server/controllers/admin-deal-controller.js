const Deal = require("../modals/deal-modal");

const getAdminDeals = async (req, res, next) => {
    try {
        const {
            type,
            status,
            search,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [deals, total] = await Promise.all([
            Deal.find(filter)
                .populate('business', 'businessName ownerName email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit, 10))
                .lean(),
            Deal.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                deals,
                pagination: {
                    total,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    pages: Math.ceil(total / parseInt(limit, 10)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDeals,
};
