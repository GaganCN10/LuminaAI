const mongoose = require('mongoose');

const medicalAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  analysisMode: {
    type: String,
    enum: ['skin', 'general'],
    default: 'skin'
  },
  analysisResults: {
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['Low Risk', 'Moderate Risk', 'High Risk'],
      required: true
    },
    riskColor: {
      type: String,
      required: true
    },
    topCondition: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    allPredictions: [{
      condition: String,
      probability: Number,
      confidence: Number
    }],
    recommendations: [{
      type: String
    }]
  },
  patientInfo: {
    name: String,
    age: Number,
    gender: String,
    medicalHistory: String
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
medicalAnalysisSchema.index({ user: 1, createdAt: -1 });
medicalAnalysisSchema.index({ status: 1 });
medicalAnalysisSchema.index({ 'analysisResults.riskLevel': 1 });
medicalAnalysisSchema.index({ analysisMode: 1 });

// Virtual for formatted creation date
medicalAnalysisSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to get summary
medicalAnalysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    date: this.formattedDate,
    condition: this.analysisResults.topCondition,
    riskLevel: this.analysisResults.riskLevel,
    riskScore: this.analysisResults.riskScore,
    analysisMode: this.analysisMode,
    status: this.status
  };
};

// Static method to get user statistics
medicalAnalysisSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$analysisResults.riskLevel',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

// Ensure virtuals are included in JSON
medicalAnalysisSchema.set('toJSON', { virtuals: true });
medicalAnalysisSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MedicalAnalysis', medicalAnalysisSchema);