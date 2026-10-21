const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const MedicalHistory = require('../models/MedicalHistory');

// @route   POST /api/sync
// @desc    Sync local offline data to MongoDB
router.post('/', async (req, res) => {
    try {
        const { patients, medicalHistories } = req.body;

        let idMapping = {}; // Map temp IDs to real Mongo IDs

        // Process patients
        if (patients && patients.length > 0) {
            for (const p of patients) {
                if (p.isNewRecord) { // Custom flag from frontend indicating it's new
                    const { _id, id, mongoId, isNewRecord, isEdited, ...patientData } = p;
                    // check if phone number exists to avoid duplicates
                    let existing = await Patient.findOne({ phoneNumber: patientData.phoneNumber });
                    if (!existing) {
                        existing = await Patient.create(patientData);
                    }
                    if (mongoId && existing) {
                        idMapping[mongoId] = existing._id.toString();
                    }
                } else if (p.isEdited) {
                    // Update existing
                    const { _id, id, mongoId, isNewRecord, isEdited, ...patientData } = p;
                    const searchId = mongoId || _id || id;
                    if (searchId) {
                        await Patient.findByIdAndUpdate(searchId, patientData);
                    }
                }
            }
        }

        // Process patient deletions
        if (req.body.deletedPatients && req.body.deletedPatients.length > 0) {
            for (const id of req.body.deletedPatients) {
                if (id) {
                    await Patient.findByIdAndDelete(id);
                    await MedicalHistory.deleteMany({ patientId: id });
                }
            }
        }

        // Process medical histories
        if (medicalHistories && medicalHistories.length > 0) {
            for (const mh of medicalHistories) {
                if (mh.isNewRecord) {
                    const { _id, id, isNewRecord, ...historyData } = mh;
                    // Translate patientId if it was in the idMapping
                    if (idMapping[historyData.patientId]) {
                        historyData.patientId = idMapping[historyData.patientId];
                    }

                    // ensure patient exists
                    let patient;
                    try {
                        patient = await Patient.findById(historyData.patientId);
                    } catch (e) {
                         // invalid objectId skip
                         console.error("Invalid patient ID:", historyData.patientId);
                    }

                    if (patient) {
                        await MedicalHistory.create(historyData);
                    }
                }
            }
        }

        res.json({ message: 'Sync successful' });
    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ message: 'Server error during sync', error: err.message });
    }
});

module.exports = router;
