const Journey = require('../models/Journey');
const App = require('../models/App');

// Create journey
exports.createJourney = async (req, res) => {
  try {
    const { appId } = req.params;
    const { name, description, journeyType, nodes, triggers, variables, settings } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Journey name is required',
      });
    }

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

    const journey = await Journey.create({
      appId,
      userId: req.user._id,
      name,
      description,
      journeyType,
      nodes: nodes || [],
      triggers: triggers || {},
      variables: variables || [],
      settings: settings || {},
    });

    // Update app analytics
    app.analytics.totalJourneysCreated += 1;
    await app.save();

    res.status(201).json({
      success: true,
      message: 'Journey created successfully',
      data: journey,
    });
  } catch (error) {
    console.error('Error creating journey:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating journey',
      error: error.message,
    });
  }
};

// Get journeys for app
exports.getJourneys = async (req, res) => {
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

    const journeys = await Journey.find({
      appId,
      userId: req.user._id,
      deletedAt: null,
    });

    res.status(200).json({
      success: true,
      count: journeys.length,
      data: journeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journeys',
      error: error.message,
    });
  }
};

// Get single journey
exports.getJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    const journey = await Journey.findOne({
      _id: journeyId,
      appId,
      userId: req.user._id,
    });

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journey',
      error: error.message,
    });
  }
};

// Update journey
exports.updateJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;
    const { name, description, nodes, triggers, variables, settings } = req.body;

    let journey = await Journey.findOne({
      _id: journeyId,
      appId,
      userId: req.user._id,
    });

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    if (journey.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit active journey. Pause it first.',
      });
    }

    if (name) journey.name = name;
    if (description) journey.description = description;
    if (nodes) journey.nodes = nodes;
    if (triggers) journey.triggers = triggers;
    if (variables) journey.variables = variables;
    if (settings) journey.settings = settings;

    journey.updatedAt = new Date();
    journey.currentVersion += 1;

    await journey.save();

    res.status(200).json({
      success: true,
      message: 'Journey updated successfully',
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating journey',
      error: error.message,
    });
  }
};

// Publish journey
exports.publishJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    let journey = await Journey.findOne({
      _id: journeyId,
      appId,
      userId: req.user._id,
    });

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    if (journey.nodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Journey must have at least one node',
      });
    }

    journey.status = 'active';
    journey.publishedAt = new Date();
    journey.publishedVersion = journey.currentVersion;

    await journey.save();

    res.status(200).json({
      success: true,
      message: 'Journey published successfully',
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing journey',
      error: error.message,
    });
  }
};

// Pause journey
exports.pauseJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    const journey = await Journey.findByIdAndUpdate(
      journeyId,
      { status: 'paused', updatedAt: new Date() },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journey paused successfully',
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pausing journey',
      error: error.message,
    });
  }
};

// Delete journey
exports.deleteJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    const journey = await Journey.findOneAndUpdate(
      {
        _id: journeyId,
        appId,
        userId: req.user._id,
      },
      { deletedAt: new Date(), status: 'archived' },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journey deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting journey',
      error: error.message,
    });
  }
};

// Get journey analytics
exports.getJourneyAnalytics = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    const journey = await Journey.findOne({
      _id: journeyId,
      appId,
      userId: req.user._id,
    }).select('analytics');

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    res.status(200).json({
      success: true,
      data: journey.analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journey analytics',
      error: error.message,
    });
  }
};

// Clone journey
exports.cloneJourney = async (req, res) => {
  try {
    const { appId, journeyId } = req.params;

    const originalJourney = await Journey.findOne({
      _id: journeyId,
      appId,
      userId: req.user._id,
    });

    if (!originalJourney) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found',
      });
    }

    const clonedJourney = await Journey.create({
      appId,
      userId: req.user._id,
      name: `${originalJourney.name} - Copy`,
      description: originalJourney.description,
      journeyType: originalJourney.journeyType,
      nodes: JSON.parse(JSON.stringify(originalJourney.nodes)),
      triggers: JSON.parse(JSON.stringify(originalJourney.triggers)),
      variables: JSON.parse(JSON.stringify(originalJourney.variables)),
      settings: JSON.parse(JSON.stringify(originalJourney.settings)),
    });

    res.status(201).json({
      success: true,
      message: 'Journey cloned successfully',
      data: clonedJourney,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cloning journey',
      error: error.message,
    });
  }
};
