const Review = require('../modals/review-models');
const fs = require('fs');
const path = require('path');

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.fullName || user.name || 'User',
  avatar: user.fullName ? user.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U',
  isVerified: !!user.isVerified,
  role: user.isAdmin ? 'Admin' : undefined,
});

exports.create = async (req, res, next) => {
  try {
    const { place, category, rating, text, images = [], tags = [] } = req.body;
    if (!place || !category || typeof rating !== 'number' || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const doc = await Review.create({
      user: buildUserPayload(req.user),
      place,
      category,
      rating,
      text,
      images,
      tags,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, sortBy = 'latest', userId: queryUserId, mine } = req.query;
    const requesterId = req.user?._id; // optional auth for per-user state
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (queryUserId) filter['user._id'] = queryUserId;
    if (mine === 'true' && requesterId) filter['user._id'] = requesterId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sort = { createdAt: -1 };
    if (sortBy === 'top') sort = { likes: -1, createdAt: -1 };
    if (sortBy === 'helpful') sort = { helpful: -1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    // Inject per-user like/helpful state if authenticated
    const enriched = items.map(r => {
      const obj = r.toObject();
      if (requesterId) {
        obj.isLiked = r.likedBy.some(u => String(u) === String(requesterId));
        obj.isHelpful = r.helpfulBy.some(u => String(u) === String(requesterId));
      }
      return obj;
    });

    res.json({ items: enriched, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });

    const idx = review.likedBy.findIndex((u) => String(u) === String(userId));
    const isLiked = idx < 0;
    if (idx >= 0) {
      review.likedBy.splice(idx, 1);
    } else {
      review.likedBy.push(userId);
    }
    await review.save();
    res.json({ id: review._id, likes: review.likedBy.length, isLiked });
  } catch (err) {
    next(err);
  }
};

exports.toggleHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });

    const idx = review.helpfulBy.findIndex((u) => String(u) === String(userId));
    const isHelpful = idx < 0;
    if (idx >= 0) {
      review.helpfulBy.splice(idx, 1);
    } else {
      review.helpfulBy.push(userId);
    }
    await review.save();
    res.json({ id: review._id, helpful: review.helpfulBy.length, isHelpful });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });

    review.replies.push({
      user: buildUserPayload(req.user),
      text,
    });
    await review.save();
    const last = review.replies[review.replies.length - 1];
    res.status(201).json(last);
  } catch (err) {
    next(err);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    res.json(review.replies || []);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    
    // Check if user owns the review or is admin
    if (String(review.user._id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Delete associated uploaded images (only those stored locally under /uploads)
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    for (const url of review.images || []) {
      try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith('/uploads/')) {
          const filename = parsed.pathname.replace('/uploads/', '');
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (e) {
        // ignore invalid URLs
      }
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted', id });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { place, category, rating, text, images, tags } = req.body;
    
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    
    // Check if user owns the review
    if (String(review.user._id) !== String(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update fields
    if (place !== undefined) review.place = place;
    if (category !== undefined) review.category = category;
    if (rating !== undefined) review.rating = rating;
    if (text !== undefined) review.text = text;
    if (images !== undefined) review.images = images;
    if (tags !== undefined) review.tags = tags;
    
    await review.save();
    res.json(review);
  } catch (err) {
    next(err);
  }
};

// User can report a review for moderation
exports.reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'inappropriate' } = req.body || {};
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (!review.flags) review.flags = [];
    review.flags.push({ userId: req.user._id, reason, createdAt: new Date() });
    review.status = 'flagged';
    await review.save();
    res.json({ message: 'Reported', id: review._id });
  } catch (err) {
    next(err);
  }
};

// Admin moderation endpoint
exports.moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'flagged' | 'removed'
    if (!['active', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    review.status = status;
    await review.save();
    res.json(review);
  } catch (err) {
    next(err);
  }
};
