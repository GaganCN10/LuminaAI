const mongoose = require("mongoose");

const DoctorReportSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  reports: [
  {
    id: String,

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    patientName: String,
    createdAt: String,
    status: {
      type: String,
      enum: ["new", "accepted", "declined"],
      default: "new"
    },

    reportData: {
      moods: Array,
      meals: Array,
      medications: Array,
      summary: String
    },

    suggestion: {
      text: String,
      doctor: String,
      when: String,
      edited: Boolean,
      deleted: Boolean
    },

    userNotified: {
      type: Boolean,
      default: false
    } 
  }
]

});

module.exports = mongoose.model("DoctorReport", DoctorReportSchema);
