const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const journeyController = require('../controllers/journeyController');

const router = express.Router({ mergeParams: true });

// Protected routes
router.post('/apps/:appId/journeys', auth, journeyController.createJourney);
router.get('/apps/:appId/journeys', auth, journeyController.getJourneys);
router.get('/apps/:appId/journeys/:journeyId', auth, journeyController.getJourney);
router.put('/apps/:appId/journeys/:journeyId', auth, journeyController.updateJourney);
router.post('/apps/:appId/journeys/:journeyId/publish', auth, journeyController.publishJourney);
router.post('/apps/:appId/journeys/:journeyId/pause', auth, journeyController.pauseJourney);
router.delete('/apps/:appId/journeys/:journeyId', auth, journeyController.deleteJourney);
router.get('/apps/:appId/journeys/:journeyId/analytics', auth, journeyController.getJourneyAnalytics);
router.post('/apps/:appId/journeys/:journeyId/clone', auth, journeyController.cloneJourney);

module.exports = router;
