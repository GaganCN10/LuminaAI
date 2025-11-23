const mongoose = require('mongoose');

const EatingLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
    },
    food: {
        type: String,
        required: true
    },
    note: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EatingLog', EatingLogSchema);