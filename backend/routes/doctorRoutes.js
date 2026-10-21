const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// @route   POST /api/doctor/login
// @desc    Doctor login
router.post('/login', async (req, res) => {
  try {
    const { hospitalEmail, password } = req.body;
    const doctor = await Doctor.findOne({ hospitalEmail });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    if (doctor.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: doctor._id, role: 'Doctor' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    
    res.json({ token, doctor: { id: doctor._id, name: doctor.name, hospitalEmail: doctor.hospitalEmail, hospitalName: doctor.hospitalName } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/doctor/register
// @desc    Register new doctor (usually done by Admin)
router.post('/register', async (req, res) => {
  try {
    const { name, hospitalEmail, password, specialization, hospitalName } = req.body;
    const existingDoctor = await Doctor.findOne({ hospitalEmail });
    if (existingDoctor) return res.status(400).json({ message: 'Doctor already exists' });

    const newDoctor = new Doctor({ name, hospitalEmail, password, specialization, hospitalName });
    await newDoctor.save();

    res.status(201).json({ message: 'Doctor Registered Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET /api/doctor
// @desc    Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
