const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, enum: ['Revenue', 'General', 'Technical', 'Other'], default: 'General' },
  area: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  adminReply: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
