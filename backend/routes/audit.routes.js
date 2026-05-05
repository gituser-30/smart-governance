const express = require('express');
const { getAuditLogs, getAuditStats } = require('../controllers/audit.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All audit routes are protected and restricted to admins
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);

module.exports = router;
