const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const templateController = require('../controllers/templateController');

const router = express.Router({ mergeParams: true });

// Protected routes
router.post('/apps/:appId/templates', auth, templateController.createTemplate);
router.get('/apps/:appId/templates', auth, templateController.getTemplates);
router.get('/apps/:appId/templates/:templateId', auth, templateController.getTemplate);
router.put('/apps/:appId/templates/:templateId', auth, templateController.updateTemplate);
router.delete('/apps/:appId/templates/:templateId', auth, templateController.deleteTemplate);
router.get('/apps/:appId/templates/status/:status', auth, templateController.getTemplatesByStatus);
router.post('/apps/:appId/templates/:templateId/test', auth, templateController.testTemplate);

module.exports = router;
