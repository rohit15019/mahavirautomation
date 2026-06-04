const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const ContactMessage = require('../models/contact.model');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

// @route   GET /api/v1.0/Admin/stats
// @desc    Get dashboard stats (Admin only)
router.get('/stats', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // 24h ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsers24h = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Pending inquiries
    const pendingRequests = await ContactMessage.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      newUsers24h,
      pendingRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/Admin/users
// @desc    Get all users (Admin only)
router.get('/users', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    
    // Map to fields expected by the frontend
    const mappedUsers = users.map(user => ({
      id: user.id,
      displayId: user.displayId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      mobileNumber: user.mobile,
      password: '[PROTECTED HASH]', // Do not send real passwords, mask or send hash securely
      userGuid: user.userGuid
    }));

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Admin/users/:id
// @desc    Delete a user (Admin only)
router.delete('/users/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({ id: parseInt(id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.email === 'mahavirautomation111@gmail.com') {
      return res.status(403).json({ message: 'Protected administrator account cannot be deleted.' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot delete an administrator account.' });
    }

    await User.deleteOne({ id: parseInt(id) });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
