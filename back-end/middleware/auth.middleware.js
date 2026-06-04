const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // 1. Check JWT if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
      
      const user = await User.findOne({ userGuid: decoded.userGuid });
      if (!user) {
        throw new Error('User not found');
      }

      req.token = token;
      req.user = user;
      return next();
    }

    // Block public access if no auth is specified
    return res.status(401).json({ message: 'Authentication required. Please authenticate.' });
  } catch (error) {
    res.status(401).json({ message: 'Authentication required. Please authenticate.' });
  }
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  const role = req.user && req.user.role;

  if (role && role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = { authenticateUser, authorizeAdmin };
