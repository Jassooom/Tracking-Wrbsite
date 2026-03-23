const express = require('express');
const { readTable, insertRow, updateRow } = require('../utils/csvDb');
const { auth } = require('./auth');

const router = express.Router();

// Latest positions for all assets
router.get('/', auth, (req, res) => {
  try {
    const locs = readTable('asset_last_location');
    const assets = readTable('assets');
    const result = locs.map(l => {
      const asset = assets.find(a => String(a.asset_id) === String(l.asset_id));
      return { ...l, asset_code: asset?.asset_code, asset_name: asset?.asset_name, status: asset?.status };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// History for a specific asset
router.get('/vehicle/:vehicleId', auth, (req, res) => {
  const logs = readTable('location_logs').filter(l => String(l.asset_id) === String(req.params.vehicleId));
  res.json(logs.slice(-100));
});

// Ingest new location ping (from GPS device)
router.post('/', (req, res) => {
  try {
    const { deviceId, lat, lng, speed, heading, accuracy } = req.body;
    const devices = readTable('tracking_devices');
    const device = devices.find(d => d.device_code === deviceId || d.imei === deviceId);
    if (!device) return res.status(404).json({ message: 'Device not found' });

    insertRow('location_logs', 'log_id', {
      asset_id: device.asset_id, device_id: device.device_id,
      latitude: lat, longitude: lng, speed_kmh: speed, heading_deg: heading,
      accuracy_m: accuracy, recorded_at: new Date().toISOString()
    });
    updateRow('asset_last_location', 'asset_id', device.asset_id, {
      latitude: lat, longitude: lng, speed_kmh: speed, heading_deg: heading, last_ping: new Date().toISOString()
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
