const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCodes: [String], // Array of pincodes for the city
});

module.exports = mongoose.model('Location', locationSchema);
