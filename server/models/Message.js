const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    unique: true,
    required: true,
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
  },
  senderPhoneNumber: {
    type: String,
    required: true,
  },
  recipientPhoneNumber: {
    type: String,
  },
  messageType: {
    type: String,
    enum: [
      'text',
      'image',
      'video',
      'audio',
      'document',
      'location',
      'template',
      'interactive',
      'sticker',
    ],
    required: true,
  },
  content: {
    text: String,
    mediaUrl: String,
    mediaId: String,
    mediaType: String,
    latitude: Number,
    longitude: Number,
    buttons: [
      {
        id: String,
        text: String,
      },
    ],
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
  },
  templateVariables: [String],
  journeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journey',
  },
  journeyExecutionId: String,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'scheduled'],
    default: 'sent',
  },
  deliveryStatus: {
    timestamp: Date,
    code: String,
    reason: String,
  },
  readStatus: {
    timestamp: Date,
  },
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    source: String,
    campaignId: String,
    correlationId: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index for message cleanup (30 days)
messageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000, name: 'messagesTTL' }
);

module.exports = mongoose.model('Message', messageSchema);
