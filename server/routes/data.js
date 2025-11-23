const express = require('express');
const {
    getUserData,
    addMoodLog,
    addEatingLog,
    addMedication,
    deleteMedication,
    toggleMedicationLog
} = require('../controllers/dataController');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.route('/')
    .get(protect, getUserData);

router.route('/mood')
    .post(protect, addMoodLog);

router.route('/meal')
    .post(protect, addEatingLog);

router.route('/medicine-tracker')
    .post(protect, addMedication);
    
router.route('/medicine-tracker/:id')
    .delete(protect, deleteMedication);

router.route('/medication-log')
    .post(protect, toggleMedicationLog);

module.exports = router;
