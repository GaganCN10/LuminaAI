const Screening = require('../models/Screening');
const tf = require('@tensorflow/tfjs');

class ScreeningController {
  constructor() {
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Create neural network for mental health screening
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Train with synthetic data
      await this.trainModel();
      console.log('ML model initialized and trained successfully');
    } catch (error) {
      console.error('Model initialization error:', error);
    }
  }

  async trainModel() {
    const numSamples = 1000;
    const trainingData = [];
    const labels = [];

    for (let i = 0; i < numSamples; i++) {
      const responses = [];
      const riskProfile = Math.random();
      
      for (let j = 0; j < 10; j++) {
        if (riskProfile > 0.7) {
          responses.push(Math.random() > 0.3 ? (Math.random() > 0.5 ? 3 : 2) : 1);
        } else if (riskProfile > 0.4) {
          responses.push(Math.random() > 0.5 ? (Math.random() > 0.5 ? 2 : 1) : 0);
        } else {
          responses.push(Math.random() > 0.7 ? 1 : 0);
        }
      }
      
      trainingData.push(responses);
      labels.push(riskProfile > 0.5 ? 1 : 0);
    }

    const xs = tf.tensor2d(trainingData);
    const ys = tf.tensor2d(labels, [numSamples, 1]);

    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      verbose: 0,
      shuffle: true,
      validationSplit: 0.2
    });

    xs.dispose();
    ys.dispose();
  }

  async analyzeResponses(req, res) {
    try {
      const { responses, userId } = req.body;

      if (!responses || responses.length !== 10) {
        return res.status(400).json({
          error: 'Invalid responses. Expected 10 response values.'
        });
      }

      // Validate response values
      const validResponses = responses.every(r => r >= 0 && r <= 3);
      if (!validResponses) {
        return res.status(400).json({
          error: 'Response values must be between 0 and 3.'
        });
      }

      // ML Prediction
      const inputTensor = tf.tensor2d([responses]);
      const prediction = this.model.predict(inputTensor);
      const mlRiskScore = (await prediction.data())[0];

      // Clinical scoring
      const totalScore = responses.reduce((sum, val) => sum + val, 0);
      const maxScore = 30; // 10 questions * max 3 points
      const clinicalScore = (totalScore / maxScore) * 100;

      // Combined risk score (60% ML, 40% clinical)
      const riskScore = Math.round(mlRiskScore * 60 + clinicalScore * 0.4);

      // Crisis detection
      const crisisFlag = responses[9] >= 2; // Self-harm question

      // Category analysis
      const categories = {
        depression: Math.round((responses[0] + responses[1]) / 6 * 100),
        anxiety: Math.round((responses[2] + responses[3]) / 6 * 100),
        sleep: Math.round(responses[4] / 3 * 100),
        concentration: Math.round(responses[7] / 3 * 100)
      };

      // Determine risk level
      const riskLevel = this.getRiskLevel(riskScore, crisisFlag);

      // Generate summary
      const dominantIssues = Object.entries(categories)
        .filter(([_, score]) => score > 50)
        .sort((a, b) => b[1] - a[1])
        .map(([name, _]) => name);

      const summary = this.generateSummary(riskScore, dominantIssues, crisisFlag);

      // Save to database
      const screening = new Screening({
        userId: userId || undefined,
        responses: responses.map((value, index) => ({
          questionId: index + 1,
          value,
          category: this.getQuestionCategory(index)
        })),
        riskScore,
        riskLevel,
        categories,
        crisisFlag,
        mlPrediction: mlRiskScore,
        summary
      });

      await screening.save();

      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();

      res.json({
        screeningId: screening._id,
        riskScore,
        riskLevel,
        categories,
        crisisFlag,
        summary,
        mlConfidence: mlRiskScore
      });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze responses',
        message: error.message
      });
    }
  }

  getRiskLevel(score, crisis) {
    if (crisis) return "Critical";
    if (score >= 70) return "High";
    if (score >= 50) return "Moderate";
    if (score >= 30) return "Mild";
    return "Low";
  }

  generateSummary(score, issues, crisis) {
    if (crisis) {
      return "IMMEDIATE ATTENTION NEEDED: Your responses indicate thoughts of self-harm. Please contact a crisis helpline immediately or go to your nearest emergency room.";
    }

    const issueText = issues.length > 0 ? `, particularly with ${issues.join(' and ')}` : '';

    if (score >= 70) {
      return `Your screening indicates significant concerns${issueText}. We strongly recommend scheduling an appointment with a mental health professional as soon as possible.`;
    }

    if (score >= 50) {
      return `Your responses suggest moderate mental health concerns${issueText}. Consider reaching out to a mental health professional who can provide personalized support.`;
    }

    if (score >= 30) {
      return `Your screening shows some mild concerns${issueText}. Self-care strategies and monitoring your symptoms may be helpful.`;
    }

    return "Your responses suggest relatively low mental health concerns at this time. Continue practicing self-care.";
  }

  getQuestionCategory(index) {
    const categories = [
      'depression', 'depression', 'anxiety', 'anxiety', 
      'sleep', 'energy', 'appetite', 'concentration', 
      'self_esteem', 'crisis'
    ];
    return categories[index];
  }

  async getHistory(req, res) {
    try {
      const { userId } = req.params;
      
      const screenings = await Screening.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-responses');

      res.json({ screenings });
    } catch (error) {
      console.error('History retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve screening history'
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await Screening.aggregate([
        {
          $group: {
            _id: '$riskLevel',
            count: { $sum: 1 },
            avgScore: { $avg: '$riskScore' }
          }
        }
      ]);

      const crisisCount = await Screening.countDocuments({ crisisFlag: true });
      const totalScreenings = await Screening.countDocuments();

      res.json({
        riskLevelDistribution: stats,
        crisisCount,
        totalScreenings,
        crisisRate: totalScreenings > 0 ? (crisisCount / totalScreenings * 100).toFixed(2) : 0
      });
    } catch (error) {
      console.error('Statistics error:', error);
      res.status(500).json({
        error: 'Failed to retrieve statistics'
      });
    }
  }
}

module.exports = new ScreeningController();