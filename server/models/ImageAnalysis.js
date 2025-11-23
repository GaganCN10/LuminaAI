const mongoose = require('mongoose');

const ImageAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    analysisResults: {
        possibleConditions: [{
            name: String,
            confidence: Number,
            description: String
        }],
        nutrientDeficiencies: [{
            nutrient: String,
            confidence: Number,
            symptoms: [String]
        }],
        severityLevel: {
            type: String,
            enum: ['low', 'moderate', 'high'],
            default: 'low'
        },
        featuresDetected: {
            texture: String,
            redness: Boolean,
            lesions: Boolean,
            patches: Boolean,
            discoloration: Boolean,
            dryness: Boolean,
            other: [String]
        },
        explanation: {
            type: String,
            default: ''
        },
        recommendations: {
            homeCare: [String],
            whenToSeeDoctor: [String]
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ImageAnalysis', ImageAnalysisSchema);