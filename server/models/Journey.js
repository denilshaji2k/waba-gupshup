const mongoose = require('mongoose');

const journeyNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['start', 'message', 'action', 'condition', 'delay', 'end', 'api'],
    required: true,
  },
  label: {
    type: String,
  },
  data: mongoose.Schema.Types.Mixed,
  position: {
    x: Number,
    y: Number,
  },
  connections: [
    {
      sourceId: String,
      targetId: String,
      condition: String,
    },
  ],
});

const journeySchema = new mongoose.Schema({
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
    required: [true, 'Journey name is required'],
  },
  description: {
    type: String,
  },
  journeyType: {
    type: String,
    enum: ['conversational', 'campaign', 'ad', 'broadcast'],
    default: 'conversational',
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft',
  },
  nodes: [journeyNodeSchema],
  triggers: {
    onKeyword: [String],
    onEvent: [String],
    onSchedule: String,
  },
  variables: [
    {
      name: String,
      type: String,
      defaultValue: mongoose.Schema.Types.Mixed,
    },
  ],
  settings: {
    multiLanguageEnabled: {
      type: Boolean,
      default: false,
    },
    languages: [String],
    trackingEnabled: {
      type: Boolean,
      default: true,
    },
    retryAttempts: {
      type: Number,
      default: 3,
    },
    retryDelay: {
      type: Number,
      default: 300,
    },
  },
  analytics: {
    totalExecutions: {
      type: Number,
      default: 0,
    },
    successfulExecutions: {
      type: Number,
      default: 0,
    },
    failedExecutions: {
      type: Number,
      default: 0,
    },
    uniqueUsers: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
    avgExecutionTime: {
      type: Number,
      default: 0,
    },
  },
  publishedAt: Date,
  publishedVersion: Number,
  currentVersion: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: Date,
});

module.exports = mongoose.model('Journey', journeySchema);
