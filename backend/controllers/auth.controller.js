const User = require('../models/User');
const OTP = require('../models/OTP');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to get token from model, create cookie and send res
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'super_secret_jwt_key_here_for_dev_only', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (overwrite if already exists for this email)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send Email
    await sendEmail({
      to: email,
      subject: 'Your Verification Code for Smart Governance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #f58220; text-align: center;">Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code for the Smart Governance Portal is:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">Smart Governance Team</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const otpData = await OTP.findOne({ email, otp });

    if (!otpData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
};

// @desc    Register a citizen
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, otp } = req.body;

    // Final verification of OTP before creating user
    const otpData = await OTP.findOne({ email, otp });
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please verify again.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: 'citizen'
    });

    // Clear OTP after successful registration
    await OTP.deleteOne({ email });

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'REGISTER_SUCCESS',
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send Welcome Email Async
    sendEmail({
      email: user.email,
      subject: 'Welcome to the Smart Governance Portal',
      html: `<h2>Welcome, ${user.fullName}</h2><p>You have successfully registered on the Smart Governance Portal. You can now apply for government certificates seamlessly.</p>`
    }).catch(err => console.log('Email sending failed', err));

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
};

// @desc    Login citizen/admin
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      // User might be a Google Auth strictly
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please use Google Login if registered via Google.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Audit Log for failure
      await AuditLog.create({
        action: 'LOGIN_FAILURE',
        email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { reason: 'Invalid password' }
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Audit Log for success
    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Security Alert Email
    sendEmail({
      email: user.email,
      subject: 'Security Alert: New Sign-in',
      html: `<h3>Hello ${user.fullName},</h3><p>We detected a new sign-in to your Smart Governance Account just now.</p>`
    }).catch(console.error);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Login with Google
// @route   POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const { email, name, sub: googleId, picture: avatar } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // Unify account if email exists but no googleId
      if (!user.googleId || !user.avatar) {
        user.googleId = googleId;
        user.avatar = avatar;
        await user.save();
      }

      // Send Alert Email
      sendEmail({
        email: user.email,
        subject: 'Security Alert: Google Sign-in',
        html: `<h3>Hello ${user.fullName},</h3><p>Your Smart Governance Account was accessed via Google Sign-In.</p>`
      }).catch(console.error);

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'GOOGLE_AUTH',
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { newUser: false }
      });

      return sendTokenResponse(user, 200, res);
    } else {
      // Create user
      user = await User.create({
        fullName: name,
        email,
        googleId,
        avatar,
        role: 'citizen' // password omitted voluntarily
      });

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'GOOGLE_AUTH',
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { newUser: true }
      });

      sendEmail({
        email: user.email,
        subject: 'Welcome to the Smart Governance Portal',
        html: `<h2>Welcome, ${user.fullName}</h2><p>You have successfully registered on the Smart Governance Portal using Google Auth.</p>`
      }).catch(console.error);

      return sendTokenResponse(user, 201, res);
    }
  } catch (err) {
    console.error('Google Auth Error: ', err);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin login with hardcoded credentials
// @route   POST /api/auth/admin-login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const MOCK_ADMINS = {
      'admin_ambole': {
        password: 'password123',
        fullName: 'Tahsildar Ambole',
        email: 'ambole@smartgovernance.gov.in',
        allocatedAreas: ['Ambole Pali']
      },
      'admin_panvel': {
        password: 'password987',
        fullName: 'Tahsildar Panvel',
        email: 'panvel@smartgovernance.gov.in',
        allocatedAreas: ['Panvel']
      },
      'admin': {
        password: 'smartadmin2026',
        fullName: 'System Administrator (Tahsildar)',
        email: 'admin@smartgovernance.gov.in',
        allocatedAreas: [] // Sees all
      }
    };

    const adminConfig = MOCK_ADMINS[username];

    if (!adminConfig || adminConfig.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Find or create the admin user in DB to get an ID
    let adminUser = await User.findOne({ email: adminConfig.email, role: 'admin' });

    if (!adminUser) {
      adminUser = await User.create({
        fullName: adminConfig.fullName,
        email: adminConfig.email,
        role: 'admin',
        allocatedAreas: adminConfig.allocatedAreas
      });
    } else {
      // Ensure allocatedAreas are up to date with mock config
      adminUser.allocatedAreas = adminConfig.allocatedAreas;
      adminUser.fullName = adminConfig.fullName;
      await adminUser.save();
    }

    // Audit Log
    await AuditLog.create({
      userId: adminUser._id,
      action: 'ADMIN_LOGIN',
      email: adminUser.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { adminUsername: username }
    });

    sendTokenResponse(adminUser, 200, res);
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};
