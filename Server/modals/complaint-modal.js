const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Signup',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['bug', 'abuse', 'business', 'review', 'other'],
      default: 'other',
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'rejected'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ComplaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);

