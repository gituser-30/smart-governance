const express = require('express');
const { register, login, googleLogin, getMe, adminLogin } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
