const Location = require('../models/Location');

// 🟢 GET /api/locations — Get all grouped
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    const formatted = {};

    locations.forEach(loc => {
      if (!formatted[loc.state]) formatted[loc.state] = {};
      if (!formatted[loc.state][loc.city]) formatted[loc.state][loc.city] = [];
      formatted[loc.state][loc.city].push(...loc.postalCodes);
    });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
  }
};

// 🔍 GET /api/locations/filter?state=MP&city=Bhopal
exports.filterLocations = async (req, res) => {
  try {
    const { state, city } = req.query;
    const query = {};

    if (state) query.state = state;
    if (city) query.city = city;

    const results = await Location.find(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error filtering locations', error: err.message });
  }
};

// ➕ POST /api/locations — Add a new location
exports.addLocation = async (req, res) => {
  try {
    const { state, city, postalCodes } = req.body;

    const exists = await Location.findOne({ state, city });
    if (exists) return res.status(409).json({ message: 'Location already exists' });

    const newLocation = new Location({ state, city, postalCodes });
    const saved = await newLocation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error adding location', error: err.message });
  }
};

// ✏️ PUT /api/locations/:id — Update by ID
exports.updateLocation = async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating location', error: err.message });
  }
};

// ❌ DELETE /api/locations/:id — Delete by ID
exports.deleteLocation = async (req, res) => {
  try {
    const deleted = await Location.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Location not found' });
    res.status(200).json({ message: 'Location deleted', deleted });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting location', error: err.message });
  }
};
