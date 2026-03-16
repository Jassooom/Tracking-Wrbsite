const express = require('express');
const Vehicle = require('../models/Vehicle');
const { auth } = require('./auth');

const router = express.Router();

// Get all vehicles for user
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.userId }).populate('owner', 'name email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.userId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create vehicle
router.post('/', auth, async (req, res) => {
  try {
    const { name, licensePlate, deviceId } = req.body;
    const vehicle = new Vehicle({ name, licensePlate, deviceId, owner: req.userId });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'License plate or device ID already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, licensePlate, status, deviceId } = req.body;
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, licensePlate, status, deviceId },
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;