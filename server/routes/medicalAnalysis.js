const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MedicalAnalysis = require('../models/MedicalAnalysis');
const { protect } = require('../middlewares/auth');
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/medical');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `medical-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/dicom'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and DICOM are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/medical/analyze
// @desc    Upload image and save analysis results
// @access  Private
router.post('/analyze', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { analysisResults, analysisMode, patientInfo, notes } = req.body;
    
    let parsedResults;
    try {
      parsedResults = typeof analysisResults === 'string' ? JSON.parse(analysisResults) : analysisResults;
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid analysis results format' });
    }

    let parsedPatientInfo;
    if (patientInfo) {
      try {
        parsedPatientInfo = typeof patientInfo === 'string' ? JSON.parse(patientInfo) : patientInfo;
      } catch (e) {
        parsedPatientInfo = {};
      }
    }

    const analysis = new MedicalAnalysis({
      user: req.user._id,
      imagePath: req.file.path,
      imageUrl: `/uploads/medical/${req.file.filename}`,
      analysisResults: {
        riskScore: parsedResults.riskScore || 0,
        riskLevel: parsedResults.riskLevel || 'Low Risk',
        riskColor: parsedResults.riskColor || '#10b981',
        topCondition: parsedResults.topCondition || 'Unknown',
        confidence: parsedResults.confidence || 0,
        allPredictions: parsedResults.allPredictions || [],
        recommendations: parsedResults.recommendations || []
      },
      patientInfo: parsedPatientInfo,
      notes: notes || '',
      analysisMode: analysisMode || 'skin'
    });

    await analysis.save();

    res.status(201).json({
      success: true,
      message: 'Analysis saved successfully',
      data: {
        id: analysis._id,
        imageUrl: analysis.imageUrl,
        analysisResults: analysis.analysisResults,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Medical analysis error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error during analysis', error: error.message });
  }
});

// @route   GET /api/medical/analyses
// @desc    Get all analyses for user with pagination and filters
// @access  Private
router.get('/analyses', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, riskLevel, status, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (riskLevel) query['analysisResults.riskLevel'] = riskLevel;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await MedicalAnalysis.countDocuments(query);
    const analyses = await MedicalAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('-imagePath');

    res.json({
      success: true,
      analyses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/medical/analyses/:id
// @desc    Get single analysis by ID
// @access  Private
router.get('/analyses/:id', protect, async (req, res) => {
  try {
    const analysis = await MedicalAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/medical/analyses/:id
// @desc    Update analysis (notes, status, patient info)
// @access  Private
router.put('/analyses/:id', protect, async (req, res) => {
  try {
    const { notes, status, patientInfo, reviewNotes } = req.body;
    
    const analysis = await MedicalAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (notes !== undefined) analysis.notes = notes;
    if (status) {
      analysis.status = status;
      if (status === 'reviewed') {
        analysis.reviewedBy = req.user._id;
        analysis.reviewDate = new Date();
      }
    }
    if (patientInfo) {
      analysis.patientInfo = { ...analysis.patientInfo, ...patientInfo };
    }
    if (reviewNotes) analysis.reviewNotes = reviewNotes;

    await analysis.save();

    res.json({ success: true, message: 'Analysis updated', data: analysis });
  } catch (error) {
    console.error('Update analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/medical/analyses/:id
// @desc    Delete analysis
// @access  Private
router.delete('/analyses/:id', protect, async (req, res) => {
  try {
    const analysis = await MedicalAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Delete the image file
    if (analysis.imagePath && fs.existsSync(analysis.imagePath)) {
      fs.unlinkSync(analysis.imagePath);
    }

    await MedicalAnalysis.deleteOne({ _id: analysis._id });

    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/medical/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await MedicalAnalysis.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          avgRiskScore: { $avg: '$analysisResults.riskScore' },
          highRiskCount: {
            $sum: { $cond: [{ $eq: ['$analysisResults.riskLevel', 'High Risk'] }, 1, 0] }
          },
          moderateRiskCount: {
            $sum: { $cond: [{ $eq: ['$analysisResults.riskLevel', 'Moderate Risk'] }, 1, 0] }
          },
          lowRiskCount: {
            $sum: { $cond: [{ $eq: ['$analysisResults.riskLevel', 'Low Risk'] }, 1, 0] }
          }
        }
      }
    ]);

    const recentAnalyses = await MedicalAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('analysisResults.topCondition analysisResults.riskLevel analysisResults.riskScore createdAt');

    res.json({
      success: true,
      stats: stats[0] || {
        totalAnalyses: 0,
        avgRiskScore: 0,
        highRiskCount: 0,
        moderateRiskCount: 0,
        lowRiskCount: 0
      },
      recentAnalyses
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/medical/history
// @desc    Get analysis trends over time
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const history = await MedicalAnalysis.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$analysisResults.riskScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

module.exports = router;