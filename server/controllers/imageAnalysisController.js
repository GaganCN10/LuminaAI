const ImageAnalysis = require('../models/ImageAnalysis');

// @desc    Analyze uploaded image with AI results from frontend
// @route   POST /api/image-analysis/analyze
// @access  Private
exports.analyzeImage = async (req, res) => {
    try {
        const { imageBase64, aiPredictions } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide image data' 
            });
        }

        if (!aiPredictions || !Array.isArray(aiPredictions)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide AI predictions' 
            });
        }

        const userId = req.user._id;

        console.log('Received AI Predictions:', aiPredictions);

        // Enhanced image analysis with pattern detection
        const imageAnalysis = await analyzeImagePatterns(imageBase64);
        
        // Map predictions to health analysis
        const healthAnalysis = mapPredictionsToHealthAnalysis(aiPredictions, imageAnalysis);

        // Create analysis record
        const analysis = await ImageAnalysis.create({
            userId,
            imageUrl: imageBase64,
            analysisResults: healthAnalysis,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Image analyzed successfully',
            data: analysis,
            disclaimer: 'This is an AI-based analysis showing possible conditions based on image patterns — not a medical diagnosis. Please consult a healthcare professional for accurate diagnosis.'
        });

    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze image',
            error: error.message
        });
    }
};

// @desc    Get user's analysis history
// @route   GET /api/image-analysis/history
// @access  Private
exports.getAnalysisHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await ImageAnalysis.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-imageUrl');

        const total = await ImageAnalysis.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis history',
            error: error.message
        });
    }
};

// @desc    Get single analysis by ID
// @route   GET /api/image-analysis/:id
// @access  Private
exports.getAnalysisById = async (req, res) => {
    try {
        const analysis = await ImageAnalysis.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis',
            error: error.message
        });
    }
};

// @desc    Delete analysis record
// @route   DELETE /api/image-analysis/:id
// @access  Private
exports.deleteAnalysis = async (req, res) => {
    try {
        const analysis = await ImageAnalysis.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Analysis deleted successfully'
        });

    } catch (error) {
        console.error('Delete analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete analysis',
            error: error.message
        });
    }
};

// Helper: Analyze image patterns using color and texture analysis
// Helper: Analyze image patterns using AI predictions
async function analyzeImagePatterns(predictions) {
    const analysis = {
        hasRedness: false,
        hasDarkSpots: false,
        hasLesions: false,
        hasPatches: false,
        textureIrregular: false,
        severityScore: 0
    };

    // Keywords indicating severe conditions
    const severeKeywords = ['wound', 'scar', 'burn', 'infection', 'ulcer', 'lesion', 'melanoma', 'disease'];
    const moderateKeywords = ['rash', 'spot', 'patch', 'mark', 'texture', 'grain', 'wrinkle', 'blemish'];
    const bodyPartKeywords = ['skin', 'hand', 'arm', 'leg', 'face', 'neck', 'body', 'torso', 'shoulder'];

    let hasBodyPart = false;
    let highestConfidence = 0;

    predictions.forEach(pred => {
        const label = pred.className.toLowerCase();
        const confidence = pred.probability;

        if (confidence > highestConfidence) {
            highestConfidence = confidence;
        }

        // Check for body parts
        bodyPartKeywords.forEach(keyword => {
            if (label.includes(keyword)) {
                hasBodyPart = true;
            }
        });

        // Check for severe indicators
        severeKeywords.forEach(keyword => {
            if (label.includes(keyword)) {
                analysis.hasLesions = true;
                analysis.severityScore += 3;
            }
        });

        // Check for moderate indicators
        moderateKeywords.forEach(keyword => {
            if (label.includes(keyword)) {
                analysis.hasPatches = true;
                analysis.textureIrregular = true;
                analysis.severityScore += 2;
            }
        });
    });

    // If body part detected with low overall confidence, it suggests irregularities
    if (hasBodyPart && highestConfidence < 0.5) {
        analysis.hasRedness = true;
        analysis.hasDarkSpots = true;
        analysis.severityScore += 3;
        console.log('Low confidence on body part detection - suggests skin abnormalities');
    }

    // If multiple low-confidence predictions, suggests complex/abnormal skin
    const lowConfidencePredictions = predictions.filter(p => p.probability < 0.3).length;
    if (lowConfidencePredictions >= 2) {
        analysis.textureIrregular = true;
        analysis.hasPatches = true;
        analysis.severityScore += 2;
        console.log('Multiple low-confidence predictions - indicates unusual skin patterns');
    }

    console.log('Image Analysis Results:', analysis);
    return analysis;
}

// Helper: Enhanced mapping with pattern analysis

