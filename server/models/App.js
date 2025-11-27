const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide an app name'],
    trim: true,
  },
  description: {
    type: String,
  },
  gupshupAppId: {
    type: String,
    required: true,
    unique: true,
  },
  wabaId: {
    type: String,
    required: true,
  },
  phoneNumberId: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  businessAccountId: {
    type: String,
  },
  apiKey: {
    type: String,
    required: true,
    select: false,
  },
  webhookUrl: {
    type: String,
  },
  webhookToken: {
    type: String,
    select: false,
  },
  businessProfile: {
    about: String,
    address: String,
    email: String,
    websites: [String],
    profileImageUrl: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial',
  },
  messagesQuota: {
    monthly: {
      type: Number,
      default: 10000,
    },
    used: {
      type: Number,
      default: 0,
    },
    resetDate: Date,
  },
  templateQuota: {
    allowed: {
      type: Number,
      default: 50,
    },
    used: {
      type: Number,
      default: 0,
    },
  },
  messageRate: {
    type: Number,
    default: 0.05,
  },
  features: {
    botBuilder: {
      type: Boolean,
      default: true,
    },
    templates: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: Boolean,
      default: true,
    },
    campaignManager: {
      type: Boolean,
      default: false,
    },
    customIntegrations: {
      type: Boolean,
      default: false,
    },
    multiLanguage: {
      type: Boolean,
      default: true,
    },
  },
  settings: {
    autoReplyEnabled: {
      type: Boolean,
      default: false,
    },
    autoReplyMessage: String,
    messageRetention: {
      type: Number,
      default: 90,
    },
    encryptionEnabled: {
      type: Boolean,
      default: true,
    },
  },
  analytics: {
    totalMessagesSent: {
      type: Number,
      default: 0,
    },
    totalMessagesReceived: {
      type: Number,
      default: 0,
    },
    totalTemplatesCreated: {
      type: Number,
      default: 0,
    },
    totalJourneysCreated: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('App', appSchema);
