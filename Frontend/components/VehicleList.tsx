type Asset = { _id: string; name: string; licensePlate: string; status: string; type?: string; lastLocation?: { lat: number; lng: number; speed: number; timestamp: string } | null }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  idle:       { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  offline:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  in_transit: { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  maintenance:{ bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6' },
}

export default function VehicleList({ assets, selectedAsset, onSelect, filter, onFilterChange }: {
  assets: Asset[]; selectedAsset: Asset | null; onSelect: (a: Asset) => void
  filter: string; onFilterChange: (f: string) => void
}) {
  const filtered = filter === 'all' ? assets : assets.filter(a => a.status === filter)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        {['all','active','idle','offline'].map(f => (
          <button key={f} onClick={() => onFilterChange(f)}
            style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:500, border:'none', cursor:'pointer', textTransform:'capitalize',
              background: filter === f ? 'var(--accent)' : 'var(--bg3)', color: filter === f ? 'white' : 'var(--text3)' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(asset => {
          const s = STATUS_STYLE[asset.status] || STATUS_STYLE.idle
          const isSelected = selectedAsset?._id === asset._id
          return (
            <div key={asset._id} onClick={() => onSelect(asset)} style={{ padding:'12px 14px', borderRadius:10, cursor:'pointer', border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)', background: isSelected ? 'rgba(59,130,246,0.08)' : 'var(--bg3)', transition:'all 0.15s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{asset.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{asset.licensePlate}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:500, padding:'3px 7px', borderRadius:20, background:s.bg, color:s.color, textTransform:'capitalize', whiteSpace:'nowrap' }}>
                  {asset.status.replace('_',' ')}
                </span>
              </div>
              {asset.lastLocation && (
                <div style={{ marginTop:6, fontSize:11, color:'var(--text3)' }}>
                  Speed: {asset.lastLocation.speed.toFixed(1)} km/h &nbsp;·&nbsp; {new Date(asset.lastLocation.timestamp).toLocaleTimeString('en-MY', { hour:'2-digit', minute:'2-digit' })}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:20 }}>No assets found</div>}
      </div>
    </div>
  )
}
