const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: [true, 'Template name is required'],
    lowercase: true,
  },
  category: {
    type: String,
    enum: ['MARKETING', 'OTP', 'ACCOUNT_UPDATE', 'TRANSACTIONAL', 'CUSTOMER_SERVICE'],
    required: true,
  },
  language: {
    type: String,
    default: 'en',
  },
  labels: [String],
  header: {
    format: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION'],
    },
    text: String,
    mediaUrl: String,
    mediaId: String,
  },
  body: {
    type: String,
    required: [true, 'Template body is required'],
    maxlength: 1024,
  },
  variables: [
    {
      placeholder: String,
      sampleValue: String,
    },
  ],
  footer: {
    type: String,
    maxlength: 60,
  },
  buttons: [
    {
      type: {
        type: String,
        enum: ['PHONE_NUMBER', 'URL', 'QUICK_REPLY', 'COPY_CODE'],
      },
      text: String,
      phoneNumber: String,
      url: String,
      urlType: {
        type: String,
        enum: ['STATIC', 'DYNAMIC'],
      },
      offerCode: String,
      expireAfterSeconds: Number,
    },
  ],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'],
    default: 'PENDING',
  },
  rejectionReason: String,
  gupshupTemplateId: String,
  metaTemplateId: String,
  messageType: {
    type: String,
    enum: ['CUSTOM_MESSAGE', 'PRODUCT_MESSAGE', 'CAROUSEL'],
    default: 'CUSTOM_MESSAGE',
  },
  quality: {
    score: Number,
    status: String,
    messages: [String],
  },
  usage: {
    totalSent: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
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

// Compound unique index for template name per app
templateSchema.index({ appId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Template', templateSchema);
