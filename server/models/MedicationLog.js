const mongoose = require('mongoose');

const MedicationLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    medicationId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Medication',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    taken: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

MedicationLogSchema.index({ medicationId: 1, date: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('MedicationLog', MedicationLogSchema);