const express = require('express');
const router = express.Router();
const {
    analyzeImage,
    getAnalysisHistory,
    getAnalysisById,
    deleteAnalysis
} = require('../controllers/imageAnalysisController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Changed from file upload to JSON body
router.post('/analyze', analyzeImage);
router.get('/history', getAnalysisHistory);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

module.exports = router;