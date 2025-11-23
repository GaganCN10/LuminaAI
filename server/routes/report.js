const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const {
  sendReport,
  getReportsForDoctor,
  saveSuggestion,
  getUserNotifications,
  markNotificationsRead
} = require("../controllers/reportController");

// User: send report
router.post("/send", protect, sendReport);

// Doctor: get reports
router.get("/doctor", protect, getReportsForDoctor);

// Doctor: save suggestion
router.post("/suggestion", protect, saveSuggestion);

// User: get notifications about doctor suggestions
router.get("/notifications", protect, getUserNotifications);

// User: mark notifications as read
router.post("/notifications/read", protect, markNotificationsRead);

module.exports = router;
