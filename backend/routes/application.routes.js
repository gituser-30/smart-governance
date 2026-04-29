const express = require('express');
const { 
  analyzeDocuments, 
  finalSubmit, 
  trackStatus, 
  getMyApplications,
  getAllApplications,
  updateStatus
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Phase 1: Upload and pre-validate using AI
router.post('/analyze', protect, upload.array('documents', 5), analyzeDocuments);

// Phase 2: Final submit after OCR confirmation
router.post('/final-submit', protect, finalSubmit);

// Citizen Routes
router.get('/my-applications', protect, getMyApplications);
router.get('/track/:trackingId', trackStatus);

// Admin Routes
router.get('/all', protect, authorize('admin'), getAllApplications);
router.put('/:id/status', protect, authorize('admin'), updateStatus);
router.get('/user-history/:userId', protect, authorize('admin'), require('../controllers/application.controller').getUserHistory);

module.exports = router;
