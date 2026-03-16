const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  type: {
    type: String,
    enum: ['geofence-enter', 'geofence-exit', 'speed-violation', 'breakdown', 'unauthorized-movement', 'low-fuel', 'maintenance-due'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    lat: Number,
    lng: Number
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
alertSchema.index({ vehicleId: 1, status: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);