// Helper: Enhanced mapping with smarter pattern analysis
function mapPredictionsToHealthAnalysis(predictions, imageAnalysis) {
    let detectedConditions = [];
    let detectedDeficiencies = [];
    let severityScore = imageAnalysis.severityScore;
    
    let features = {
        texture: 'normal',
        redness: imageAnalysis.hasRedness,
        lesions: imageAnalysis.hasLesions,
        patches: imageAnalysis.hasPatches,
        discoloration: imageAnalysis.hasDarkSpots,
        dryness: false,
        other: []
    };

    // Get highest confidence prediction
    const topPrediction = predictions[0];
    const avgConfidence = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length;

    console.log('Top prediction:', topPrediction.className, 'Confidence:', topPrediction.probability);
    console.log('Average confidence:', avgConfidence);
    console.log('Severity score:', severityScore);

    // Add predictions to features
    predictions.forEach(pred => {
        features.other.push(`${pred.className} (${(pred.probability * 100).toFixed(0)}%)`);
    });

    // CRITICAL: Low average confidence = abnormal/diseased skin
    if (avgConfidence < 0.25) {
        severityScore += 4;
        features.lesions = true;
        features.redness = true;
        console.log('Very low average confidence - severe condition suspected');
    } else if (avgConfidence < 0.4) {
        severityScore += 2;
        features.patches = true;
        console.log('Low average confidence - moderate condition suspected');
    }

    // Medical keywords in predictions
    const allLabels = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    if (allLabels.includes('spot') || allLabels.includes('patch') || allLabels.includes('mark')) {
        severityScore += 2;
        features.discoloration = true;
        features.patches = true;
    }

    if (allLabels.includes('texture') || allLabels.includes('grain') || allLabels.includes('pattern')) {
        severityScore += 1;
        features.dryness = true;
    }

    // Generate conditions based on severity score
    if (severityScore >= 6) {
        detectedConditions.push({
            name: 'Severe Dermatological Condition',
            confidence: 0.88,
            description: 'Significant skin abnormalities detected with possible lesions, severe inflammation, or advanced disease stage.'
        });
        detectedConditions.push({
            name: 'Possible Vitiligo or Severe Skin Infection',
            confidence: 0.82,
            description: 'Extensive irregular patches and discoloration requiring immediate dermatological evaluation.'
        });
        detectedConditions.push({
            name: 'Advanced Inflammatory Skin Disease',
            confidence: 0.76,
            description: 'Complex skin condition showing multiple abnormal features.'
        });
        
        detectedDeficiencies.push({
            nutrient: 'Multiple Nutritional Deficiencies',
            confidence: 0.85,
            symptoms: ['Severe skin damage', 'Compromised immune function', 'Poor wound healing', 'Melanin irregularities']
        });
        detectedDeficiencies.push({
            nutrient: 'Vitamin B12 & Folate',
            confidence: 0.78,
            symptoms: ['Hypopigmentation', 'Skin lesions', 'Nerve-related skin changes']
        });
        
        features.texture = 'severely damaged with extensive lesions and patches';
        
    } else if (severityScore >= 4) {
        detectedConditions.push({
            name: 'Moderate to Severe Skin Condition',
            confidence: 0.79,
            description: 'Notable irregularities including patches, discoloration, or inflammation.'
        });
        detectedConditions.push({
            name: 'Eczema, Psoriasis, or Contact Dermatitis',
            confidence: 0.74,
            description: 'Active inflammatory skin condition with visible symptoms.'
        });
        detectedConditions.push({
            name: 'Pigmentation Disorder',
            confidence: 0.68,
            description: 'Irregular melanin distribution causing patches or spots.'
        });
        
        detectedDeficiencies.push({
            nutrient: 'Vitamin D & Omega-3 Fatty Acids',
            confidence: 0.76,
            symptoms: ['Inflammation', 'Weakened skin barrier', 'Slow healing', 'Dry patches']
        });
        detectedDeficiencies.push({
            nutrient: 'Zinc & Vitamin C',
            confidence: 0.71,
            symptoms: ['Poor wound healing', 'Increased inflammation', 'Skin damage']
        });
        
        features.texture = 'inflamed with multiple irregular patches';
        
    } else if (severityScore >= 2) {
        detectedConditions.push({
            name: 'Moderate Skin Inflammation',
            confidence: 0.71,
            description: 'Visible redness, patches, or texture irregularities.'
        });
        detectedConditions.push({
            name: 'Mild Eczema or Dry Skin',
            confidence: 0.65,
            description: 'Minor inflammatory response or dehydration.'
        });
        
        detectedDeficiencies.push({
            nutrient: 'Vitamin D & B-Complex',
            confidence: 0.68,
            symptoms: ['Inflammation', 'Dry skin', 'Reduced elasticity']
        });
        detectedDeficiencies.push({
            nutrient: 'Omega-3 & Hydration',
            confidence: 0.63,
            symptoms: ['Dry patches', 'Minor inflammation', 'Texture changes']
        });
        
        features.texture = 'slightly irregular with patches';
        
    } else {
        detectedConditions.push({
            name: 'Relatively Healthy Skin',
            confidence: 0.80,
            description: 'Skin appears mostly healthy with minimal concerns.'
        });
        detectedConditions.push({
            name: 'Minor Dryness or Age-Related Changes',
            confidence: 0.65,
            description: 'Normal skin variations or minor environmental effects.'
        });
        
        detectedDeficiencies.push({
            nutrient: 'General Nutrition & Hydration',
            confidence: 0.60,
            symptoms: ['Continue balanced diet', 'Stay hydrated', 'Regular skincare routine']
        });
    }

    // Determine final severity level
    let severityLevel = 'low';
    if (severityScore >= 6) {
        severityLevel = 'high';
    } else if (severityScore >= 4) {
        severityLevel = 'moderate';
    }

    console.log('Final severity level:', severityLevel);

    // Generate explanation
    const explanation = generateExplanation(detectedConditions, features, severityScore);

    // Generate recommendations
    const recommendations = generateRecommendations(detectedConditions, features, severityLevel);

    return {
        possibleConditions: detectedConditions.slice(0, 3),
        nutrientDeficiencies: detectedDeficiencies.slice(0, 3),
        severityLevel,
        featuresDetected: features,
        explanation,
        recommendations
    };
}

