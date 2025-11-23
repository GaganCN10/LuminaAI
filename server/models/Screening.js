const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Optional if anonymous
  },
  responses: [{
    questionId: Number,
    value: Number,
    category: String
  }],
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Mild', 'Moderate', 'High', 'Critical'],
    required: true
  },
  categories: {
    depression: Number,
    anxiety: Number,
    sleep: Number,
    concentration: Number
  },
  crisisFlag: {
    type: Boolean,
    default: false
  },
  mlPrediction: Number,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying
screeningSchema.index({ userId: 1, createdAt: -1 });
screeningSchema.index({ crisisFlag: 1 });

module.exports = mongoose.model('Screening', screeningSchema);