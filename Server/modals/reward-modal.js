const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['coupon', 'discount', 'badge', 'points_bonus'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  discountValue: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  earnedFor: {
    type: String,
    trim: true
  },
  relatedBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
rewardSchema.index({ user: 1, isUsed: 1, validUntil: 1 });

// Virtual to check if reward is expired
rewardSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual to check if reward is active (not used and not expired)
rewardSchema.virtual('isActive').get(function() {
  return !this.isUsed && new Date() <= this.validUntil;
});

rewardSchema.set('toJSON', { virtuals: true });
rewardSchema.set('toObject', { virtuals: true });

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
