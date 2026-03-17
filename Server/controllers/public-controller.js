const Business = require('../modals/business-modal');
const MenuItem = require('../modals/menu-item-modal');
const Deal = require('../modals/deal-modal');
const Trip = require('../modals/trip-modal');

// Get completed trips (public feed)
const getCompletedTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {
      isDeleted: false,
      status: 'completed',
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'destination.name': { $regex: search, $options: 'i' } },
      ];
    }

    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .select('title destination coverImage totalBudget totalSpent currency startDate endDate tripType createdAt')
        .sort({ endDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Trip.countDocuments(filter),
    ]);

    const normalizedTrips = trips.map((trip) => {
      const startDate = trip.startDate ? new Date(trip.startDate) : null;
      const endDate = trip.endDate ? new Date(trip.endDate) : null;
      const durationDays = startDate && endDate
        ? Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        : 1;

      return {
        ...trip,
        durationDays,
        remainingBudget: (trip.totalBudget || 0) - (trip.totalSpent || 0),
      };
    });

    res.status(200).json({
      success: true,
      trips: normalizedTrips,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[public] Get completed trips error:', error);
    next(error);
  }
};

// Get all verified businesses (public)
const getBusinesses = async (req, res, next) => {
  try {
    const { category, city, search, page = 1, limit = 20 } = req.query;
    
    const filter = { 
      isVerified: true,
      status: 'approved'
    };
    
    if (category) filter.businessType = category;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .select('businessName description logo businessType address geoLocation rating reviewCount galleryImages')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ rating: -1 }),
      Business.countDocuments(filter)
    ]);
    
    res.status(200).json({
      success: true,
      businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[public] Get businesses error:', error);
    next(error);
  }
};

// Get nearby businesses (public, geo-based)
// GET /api/public/nearby?lat=..&lng=..&radiusKm=5&category=restaurant&limit=30
const getNearbyBusinesses = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 5, category, limit = 30 } = req.query;

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Math.max(0.1, Number(radiusKm) || 5);
    const limitNum = Math.min(Math.max(parseInt(limit) || 30, 1), 100);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res.status(400).json({ message: 'lat and lng are required numeric query params' });
    }

    const maxDistanceMeters = radiusNum * 1000;

    const match = {
      isVerified: true,
      status: 'approved'
    };
    if (category) {
      match.businessType = category;
    }

    const results = await Business.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lngNum, latNum] },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: {
            ...match,
            geoLocation: { $exists: true }
          }
        }
      },
      { $limit: limitNum },
      {
        $project: {
          businessName: 1,
          description: 1,
          logo: 1,
          businessType: 1,
          address: 1,
          geoLocation: 1,
          rating: 1,
          reviewCount: 1,
          galleryImages: 1,
          distanceMeters: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      businesses: results.map((b) => ({
        ...b,
        distanceKm: b.distanceMeters != null ? Math.round((b.distanceMeters / 1000) * 10) / 10 : null
      }))
    });
  } catch (error) {
    console.error('[public] Get nearby businesses error:', error);
    next(error);
  }
};

// Get single business detail (public)
const getBusinessDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const business = await Business.findOne({ 
      _id: id, 
      isVerified: true,
      status: 'active'
    }).select('-password -documents -settings');
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(200).json({
      success: true,
      business
    });
  } catch (error) {
    console.error('[public] Get business detail error:', error);
    next(error);
  }
};

// Get all menu items (public) - for trip building
const getMenuItems = async (req, res, next) => {
  try {
    const { 
      businessId, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      page = 1, 
      limit = 50 
    } = req.query;
    
    // Get all business IDs (including unverified for development)
    // In production, filter by isVerified: true, status: 'active'
    const allBusinesses = await Business.find({}).select('_id');
    const businessIds = allBusinesses.map(b => b._id);
    
    const filter = { 
      business: { $in: businessIds }
    };
    
    if (businessId) filter.business = businessId;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('[public] Menu items filter:', JSON.stringify(filter));
    console.log('[public] Found', businessIds.length, 'businesses');
    
    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate('business', 'businessName logo address')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      MenuItem.countDocuments(filter)
    ]);
    
    console.log('[public] Returning', items.length, 'menu items');
    
    res.status(200).json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[public] Get menu items error:', error);
    next(error);
  }
};

// Get single menu item detail (public)
const getMenuItemDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const item = await MenuItem.findById(id)
      .populate('business', 'businessName logo address phone');
    
    if (!item || !item.isAvailable) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    console.error('[public] Get menu item detail error:', error);
    next(error);
  }
};

// Get active deals (public)
const getDeals = async (req, res, next) => {
  try {
    const { 
      businessId, 
      type,
      featured,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Get all business IDs (including unverified for development)
    const allBusinesses = await Business.find({}).select('_id');
    const businessIds = allBusinesses.map(b => b._id);
    
    const filter = { 
      business: { $in: businessIds }
    };
    
    if (businessId) filter.business = businessId;
    if (type) filter.type = type;
    if (featured === 'true') filter.isFeatured = true;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('[public] Deals filter:', JSON.stringify(filter));
    
    const [deals, total] = await Promise.all([
      Deal.find(filter)
        .populate('business', 'businessName logo address')
        .populate('menuItems', 'name price images')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ isFeatured: -1, createdAt: -1 }),
      Deal.countDocuments(filter)
    ]);
    
    console.log('[public] Returning', deals.length, 'deals');
    
    res.status(200).json({
      success: true,
      deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[public] Get deals error:', error);
    next(error);
  }
};

// Get single deal detail (public)
const getDealDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const deal = await Deal.findById(id)
      .populate('business', 'businessName logo address phone')
      .populate('menuItems', 'name price images description');
    
    if (!deal || deal.status !== 'active') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.status(200).json({
      success: true,
      deal
    });
  } catch (error) {
    console.error('[public] Get deal detail error:', error);
    next(error);
  }
};

// Get categories (aggregated from businesses)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Business.aggregate([
      { $match: { isVerified: true, status: 'approved' } },
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      categories: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    console.error('[public] Get categories error:', error);
    next(error);
  }
};

// Search all (businesses, items, deals)
const searchAll = async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = { $regex: query, $options: 'i' };
    
    // Get verified business IDs
    const verifiedBusinesses = await Business.find({ 
      isVerified: true, 
      status: 'approved' 
    }).select('_id');
    const verifiedIds = verifiedBusinesses.map(b => b._id);
    
    const [businesses, items, deals] = await Promise.all([
      Business.find({
        isVerified: true,
        status: 'approved',
        $or: [
          { businessName: searchRegex },
          { description: searchRegex }
        ]
      })
        .select('businessName logo businessType address')
        .limit(parseInt(limit)),
      
      MenuItem.find({
        business: { $in: verifiedIds },
        isAvailable: true,
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
        .populate('business', 'businessName')
        .limit(parseInt(limit)),
      
      Deal.find({
        business: { $in: verifiedIds },
        status: 'active',
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
        .populate('business', 'businessName')
        .limit(parseInt(limit))
    ]);
    
    res.status(200).json({
      success: true,
      results: {
        businesses,
        items,
        deals
      }
    });
  } catch (error) {
    console.error('[public] Search all error:', error);
    next(error);
  }
};

module.exports = {
  getCompletedTrips,
  getBusinesses,
  getBusinessDetail,
  getMenuItems,
  getMenuItemDetail,
  getDeals,
  getDealDetail,
  getCategories,
  searchAll,
  getNearbyBusinesses
};
