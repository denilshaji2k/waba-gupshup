const Message = require('../models/Message');
const App = require('../models/App');
const GupshupService = require('../services/GupshupService');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { appId } = req.params;
    const { phoneNumber, message, messageType = 'text', templateId, variables } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required',
      });
    }

    // Verify app belongs to user
    const app = await App.findOne({
      _id: appId,
      userId: req.user._id,
    }).select('+apiKey');

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    // Check message quota
    if (app.messagesQuota.used >= app.messagesQuota.monthly) {
      return res.status(400).json({
        success: false,
        message: 'Monthly message quota exceeded',
      });
    }

    // Send message via Gupshup
    let gupshupResponse;
    try {
      const gupshupService = new GupshupService(app.apiKey, app.gupshupAppId);
      
      if (messageType === 'template' && templateId) {
        gupshupResponse = await gupshupService.sendTemplateMessage(
          phoneNumber,
          message,
          variables || []
        );
      } else {
        gupshupResponse = await gupshupService.sendMessage(phoneNumber, message, 'text');
      }
    } catch (error) {
      console.error('Gupshup error:', error.message);
      // Continue anyway, save message with status as 'failed'
    }

    // Save message to database
    const newMessage = await Message.create({
      appId,
      userId: req.user._id,
      messageId: gupshupResponse?.messageId || `msg_${Date.now()}`,
      direction: 'outbound',
      senderPhoneNumber: app.phoneNumber,
      recipientPhoneNumber: phoneNumber,
      messageType,
      content: {
        text: message,
      },
      templateId,
      templateVariables: variables,
      status: gupshupResponse ? 'sent' : 'failed',
      conversationId: `${app.phoneNumber}-${phoneNumber}`,
      failureReason: !gupshupResponse ? 'Gupshup API error' : null,
    });

    // Update app quota
    app.messagesQuota.used += 1;
    app.analytics.totalMessagesSent += 1;
    await app.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const { appId } = req.params;
    const { limit = 50, offset = 0, status, direction } = req.query;

    // Verify app belongs to user
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

    const query = { appId };
    if (status) query.status = status;
    if (direction) query.direction = direction;

    const messages = await Message.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 })
      .populate('templateId', 'name category');

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Get conversation
exports.getConversation = async (req, res) => {
  try {
    const { appId, phoneNumber } = req.params;

    // Verify app belongs to user
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

    const messages = await Message.find({
      appId,
      $or: [
        { senderPhoneNumber: phoneNumber },
        { recipientPhoneNumber: phoneNumber },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message,
    });
  }
};

// Get message statistics
exports.getMessageStats = async (req, res) => {
  try {
    const { appId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify app belongs to user
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

    const query = { appId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            direction: '$direction',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.direction': 1, '_id.status': 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: error.message,
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { appId, messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        appId,
      },
      {
        status: 'read',
        readStatus: {
          timestamp: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    });
  }
};
