const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  speed: {
    type: Number,
    default: 0,
    min: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360
  },
  accuracy: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
locationSchema.index({ vehicleId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);