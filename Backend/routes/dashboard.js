const express = require('express');
const { readTable } = require('../utils/csvDb');
const { auth } = require('./auth');

const router = express.Router();

router.get('/summary', auth, (req, res) => {
  try {
    const assets      = readTable('assets');
    const deliveries  = readTable('deliveries');
    const alerts      = readTable('alerts');
    const locs        = readTable('asset_last_location');
    const logs        = readTable('location_logs');

    const totalAssets     = assets.filter(a => a.status !== 'decommissioned').length;
    const activeDeliveries = deliveries.filter(d => d.status === 'in_transit').length;
    const openAlerts       = alerts.filter(a => a.is_resolved === '0').length;

    // Avg delivery time (minutes) for delivered orders
    const delivered = deliveries.filter(d => d.delivered_at && d.picked_up_at);
    const avgTime = delivered.length
      ? delivered.reduce((sum, d) => {
          const diff = (new Date(d.delivered_at) - new Date(d.picked_up_at)) / 60000;
          return sum + diff;
        }, 0) / delivered.length
      : 0;

    // Asset status breakdown
    const byStatus = assets.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1; return acc;
    }, {});

    // Last 7 days delivery counts
    const now = new Date();
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const inTransit  = deliveries.filter(del => del.picked_up_at?.startsWith(dateStr)).length;
      const completed  = deliveries.filter(del => del.delivered_at?.startsWith(dateStr)).length;
      return { date: dateStr, day: d.toLocaleDateString('en-MY', { weekday: 'short' }), inTransit, completed };
    });

    // Recent live locations
    const liveMap = locs.map(l => {
      const asset = assets.find(a => String(a.asset_id) === String(l.asset_id));
      return { asset_id: l.asset_id, asset_code: asset?.asset_code, asset_name: asset?.asset_name, status: asset?.status, lat: parseFloat(l.latitude), lng: parseFloat(l.longitude), speed: parseFloat(l.speed_kmh || 0), last_ping: l.last_ping };
    });

    res.json({ totalAssets, activeDeliveries, openAlerts, avgDeliveryMin: Math.round(avgTime), byStatus, weekly, liveMap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
