const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: { type: String, required: true },
  doctorNotes: { type: String },
  nextVisit: { type: Date },
  allergies: { type: String },
  bloodPressure: { type: String },
  temperature: { type: String },
  heartRate: { type: String },
  hospitalName: { type: String },
  visitDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
