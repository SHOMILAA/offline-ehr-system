const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  assignedDoctor: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  symptoms: { type: String },
  diagnosis: { type: String },
  medicines: { type: String },
  doctorNotes: { type: String },
  visitDate: { type: Date },
  nextVisit: { type: Date },
  allergies: { type: String },
  bloodPressure: { type: String },
  temperature: { type: String },
  heartRate: { type: String },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
