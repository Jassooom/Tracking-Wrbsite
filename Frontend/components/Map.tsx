import { useEffect, useRef } from 'react'

type Asset = {
  asset_id: string; asset_code: string; asset_name: string; status: string
  lat: number; lng: number; speed: number
}

type MapProps = { assets: Asset[]; selectedAsset: Asset | null }

const STATUS_COLOR: Record<string, string> = {
  active: '#10b981', idle: '#f59e0b', offline: '#ef4444', in_transit: '#3b82f6', maintenance: '#8b5cf6'
}

export default function Map({ assets, selectedAsset }: MapProps) {
  const mapRef    = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current || !containerRef.current) return
    const L = require('leaflet')
    mapRef.current = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([3.14, 101.68], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18
    }).addTo(mapRef.current)
  }, [])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return
    const L = require('leaflet')
    assets.forEach(asset => {
      const color = STATUS_COLOR[asset.status] || '#8892a4'
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
        <ellipse cx="12" cy="30" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
        <path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 20 8 20s8-14 8-20c0-4.4-3.6-8-8-8z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="8" r="4" fill="white" opacity="0.9"/>
      </svg>`
      const icon = L.divIcon({ html: svg, iconSize: [24, 32], iconAnchor: [12, 32], popupAnchor: [0, -32], className: '' })

      if (markersRef.current[asset.asset_id]) {
        markersRef.current[asset.asset_id].setLatLng([asset.lat, asset.lng]).setIcon(icon)
          .setPopupContent(`<div style="font-family:sans-serif;min-width:140px"><strong>${asset.asset_code}</strong><br/><span style="color:#8892a4;font-size:12px">${asset.asset_name}</span><br/><span style="font-size:11px;margin-top:4px;display:block">Speed: ${asset.speed.toFixed(1)} km/h</span></div>`)
      } else {
        const marker = L.marker([asset.lat, asset.lng], { icon })
          .bindPopup(`<div style="font-family:sans-serif;min-width:140px"><strong>${asset.asset_code}</strong><br/><span style="color:#8892a4;font-size:12px">${asset.asset_name}</span><br/><span style="font-size:11px;margin-top:4px;display:block">Speed: ${asset.speed.toFixed(1)} km/h</span></div>`)
          .addTo(mapRef.current)
        markersRef.current[asset.asset_id] = marker
      }
    })
  }, [assets])

  // Fly to selected
  useEffect(() => {
    if (!mapRef.current || !selectedAsset) return
    mapRef.current.flyTo([selectedAsset.lat, selectedAsset.lng], 15, { duration: 1.2 })
    markersRef.current[selectedAsset.asset_id]?.openPopup()
  }, [selectedAsset])

  return (
    <div style={{ position:'relative', height:'100%', width:'100%' }}>
      <div ref={containerRef} style={{ height:'100%', width:'100%', borderRadius:12 }} />
      <div style={{ position:'absolute', top:12, left:12, zIndex:1000, display:'flex', flexDirection:'column', gap:6, background:'rgba(26,33,51,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 12px' }}>
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#8892a4' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
            <span style={{ textTransform:'capitalize' }}>{s.replace('_',' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
