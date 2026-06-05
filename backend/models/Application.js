const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. Aadhar, IncomeProof
  url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  aiRemark: { type: String }, // Stores AI reason for rejection if mismatched
  extractedData: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const ApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateType: { 
    type: String, 
    enum: ['Income', 'Domicile', 'EWS', 'Birth'], 
    required: true 
  },
  area: { type: String, required: true }, // The jurisdiction/district this application belongs to
  status: { 
    type: String, 
    enum: ['Submitted', 'In Progress', 'AI Verified', 'Manual Review', 'Approved', 'Rejected'], 
    default: 'Submitted' 
  },
  documents: [DocumentSchema],
  trackingId: { type: String, unique: true },
  formFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Completed' }, // Assuming free or pre-paid online
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate tracking ID before save
ApplicationSchema.pre('save', function() {
  if (!this.trackingId) {
    this.trackingId = 'GOV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Application', ApplicationSchema);
