const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    default: 'Emergency Contact'
  }
}, { timestamps: true });

const sosAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  message: String,
  notifiedContacts: [{
    contactId: mongoose.Schema.Types.ObjectId,
    notifiedAt: Date
  }]
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

module.exports = { EmergencyContact, SOSAlert };
