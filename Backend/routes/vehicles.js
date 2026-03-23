const express = require('express');
const { readTable, insertRow, updateRow } = require('../utils/csvDb');
const { auth } = require('./auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  try {
    const assets = readTable('assets');
    const lastLocs = readTable('asset_last_location');
    const types = readTable('asset_types');

    const vehicles = assets.map(a => {
      const loc = lastLocs.find(l => String(l.asset_id) === String(a.asset_id));
      const type = types.find(t => String(t.type_id) === String(a.type_id));
      return {
        _id: a.asset_id,
        name: a.asset_name,
        licensePlate: a.asset_code,
        status: a.status,
        type: type?.type_name || 'Unknown',
        lastLocation: loc ? { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude), speed: parseFloat(loc.speed_kmh || 0), timestamp: loc.last_ping } : null
      };
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, (req, res) => {
  const assets = readTable('assets');
  const asset = assets.find(a => String(a.asset_id) === String(req.params.id));
  if (!asset) return res.status(404).json({ message: 'Not found' });
  res.json(asset);
});

router.post('/', auth, (req, res) => {
  try {
    const { name, licensePlate, type } = req.body;
    const typeRow = readTable('asset_types').find(t => t.type_name.toLowerCase() === (type||'vehicle').toLowerCase());
    const newAsset = insertRow('assets', 'asset_id', {
      type_id: typeRow?.type_id || 1, asset_code: licensePlate, asset_name: name,
      status: 'idle', created_by: req.userId
    });
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, (req, res) => {
  const updated = updateRow('assets', 'asset_id', req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

module.exports = router;
