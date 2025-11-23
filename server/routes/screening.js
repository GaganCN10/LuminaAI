const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');

// POST /api/screening/analyze - Analyze screening responses
router.post('/analyze', screeningController.analyzeResponses.bind(screeningController));

// GET /api/screening/history/:userId - Get user's screening history
router.get('/history/:userId', screeningController.getHistory.bind(screeningController));

// GET /api/screening/statistics - Get overall statistics
router.get('/statistics', screeningController.getStatistics.bind(screeningController));

module.exports = router;