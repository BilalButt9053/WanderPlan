const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
  {
    user: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true },
      name: { type: String, required: true },
      avatar: { type: String },
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true },
      name: { type: String, required: true },
      avatar: { type: String },
      isVerified: { type: Boolean, default: false },
      role: { type: String },
    },
    place: { type: String, required: true },
    category: { type: String, enum: ['food', 'places', 'hotels'], required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
    text: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }],
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }],
    replies: [ReplySchema],
    status: { type: String, enum: ['active', 'flagged', 'removed'], default: 'active' },
    flags: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ReviewSchema.virtual('likes').get(function () {
  return this.likedBy?.length || 0;
});

ReviewSchema.virtual('helpful').get(function () {
  return this.helpfulBy?.length || 0;
});

ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', ReviewSchema);
