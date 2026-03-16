const express = require('express');
const Location = require('../models/Location');
const Vehicle = require('../models/Vehicle');
const { auth } = require('./auth');

const router = express.Router();

// Get locations for a vehicle
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, owner: req.userId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const { limit = 100, startDate, endDate } = req.query;
    let query = { vehicleId: req.params.vehicleId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new location (typically from device)
router.post('/', async (req, res) => {
  try {
    const { deviceId, lat, lng, speed, heading, accuracy } = req.body;
    
    const vehicle = await Vehicle.findOne({ deviceId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const location = new Location({
      vehicleId: vehicle._id,
      lat,
      lng,
      speed,
      heading,
      accuracy
    });
    
    await location.save();
    
    // Update vehicle's last location
    vehicle.lastLocation = { lat, lng, timestamp: location.timestamp };
    await vehicle.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(vehicle._id.toString()).emit('location-update', {
      vehicleId: vehicle._id,
      location: location
    });
    
    // Check for alerts (simplified - in real app, check geofences, speed limits, etc.)
    // This would trigger alert creation logic
    
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest location for all user's vehicles
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.userId }, '_id name licensePlate lastLocation');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;