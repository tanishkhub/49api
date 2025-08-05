const express = require('express');
const router = express.Router();
const locationController = require('../controllers/Location.js');

// GET all locations
router.get('/locations', locationController.getAllLocations);
router.get('/locations/filter', locationController.filterLocations);
router.post('/locations', locationController.addLocation);
router.put('/locations/:id', locationController.updateLocation);
router.delete('/locations/:id', locationController.deleteLocation);

module.exports = router;
