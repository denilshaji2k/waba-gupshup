const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const appController = require('../controllers/appController');

const router = express.Router();

// Protected routes
router.post('/', auth, appController.createApp);
router.get('/', auth, appController.getUserApps);
router.get('/:id', auth, appController.getApp);
router.put('/:id', auth, appController.updateApp);
router.delete('/:id', auth, appController.deleteApp);

// Business profile routes
router.put('/:id/business-profile', auth, appController.updateBusinessProfile);

// Settings routes
router.get('/:id/settings', auth, appController.getAppSettings);
router.put('/:id/settings', auth, appController.updateAppSettings);

// Analytics routes
router.get('/:id/analytics', auth, appController.getAppAnalytics);

module.exports = router;
