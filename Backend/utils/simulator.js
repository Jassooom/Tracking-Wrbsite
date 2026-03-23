const { readTable, updateRow } = require('./csvDb');

// Small random walk for each asset
function nudge(val, range) {
  return parseFloat((parseFloat(val) + (Math.random() - 0.5) * range).toFixed(7));
}

function simulateLiveUpdates(io) {
  setInterval(() => {
    try {
      const assets = readTable('assets').filter(a => a.status === 'active');
      const lastLocs = readTable('asset_last_location');

      assets.forEach(asset => {
        const loc = lastLocs.find(l => String(l.asset_id) === String(asset.asset_id));
        if (!loc) return;

        const newLat = nudge(loc.latitude, 0.002);
        const newLng = nudge(loc.longitude, 0.002);
        const newSpeed = (Math.random() * 60).toFixed(1);

        updateRow('asset_last_location', 'asset_id', asset.asset_id, {
          latitude: newLat,
          longitude: newLng,
          speed_kmh: newSpeed,
          last_ping: new Date().toISOString()
        });

        io.emit('location-update', {
          asset_id: asset.asset_id,
          asset_code: asset.asset_code,
          latitude: newLat,
          longitude: newLng,
          speed_kmh: parseFloat(newSpeed),
          status: asset.status
        });
      });
    } catch (e) {
      // silent — CSV might be locked
    }
  }, 8000);
}

module.exports = { simulateLiveUpdates };
