const fs = require('fs');
const path = require('path');
const Review = require('../modals/review-models');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'server', 'uploads');

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
    const { category, page = 1, limit = 20, mine, userId, sortBy = 'latest' } = req.query;
    const q = {};
    if (category && category !== 'all') q.category = category;
    if (mine === 'true' && req.user) q['user._id'] = req.user._id;
    if (userId) q['user._id'] = userId;

    const sort =
      sortBy === 'helpful' ? { 'helpfulBy.length': -1, createdAt: -1 } :
      sortBy === 'top'     ? { 'likedBy.length': -1, createdAt: -1 } :
                             { createdAt: -1 };

    const docs = await Review.find(q)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const authId = req.user?._id?.toString();
    const items = docs.map(r => {
      const o = r.toObject();
      o.likes = r.likedBy?.length || 0;
      o.helpful = r.helpfulBy?.length || 0;
      o.isLiked = !!authId && r.likedBy?.some(u => u.toString() === authId);
      o.isHelpful = !!authId && r.helpfulBy?.some(u => u.toString() === authId);
      o.isSaved = !!authId && r.savedBy?.some(u => u.toString() === authId);
      return o;
    });

    res.json({ items, page: Number(page) });
  } catch (e) { next(e); }
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
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (String(review.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const images = Array.isArray(review.images) ? review.images : [];
    await Review.deleteOne({ _id: review._id });

    await Promise.all(images.map(async (url) => {
      try {
        const marker = '/uploads/';
        const idx = url.indexOf(marker);
        if (idx === -1) return; // only delete our hosted files
        const rel = url.substring(idx + marker.length);
        const filePath = path.join(UPLOADS_DIR, rel);
        await fs.promises.unlink(filePath);
      } catch (_) {}
    }));

    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};


exports.update = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (String(review.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { place, category, rating, text, images } = req.body;
    review.place = place ?? review.place;
    review.category = category ?? review.category;
    review.rating = rating ?? review.rating;
    review.text = text ?? review.text;
    if (images) review.images = images;
    await review.save();
    res.json(review);
  } catch (e) { next(e); }
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
exports.toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Not found' });

    const idx = review.savedBy.findIndex((u) => String(u) === String(userId));
    const isSaved = idx < 0;
    if (idx >= 0) {
      review.savedBy.splice(idx, 1);
    } else {
      review.savedBy.push(userId);
    }
    await review.save();
    res.json({ id: review._id, saved: review.savedBy.length, isSaved });
  } catch (err) {
    next(err);
  }
};