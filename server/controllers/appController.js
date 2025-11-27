const App = require('../models/App');
const { v4: uuidv4 } = require('uuid');

// Create app
exports.createApp = async (req, res) => {
  try {
    const { name, description, wabaId, phoneNumberId, phoneNumber, businessAccountId } = req.body;

    if (!name || !wabaId || !phoneNumberId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const app = await App.create({
      userId: req.user._id,
      name,
      description,
      gupshupAppId: uuidv4(),
      wabaId,
      phoneNumberId,
      phoneNumber,
      businessAccountId,
      apiKey: process.env.GUPSHUP_API_KEY,
    });

    res.status(201).json({
      success: true,
      message: 'App created successfully',
      data: app,
    });
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating app',
      error: error.message,
    });
  }
};

// Get all apps for user
exports.getUserApps = async (req, res) => {
  try {
    const apps = await App.find({ userId: req.user._id }).select('-apiKey');
    res.status(200).json({
      success: true,
      count: apps.length,
      data: apps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching apps',
      error: error.message,
    });
  }
};

// Get single app
exports.getApp = async (req, res) => {
  try {
    const app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('-apiKey');

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    res.status(200).json({
      success: true,
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching app',
      error: error.message,
    });
  }
};

// Update app
exports.updateApp = async (req, res) => {
  try {
    const { name, description, webhookUrl } = req.body;

    let app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    if (name) app.name = name;
    if (description) app.description = description;
    if (webhookUrl) app.webhookUrl = webhookUrl;

    app.updatedAt = new Date();
    await app.save();

    res.status(200).json({
      success: true,
      message: 'App updated successfully',
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating app',
      error: error.message,
    });
  }
};

// Update business profile
exports.updateBusinessProfile = async (req, res) => {
  try {
    const { about, address, email, websites, profileImageUrl } = req.body;

    let app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    app.businessProfile = {
      about,
      address,
      email,
      websites,
      profileImageUrl,
    };

    await app.save();

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business profile',
      error: error.message,
    });
  }
};

// Delete app
exports.deleteApp = async (req, res) => {
  try {
    const app = await App.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'App deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting app',
      error: error.message,
    });
  }
};

// Get app settings
exports.getAppSettings = async (req, res) => {
  try {
    const app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('settings features status');

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        settings: app.settings,
        features: app.features,
        status: app.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching app settings',
      error: error.message,
    });
  }
};

// Update app settings
exports.updateAppSettings = async (req, res) => {
  try {
    const { autoReplyEnabled, autoReplyMessage, encryptionEnabled } = req.body;

    let app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    if (autoReplyEnabled !== undefined) app.settings.autoReplyEnabled = autoReplyEnabled;
    if (autoReplyMessage !== undefined) app.settings.autoReplyMessage = autoReplyMessage;
    if (encryptionEnabled !== undefined) app.settings.encryptionEnabled = encryptionEnabled;

    await app.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: app.settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message,
    });
  }
};

// Get app analytics
exports.getAppAnalytics = async (req, res) => {
  try {
    const app = await App.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('analytics');

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found',
      });
    }

    res.status(200).json({
      success: true,
      data: app.analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};
