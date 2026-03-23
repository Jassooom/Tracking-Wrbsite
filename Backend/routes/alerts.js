const express = require('express');
const { readTable, insertRow, updateRow } = require('../utils/csvDb');
const { auth } = require('./auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  try {
    const alerts = readTable('alerts');
    const assets = readTable('assets');
    const { status } = req.query;
    let result = alerts.map(al => {
      const asset = assets.find(a => String(a.asset_id) === String(al.asset_id));
      return { ...al, asset_code: asset?.asset_code, asset_name: asset?.asset_name };
    });
    if (status === 'active') result = result.filter(a => a.is_resolved === '0');
    result.sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
    res.json(result.slice(0, 50));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, (req, res) => {
  try {
    const { asset_id, alert_type, severity, message, latitude, longitude } = req.body;
    const alert = insertRow('alerts', 'alert_id', { asset_id, alert_type, severity, message, latitude, longitude, is_resolved: 0, triggered_at: new Date().toISOString() });
    const io = req.app.get('io');
    io.emit('alert', alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, (req, res) => {
  const updates = { ...req.body };
  if (req.body.is_resolved == 1) {
    updates.resolved_by = req.userId;
    updates.resolved_at = new Date().toISOString();
  }
  const updated = updateRow('alerts', 'alert_id', req.params.id, updates);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

module.exports = router;
