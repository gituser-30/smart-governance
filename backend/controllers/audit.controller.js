const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('userId', 'fullName email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (err) {
    console.error('FETCH AUDIT LOGS ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};

// @desc    Get audit statistics
// @route   GET /api/audit/stats
// @access  Private/Admin
exports.getAuditStats = async (req, res, next) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      }
    ]);

    const activeUsersToday = await AuditLog.distinct('email', {
      timestamp: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    res.status(200).json({
      success: true,
      data: {
        actionCounts: stats,
        activeUsersToday: activeUsersToday.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching audit stats' });
  }
};
