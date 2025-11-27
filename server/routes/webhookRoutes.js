const express = require('express');
const { auth, verifyWebhookSignature } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

const router = express.Router();

// Webhook endpoint for receiving messages
router.post('/message', verifyWebhookSignature, async (req, res) => {
  try {
    const { waMessageId, from, to, type, message, timestamp } = req.body;

    // Acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

    // Process message asynchronously
    (async () => {
      try {
        await Message.create({
          messageId: waMessageId,
          senderPhoneNumber: from,
          recipientPhoneNumber: to,
          messageType: type,
          content: {
            text: message?.text?.body,
            mediaUrl: message?.image?.link || message?.video?.link || message?.document?.link,
            latitude: message?.location?.latitude,
            longitude: message?.location?.longitude,
          },
          direction: 'inbound',
          status: 'delivered',
          conversationId: `${from}-${to}`,
        });

        console.log('Message saved:', waMessageId);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    })();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({
      success: true,
      message: 'Webhook processed',
    });
  }
});

// Webhook for delivery status
router.post('/status', verifyWebhookSignature, async (req, res) => {
  try {
    const { messageId, status, timestamp, reason } = req.body;

    res.status(200).json({
      success: true,
      message: 'Status received',
    });

    // Update message status asynchronously
    (async () => {
      try {
        await Message.updateOne(
          { messageId },
          {
            status: status.toLowerCase(),
            deliveryStatus: {
              timestamp: new Date(timestamp),
              reason,
            },
            updatedAt: new Date(),
          }
        );

        console.log('Message status updated:', messageId, status);
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    })();
  } catch (error) {
    console.error('Status webhook error:', error);
    res.status(200).json({
      success: true,
      message: 'Status processed',
    });
  }
});

// Webhook for read status
router.post('/read', verifyWebhookSignature, async (req, res) => {
  try {
    const { messageId, timestamp } = req.body;

    res.status(200).json({
      success: true,
      message: 'Read status received',
    });

    // Update read status asynchronously
    (async () => {
      try {
        await Message.updateOne(
          { messageId },
          {
            status: 'read',
            readStatus: {
              timestamp: new Date(timestamp),
            },
            updatedAt: new Date(),
          }
        );

        console.log('Message marked as read:', messageId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    })();
  } catch (error) {
    console.error('Read status webhook error:', error);
    res.status(200).json({
      success: true,
      message: 'Read status processed',
    });
  }
});

// Get messages
router.get('/apps/:appId/messages', auth, async (req, res) => {
  try {
    const { appId } = req.params;
    const { limit = 50, offset = 0, status } = req.query;

    const query = { appId };
    if (status) query.status = status;

    const messages = await Message.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

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
});

// Send message
router.post('/apps/:appId/send', auth, async (req, res) => {
  try {
    const { appId } = req.params;
    const { phoneNumber, message, messageType = 'text', templateId, variables } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required',
      });
    }

    // Create message record
    const newMessage = await Message.create({
      appId,
      userId: req.user._id,
      senderPhoneNumber: req.user.phone,
      recipientPhoneNumber: phoneNumber,
      messageType,
      content: {
        text: message,
      },
      templateId,
      templateVariables: variables,
      direction: 'outbound',
      status: 'sent',
      conversationId: `${req.user.phone}-${phoneNumber}`,
      messageId: `msg_${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
});

module.exports = router;
