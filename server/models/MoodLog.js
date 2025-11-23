const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    note: {
        type: String,
        maxlength: 500
    },
    date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);