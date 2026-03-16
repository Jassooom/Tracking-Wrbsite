const express = require('express');
const Alert = require('../models/Alert');
const Vehicle = require('../models/Vehicle');
const { auth } = require('./auth');

const router = express.Router();

// Get alerts for user
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.userId }, '_id');
    const vehicleIds = vehicles.map(v => v._id);
    
    const { status = 'active', limit = 50 } = req.query;
    const alerts = await Alert.find({ 
      vehicleId: { $in: vehicleIds },
      status: status
    })
    .populate('vehicleId', 'name licensePlate')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alerts for specific vehicle
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, owner: req.userId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const { status = 'active', limit = 50 } = req.query;
    const alerts = await Alert.find({ 
      vehicleId: req.params.vehicleId,
      status: status
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create alert (internal use, or for testing)
router.post('/', auth, async (req, res) => {
  try {
    const { vehicleId, type, message, severity, location, data } = req.body;
    
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.userId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const alert = new Alert({
      vehicleId,
      type,
      message,
      severity,
      location,
      data
    });
    
    await alert.save();
    
    // Emit real-time alert
    const io = req.app.get('io');
    io.to(vehicleId).emit('alert', alert);
    
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alert status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, acknowledgedBy } = req.body;
    
    const updateData = { status };
    if (status === 'acknowledged' && acknowledgedBy) {
      updateData.acknowledgedBy = acknowledgedBy;
      updateData.acknowledgedAt = new Date();
    } else if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const alert = await Alert.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('vehicleId', 'name licensePlate');
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;