const Business = require('../modals/business-modal');
const MenuItem = require('../modals/menu-item-modal');
const Deal = require('../modals/deal-modal');

// Get all verified businesses (public)
const getBusinesses = async (req, res, next) => {
  try {
    const { category, city, search, page = 1, limit = 20 } = req.query;
    
    const filter = { 
      isVerified: true,
      status: 'active'
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
        .select('businessName description logo businessType address rating reviewCount galleryImages')
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
      { $match: { isVerified: true, status: 'active' } },
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
      status: 'active' 
    }).select('_id');
    const verifiedIds = verifiedBusinesses.map(b => b._id);
    
    const [businesses, items, deals] = await Promise.all([
      Business.find({
        isVerified: true,
        status: 'active',
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
  getBusinesses,
  getBusinessDetail,
  getMenuItems,
  getMenuItemDetail,
  getDeals,
  getDealDetail,
  getCategories,
  searchAll
};
