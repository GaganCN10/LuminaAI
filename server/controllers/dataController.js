const MoodLog = require('../models/MoodLog');
const EatingLog = require('../models/EatingLog');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const User = require('../models/User');

// @desc    Get all data for a logged in user
// @route   GET /api/data
// @access  Private
exports.getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const moodLogs = await MoodLog.find({ user: req.user.id }).sort({ date: 'asc' });
        const eatingLogs = await EatingLog.find({ user: req.user.id }).sort({ date: 'desc' });
        const medications = await Medication.find({ user: req.user.id });
        const medicationLogs = await MedicationLog.find({ user: req.user.id });
        
        res.json({
            user: { _id: user._id, name: user.name, email: user.email },
            moodLogs,
            eatingLogs,
            medications,
            medicationLogs
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a mood log
// @route   POST /api/data/mood
// @access  Private
exports.addMoodLog = async (req, res) => {
    const { mood, note, date } = req.body;
    try {
        const newLog = await MoodLog.create({
            user: req.user.id,
            mood,
            note,
            date
        });
        res.status(201).json(newLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add an eating log
// @route   POST /api/data/eating
// @access  Private
exports.addEatingLog = async (req, res) => {
    const { mealType, food, note, date } = req.body;
    try {
        const newLog = await EatingLog.create({
            user: req.user.id,
            mealType,
            food,
            note,
            date
        });
        res.status(201).json(newLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc Add a medication
// @route POST /api/data/medication
// @access Private
// exports.addMedication = async (req, res) => {
//     const { name, dosage, frequency, time } = req.body;

//     try {
//         const newMed = await Medication.create({
//             user: req.user.id,
//             name,
//             dosage,
//             frequency,
//             time            // ⬅ ADDED
//         });

//         res.status(201).json(newMed);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }




// @desc    Create or update a medication log
// @route   POST /api/data/medication-log
// @access  Private
exports.toggleMedicationLog = async (req, res) => {
    const { medicationId, date, taken } = req.body;
    try {
        const updatedLog = await MedicationLog.findOneAndUpdate(
            { medicationId, date, user: req.user.id },
            { taken },
            { new: true, upsert: true }
        );
        res.status(200).json(updatedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get all medications for user
// @route GET /api/data/medication
// @access Private
exports.getMedications = async (req, res) => {
    try {
        const meds = await Medication.find({ user: req.user.id }).lean();
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.addMedication = async (req, res) => {
    const { name, dosage, frequency, time } = req.body;

    try {
        const newMed = await Medication.create({
            user: req.user.id,
            name,
            dosage,
            frequency,
            time
        });

        res.status(201).json(newMed);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteMedication = async (req, res) => {
    try {
        console.log("DELETE HIT, ID:", req.params.id);
        console.log("USER:", req.user.id);

        const med = await Medication.findById(req.params.id);
        console.log("FOUND MED:", med);

        if (!med) {
            return res.status(404).json({ message: "Medication not found" });
        }

        if (med.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await Medication.deleteOne({ _id: req.params.id });

        res.json({ message: "Medication removed" });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
