const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  totalVisits: { type: Number, default: 0 },
  uniqueIPs: { type: [String], default: [] }
});

visitorSchema.virtual('uniqueVisitors').get(function () {
  return this.uniqueIPs.length;
});

// Enable virtuals to be included when converting to JSON
visitorSchema.set('toJSON', { virtuals: true });
visitorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Visitor', visitorSchema);
