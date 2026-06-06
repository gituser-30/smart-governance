const express = require('express');
const { register, login, googleLogin, getMe, adminLogin, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/google', googleLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.put('/settings', protect, require('../controllers/auth.controller').updateSettings);
router.put('/password', protect, require('../controllers/auth.controller').updatePassword);
router.get('/users/count', protect, require('../controllers/auth.controller').getUsersCount);

module.exports = router;
