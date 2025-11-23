const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
     time: {                    // ⬅⬅ NEW FIELD
        type: String,          // "HH:MM" (24 hr)
        required: true
    }
}, {
    timestamps: true
});

// Also remove medication logs when a medication is deleted
MedicationSchema.pre('remove', async function(next) {
    await this.model('MedicationLog').deleteMany({ medicationId: this._id });
    next();
});

module.exports = mongoose.model('Medication', MedicationSchema);