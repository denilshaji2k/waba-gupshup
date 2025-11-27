const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const App = require('../models/App');
const Message = require('../models/Message');
const Journey = require('../models/Journey');

const router = express.Router();

// Get app overview analytics
router.get('/apps/:appId/overview', auth, async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await App.findOne({
      _id: appId,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    // Get message statistics
    const messageStats = await Message.aggregate([
      { $match: { appId: mongoose.Types.ObjectId(appId) } },
      {
        $group: {
          _id: '$direction',
          count: { $sum: 1 },
          byStatus: { $push: { status: '$status', count: 1 } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        app: app.analytics,
        messages: messageStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
});

// Get message analytics
router.get('/apps/:appId/messages', auth, async (req, res) => {
  try {
    const { appId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { appId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const messages = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$direction',
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message analytics',
      error: error.message,
    });
  }
});

// Get journey analytics
router.get('/apps/:appId/journeys', auth, async (req, res) => {
  try {
    const { appId } = req.params;

    const journeys = await Journey.find({
      appId,
      userId: req.user._id,
    }).select('name status analytics');

    res.status(200).json({
      success: true,
      count: journeys.length,
      data: journeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journey analytics',
      error: error.message,
    });
  }
});

// Get dashboard summary
router.get('/dashboard', auth, async (req, res) => {
  try {
    const apps = await App.find({ userId: req.user._id });
    const appIds = apps.map((a) => a._id);

    // Get message counts
    const messageStats = await Message.aggregate([
      { $match: { appId: { $in: appIds } } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          sentMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] },
          },
          receivedMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] },
          },
          deliveredMessages: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          readMessages: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
        },
      },
    ]);

    // Get journey stats
    const journeyStats = await Journey.aggregate([
      { $match: { appId: { $in: appIds } } },
      {
        $group: {
          _id: null,
          activeJourneys: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalJourneys: { $sum: 1 },
          totalExecutions: { $sum: '$analytics.totalExecutions' },
          successfulExecutions: { $sum: '$analytics.successfulExecutions' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        appsCount: apps.length,
        messageStats: messageStats[0] || {},
        journeyStats: journeyStats[0] || {},
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
});

module.exports = router;
