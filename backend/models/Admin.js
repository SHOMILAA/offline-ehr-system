const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hospitalEmail: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Create the model using the schema
const Admin = mongoose.model('Admin', adminSchema);

// Export the model heavily for use in other files
module.exports = Admin;
