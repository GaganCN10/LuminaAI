const express = require('express');
const router = express.Router();

const { getMyReports } = require("../controllers/authController");

const { register, login, logout, updateLocation, getNearbyDoctors, languageUpdate } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
router.get("/myreports", protect, getMyReports);

router.post('/register', register);
router.post('/login', login);

// ⭐ doctor updates location after login
router.post('/update-location', protect, updateLocation);

// ⭐ patient fetch nearby doctors
router.post('/nearby-doctors', protect, getNearbyDoctors);


router.put('/update-language', protect, languageUpdate);
router.post("/logout", protect, logout);

module.exports = router;
