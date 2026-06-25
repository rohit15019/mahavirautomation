const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { authenticateUser } = require('../middleware/auth.middleware');
const sendEmail = require('../utils/emailService');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userGuid: user.userGuid, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'jwt_secret_key',
    { expiresIn: '7d' }
  );
};

// TEMPORARY ENDPOINT TO FIX ROLES (REMOVED FOR SECURITY)

// @route   POST /api/v1.0/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    // Check if mobile already exists
    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({ message: 'Mobile number is already registered.' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (All new users get 'User' role by default)
    const role = 'User';

    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      password,
      role,
      verificationToken,
      isVerified: false // Needs email verification
    });

    await user.save();

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
    
    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Mahavir Automation</h1>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="margin-top: 0; color: #1e293b; font-size: 22px;">Verify Your Email Address</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            Dear <strong>${firstName}</strong>,<br><br>
            Thank you for registering with Mahavir Automation. To complete your registration and secure your account, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">Verify Email</a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #0ea5e9; word-break: break-all;">${verificationLink}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0;">
            If you did not create an account using this email address, please ignore this email. Your account will not be activated.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #64748b; margin: 0;">&copy; ${new Date().getFullYear()} Mahavir Automation. All rights reserved.</p>
        </div>
      </div>
    `;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email Address - Mahavir Automation',
        html: htmlMessage,
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      
      // Delete the user we just created so they can try registering again
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({ 
        message: 'Failed to send verification email: ' + emailError.message,
        errorDetail: emailError.message 
      });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email inbox to verify your account.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { mobileOrEmail, password } = req.body;

    if (!mobileOrEmail || !password) {
      return res.status(400).json({ message: 'Mobile number/Email and password are required.' });
    }

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [
        { email: mobileOrEmail.toLowerCase().trim() },
        { mobile: mobileOrEmail.trim() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    // Check if user is verified
    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Please verify your email address before logging in. Check your inbox for the verification link.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      role: user.role,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobile,
        userGuid: user.userGuid
      },
      message: 'Login successful!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/auth/verify-email
// @desc    Verify email token
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Invalid or missing verification token.' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // clear token
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Auth/forgot-password
// @desc    Generate OTP for forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address.' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send OTP email
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password.\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: message,
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }

    res.status(200).json({ message: 'Password reset link / OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Auth/verify-otp
// @desc    Verify OTP for forgot password
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      otp,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Auth/reset-password
// @desc    Reset password using token (OTP)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // The reset token is passed from searchParams. For simplicity and robust coverage,
    // we look up the user by either otp or verificationToken that matches
    const user = await User.findOne({
      $or: [
        { otp: token, otpExpiry: { $gt: Date.now() } },
        { verificationToken: token }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // clear otp
    user.otpExpiry = undefined;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
