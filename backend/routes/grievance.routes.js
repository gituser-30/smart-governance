const express = require('express');
const { 
  createGrievance, 
  getMyGrievances, 
  getAllGrievances, 
  resolveGrievance 
} = require('../controllers/grievance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Citizen Routes
router.post('/', protect, createGrievance);
router.get('/my', protect, getMyGrievances);

// Admin Routes
router.get('/all', protect, authorize('admin'), getAllGrievances);
router.put('/:id/resolve', protect, authorize('admin'), resolveGrievance);

module.exports = router;
