const Grievance = require('../models/Grievance');

exports.createGrievance = async (req, res, next) => {
  try {
    const { title, description, department, area } = req.body;
    if (!area) {
       return res.status(400).json({ success: false, message: 'Area is required' });
    }
    const grievance = await Grievance.create({
      user: req.user.id,
      title,
      description,
      department,
      area
    });
    res.status(201).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: grievances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin
exports.getAllGrievances = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.area) {
       query.area = req.user.area;
    }
    const grievances = await Grievance.find(query).populate('user', 'fullName email').sort('-createdAt');
    res.status(200).json({ success: true, data: grievances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin Resolve
exports.resolveGrievance = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true, runValidators: true }
    );
    if (!grievance) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
