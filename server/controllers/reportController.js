const DoctorReport = require("../models/DoctorReport");
const User = require("../models/User");
const mongoose = require("mongoose");

// ======================================================
// SEND REPORT (User → Doctor)
// ======================================================
async function sendReport(req, res) {
  try {
    const { doctorId, moods = [], meals = [], medications = [], summary = "" } = req.body;
    const userId = req.user.id;

    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });

    const user = await User.findById(userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const reportObj = {
      id: Date.now().toString(),
      patientId: new mongoose.Types.ObjectId(userId),
      patientName: user.name,
      createdAt: new Date().toISOString(),
      status: "new",
      reportData: {
        moods,
        meals,
        medications,
        summary: summary || "No summary provided"
      },
      suggestion: null,
      userNotified: false
    };

    let docRec = await DoctorReport.findOne({ doctorId });
    if (!docRec) {
      docRec = await DoctorReport.create({
        doctorId,
        reports: [reportObj]
      });
    } else {
      docRec.reports.push(reportObj);
      await docRec.save();
    }

    return res.json({ message: "Report successfully sent!", report: reportObj });

  } catch (err) {
    console.error("SEND REPORT ERROR:", err);
    return res.status(500).json({ message: "Error sending report" });
  }
}

// ======================================================
// GET REPORTS FOR DOCTOR
// ======================================================
async function getReportsForDoctor(req, res) {
  try {
    const doctorId = req.user.id;

    const docRec = await DoctorReport.findOne({ doctorId })
      .populate("reports.patientId", "name email");

    if (!docRec) return res.json([]);

    const formatted = docRec.reports.map((r) => ({
      _id: r._id,
      patient: r.patientId
        ? { name: r.patientId.name, email: r.patientId.email }
        : { name: r.patientName || "Unknown Patient", email: "" },

      createdAt: r.createdAt,
      status: r.status,
      suggestion: r.suggestion || null,

      reportData: {
        summary: r.reportData?.summary || "No summary available",
        moods: Array.isArray(r.reportData?.moods) ? r.reportData.moods : [],
        meals: Array.isArray(r.reportData?.meals) ? r.reportData.meals : [],
        medications: Array.isArray(r.reportData?.medications) ? r.reportData.medications : []
      }
    }));

    res.json(formatted);
  } catch (err) {
    console.error("FETCH DOCTOR REPORTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
}

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================
async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;

    const reports = await DoctorReport.find({
      "reports.patientId": userId,
      "reports.userNotified": false
    });

    let notifications = [];

    reports.forEach((doc) => {
      doc.reports.forEach((r) => {
        if (!r.userNotified && r.patientId.toString() === userId) {
          notifications.push({
            reportId: r._id,
            suggestion: r.suggestion,
            when: r.suggestion?.when
          });
        }
      });
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

// ======================================================
// SAVE / UPDATE DOCTOR SUGGESTION
// ======================================================
async function saveSuggestion(req, res) {
  try {
    const { reportId, suggestion } = req.body;
    const doctorId = req.user.id;

    const doctorRecord = await DoctorReport.findOne({ doctorId });
    if (!doctorRecord) return res.status(404).json({ message: "Doctor record not found" });

    const report = doctorRecord.reports.id(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Empty = delete suggestion
    if (suggestion.trim() === "") {
      report.suggestion = {
        text: "",
        doctor: req.user.name,
        when: new Date().toISOString(),
        deleted: true,
        edited: true
      };
    } else {
      report.suggestion = {
        text: suggestion,
        doctor: req.user.name,
        when: new Date().toISOString(),
        edited: report.suggestion?.text ? true : false,
        deleted: false
      };
    }

    // Notify user
    report.userNotified = false;

    await doctorRecord.save();

    res.json({ message: "Suggestion saved", suggestion: report.suggestion });
  } catch (err) {
    console.error("SAVE SUGGESTION ERROR", err);
    res.status(500).json({ message: "Error saving suggestion" });
  }
}

// ======================================================
// MARK NOTIFICATIONS AS READ (User Dashboard)
// ======================================================
async function markNotificationsRead(req, res) {
  try {
    const userId = req.user.id;

    const reports = await DoctorReport.find({
      "reports.patientId": userId
    });

    reports.forEach((doc) => {
      let updated = false;
      doc.reports.forEach((r) => {
        if (!r.userNotified && r.patientId.toString() === userId) {
          r.userNotified = true;
          updated = true;
        }
      });
      if (updated) doc.save();
    });

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
}

// EXPORT ALL FUNCTIONS
module.exports = {
  sendReport,
  getReportsForDoctor,
  getUserNotifications,
  saveSuggestion,
  markNotificationsRead
};