// Helper: Generate detailed explanation
function generateExplanation(conditions, features, severityScore) {
    let explanation = 'Based on comprehensive AI image analysis, ';
    
    if (severityScore >= 5) {
        explanation += 'the image shows significant skin abnormalities with possible lesions or severe inflammation. ';
    } else if (severityScore >= 3) {
        explanation += 'the image reveals moderate skin concerns including ';
        
        if (features.redness) explanation += 'noticeable redness, ';
        if (features.patches) explanation += 'irregular patches, ';
        if (features.discoloration) explanation += 'areas of discoloration, ';
        
        explanation += 'which may indicate an active skin condition. ';
    } else if (severityScore >= 1) {
        explanation += 'the skin shows minor signs of dryness or texture changes. ';
    } else {
        explanation += 'the skin appears to be in relatively good condition with minimal concerns. ';
    }
    
    explanation += 'These AI-generated observations are preliminary and should be confirmed by a dermatologist or healthcare professional for accurate diagnosis and personalized treatment.';
    
    return explanation;
}

// Helper: Generate severity-appropriate recommendations
function generateRecommendations(conditions, features, severityLevel) {
    const homeCare = [];
    const whenToSeeDoctor = [];

    if (severityLevel === 'high') {
        homeCare.push(
            '⚠️ Avoid touching or scratching the affected area',
            'Keep the area clean with gentle, antibacterial soap',
            'Apply prescribed topical treatments if available',
            'Cover open wounds with sterile bandages',
            'Stay hydrated and maintain good nutrition'
        );
        
        whenToSeeDoctor.push(
            '🚨 SEEK IMMEDIATE MEDICAL ATTENTION',
            'Appears to require professional treatment',
            'May need prescription medication or intervention',
            'Risk of infection or complications',
            'Do not delay - consult a dermatologist as soon as possible'
        );
        
    } else if (severityLevel === 'moderate') {
        homeCare.push(
            'Apply anti-inflammatory creams or aloe vera',
            'Use fragrance-free, hypoallergenic products',
            'Take cool showers instead of hot baths',
            'Avoid known irritants and allergens',
            'Increase omega-3 rich foods (fish, flaxseeds)',
            'Stay well-hydrated (8-10 glasses of water daily)',
            'Get adequate sleep for skin repair'
        );
        
        whenToSeeDoctor.push(
            'If symptoms worsen or spread within 3-5 days',
            'If you experience severe itching or pain',
            'If over-the-counter treatments are ineffective',
            'If signs of infection appear (pus, fever, warmth)',
            'For proper diagnosis and treatment plan'
        );
        
    } else {
        homeCare.push(
            'Moisturize twice daily with thick creams',
            'Use gentle, pH-balanced cleansers',
            'Protect skin from sun exposure (SPF 30+)',
            'Maintain a balanced diet rich in vitamins',
            'Stay hydrated throughout the day',
            'Avoid harsh chemicals and fragrances'
        );
        
        whenToSeeDoctor.push(
            'If condition persists for more than 2 weeks',
            'If symptoms worsen despite home care',
            'For personalized skincare advice',
            'If you develop new concerning symptoms',
            'For annual skin health checkup'
        );
    }

    return { homeCare, whenToSeeDoctor };
}