const Template = require('../models/Template');
const App = require('../models/App');
const GupshupService = require('../services/GupshupService');

// Create template
exports.createTemplate = async (req, res) => {
  try {
    const { appId } = req.params;
    const { name, category, language, labels, header, body, footer, buttons, variables } = req.body;

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

    // Check template quota
    if (app.templateQuota.used >= app.templateQuota.allowed) {
      return res.status(400).json({
        success: false,
        message: 'Template quota exceeded',
      });
    }

    const template = await Template.create({
      appId,
      userId: req.user._id,
      name: name.toLowerCase(),
      category,
      language,
      labels,
      header,
      body,
      footer,
      buttons,
      variables,
    });

    // Try to sync with Gupshup
    try {
      const gupshupService = new GupshupService(app.apiKey, app.gupshupAppId);
      const gupshupResponse = await gupshupService.createTemplate({
        name: template.name,
        category: template.category,
        language: template.language,
        header: template.header,
        body: template.body,
        footer: template.footer,
        buttons: template.buttons,
        variables: template.variables,
      });

      template.gupshupTemplateId = gupshupResponse.id;
      template.status = 'PENDING';
      await template.save();
    } catch (error) {
      console.error('Gupshup sync error:', error.message);
    }

    // Update app quota
    app.templateQuota.used += 1;
    app.analytics.totalTemplatesCreated += 1;
    await app.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message,
    });
  }
};

// Get templates for app
exports.getTemplates = async (req, res) => {
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

    const templates = await Template.find({
      appId,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

// Get single template
exports.getTemplate = async (req, res) => {
  try {
    const { appId, templateId } = req.params;

    const template = await Template.findOne({
      _id: templateId,
      appId,
      userId: req.user._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message,
    });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { appId, templateId } = req.params;
    const { header, body, footer, buttons, variables } = req.body;

    let template = await Template.findOne({
      _id: templateId,
      appId,
      userId: req.user._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    if (template.status !== 'PENDING' && template.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit templates in PENDING or REJECTED status',
      });
    }

    if (header) template.header = header;
    if (body) template.body = body;
    if (footer) template.footer = footer;
    if (buttons) template.buttons = buttons;
    if (variables) template.variables = variables;

    template.updatedAt = new Date();
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message,
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { appId, templateId } = req.params;

    const template = await Template.findOneAndDelete({
      _id: templateId,
      appId,
      userId: req.user._id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Update app quota
    const app = await App.findById(appId);
    if (app) {
      app.templateQuota.used = Math.max(0, app.templateQuota.used - 1);
      await app.save();
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message,
    });
  }
};

// Get templates by status
exports.getTemplatesByStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.query;

    const query = { appId, userId: req.user._id };
    if (status) query.status = status;

    const templates = await Template.find(query);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

// Test template
exports.testTemplate = async (req, res) => {
  try {
    const { appId, templateId } = req.params;
    const { phoneNumber, variables } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

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

    const template = await Template.findOne({
      _id: templateId,
      appId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const gupshupService = new GupshupService(app.apiKey, app.gupshupAppId);
    const result = await gupshupService.sendTemplateMessage(
      phoneNumber,
      template.name,
      variables || [],
      template.language
    );

    res.status(200).json({
      success: true,
      message: 'Test message sent',
      data: result,
    });
  } catch (error) {
    console.error('Error testing template:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test message',
      error: error.message,
    });
  }
};
