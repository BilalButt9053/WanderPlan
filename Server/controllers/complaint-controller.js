const Complaint = require('../modals/complaint-modal');

// Tourist: submit a complaint/report
// POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'other', subject, description, priority = 'medium' } = req.body || {};

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'subject and description are required' });
    }

    const complaint = await Complaint.create({
      userId,
      type,
      subject,
      description,
      priority,
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// Tourist: list own complaints
// GET /api/complaints
const getMyComplaints = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, type } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const [items, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      complaints: items,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: list all complaints
// GET /api/admin/complaints
const adminListComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, status, type, priority } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const limitNum = Math.min(parseInt(limit) || 30, 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const [items, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'fullName email')
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      complaints: items,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: update complaint status
// PATCH /api/admin/complaints/:id
const adminUpdateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body || {};

    const updates = {};
    if (status) updates.status = status;
    if (typeof adminNotes === 'string') updates.adminNotes = adminNotes;
    if (priority) updates.priority = priority;
    if (status === 'resolved') updates.resolvedAt = new Date();

    const updated = await Complaint.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'fullName email')
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, complaint: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  adminListComplaints,
  adminUpdateComplaint,
};

