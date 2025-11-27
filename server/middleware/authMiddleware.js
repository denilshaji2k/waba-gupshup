const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

// Verify admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

// Verify partner role
const partnerOnly = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Partner only.',
    });
  }
  next();
};

// Verify webhook signature
const verifyWebhookSignature = (req, res, next) => {
  const token = req.header('X-Webhook-Token');
  
  if (!token || token !== process.env.WEBHOOK_TOKEN) {
    return res.status(401).json({
      success: false,
      message: 'Invalid webhook token',
    });
  }
  
  next();
};

module.exports = {
  auth,
  adminOnly,
  partnerOnly,
  verifyWebhookSignature,
};
