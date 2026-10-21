const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const MedicalHistory = require('../models/MedicalHistory');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

// @route   GET /api/patients
// @desc    Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find({});
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/patients/request-otp
// @desc    Request OTP for patient login
router.post('/request-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const patient = await Patient.findOne({ phoneNumber });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        patient.otp = otp;
        patient.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins
        await patient.save();

        // In a real app, send OTP via SMS. For now, just return it or log it
        console.log(`OTP for ${phoneNumber} is ${otp}`);
        res.json({ message: 'OTP sent successfully (check console)' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/patients/verify-otp
// @desc    Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const patient = await Patient.findOne({ phoneNumber });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        if (patient.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (patient.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });

        // clear otp
        patient.otp = undefined;
        patient.otpExpiry = undefined;
        await patient.save();

        const token = jwt.sign({ id: patient._id, role: 'Patient' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
        res.json({ token, patient: { id: patient._id, patientName: patient.patientName, phoneNumber: patient.phoneNumber } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/patients
// @desc    Add a new patient
router.post('/', async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        
        let patientObj = patient.toObject();
        // Resolve doctor name if it's an ObjectId
        if (patientObj.assignedDoctor && patientObj.assignedDoctor.length === 24) {
            const Doctor = require('../models/Doctor');
            const doc = await Doctor.findById(patientObj.assignedDoctor);
            if (doc) patientObj.assignedDoctor = doc.name;
        }

        res.json(patientObj);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   PUT /api/patients/:id
// @desc    Update a patient
router.put('/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });
        res.json(updatedPatient);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete a patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        // Optionally delete associated history
        await MedicalHistory.deleteMany({ patientId: req.params.id });
        res.json({ message: 'Patient and associated history deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   POST /api/patients/:id/visits
// @desc    Add a medical visit history
router.post('/:id/visits', async (req, res) => {
    try {
        const historyData = { ...req.body, patientId: req.params.id };
        const newHistory = new MedicalHistory(historyData);
        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (err) {
        res.status(500).json({ message: 'Server error adding visit', error: err.message });
    }
});

// @route   GET /api/patients/:id/visits
// @desc    Get medical visit history for a patient
router.get('/:id/visits', async (req, res) => {
    try {
        const history = await MedicalHistory.find({ patientId: req.params.id }).sort({ visitDate: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
