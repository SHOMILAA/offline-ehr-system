const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// @route   POST /api/admin/register
// @desc    Register a new admin
router.post('/register', async (req, res) => {
  try {
    const { hospitalName, name, hospitalEmail, password } = req.body;

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ hospitalEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new Admin
    const newAdmin = new Admin({
      hospitalName,
      name,
      hospitalEmail,
      password 
    });

    // Save to the database
    await newAdmin.save();

    // Success response
    res.status(201).json({ message: 'Admin Registered Successfully' });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  try {
    const { hospitalEmail, password } = req.body;
    const admin = await Admin.findOne({ hospitalEmail });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    // In production, use bcrypt!
    if (admin.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin._id, role: 'Admin' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    
    res.json({ token, admin: { id: admin._id, name: admin.name, hospitalEmail: admin.hospitalEmail, hospitalName: admin.hospitalName } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
