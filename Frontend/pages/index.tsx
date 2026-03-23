import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import VehicleList from '../components/VehicleList'
import AlertPanel from '../components/AlertPanel'

// Leaflet must be loaded client-side only
const Map = dynamic(() => import('../components/Map'), { ssr: false })

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

type Asset = { _id: string; name: string; licensePlate: string; status: string; type?: string; lastLocation?: { lat: number; lng: number; speed: number; timestamp: string } | null }
type MapAsset = { asset_id: string; asset_code: string; asset_name: string; status: string; lat: number; lng: number; speed: number }
type Alert = { alert_id: string; alert_type: string; severity: string; message: string; asset_code?: string; is_resolved: string; triggered_at: string }
type Summary = { totalAssets: number; activeDeliveries: number; openAlerts: number; avgDeliveryMin: number; byStatus: Record<string,number>; weekly: { day: string; inTransit: number; completed: number }[]; liveMap: MapAsset[] }

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]               = useState<any>(null)
  const [assets, setAssets]           = useState<Asset[]>([])
  const [mapAssets, setMapAssets]     = useState<MapAsset[]>([])
  const [alerts, setAlerts]           = useState<Alert[]>([])
  const [summary, setSummary]         = useState<Summary | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedMapAsset, setSelectedMapAsset] = useState<MapAsset | null>(null)
  const [filter, setFilter]           = useState('all')
  const [activeNav, setActiveNav]     = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

  const fetchAll = useCallback(async () => {
    try {
      const [vRes, aRes, sRes] = await Promise.all([
        fetch(`${BACKEND}/api/vehicles`, { headers: headers() }),
        fetch(`${BACKEND}/api/alerts?status=active`, { headers: headers() }),
        fetch(`${BACKEND}/api/dashboard/summary`, { headers: headers() }),
      ])
      if (vRes.status === 401) { router.replace('/login'); return }
      const [vData, aData, sData] = await Promise.all([vRes.json(), aRes.json(), sRes.json()])
      setAssets(Array.isArray(vData) ? vData : [])
      setAlerts(Array.isArray(aData) ? aData : [])
      setSummary(sData)
      setMapAssets(sData.liveMap || [])
    } catch { toast.error('Failed to load data') }
  }, [router])

  useEffect(() => {
    const t = token(); const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (!t) { router.replace('/login'); return }
    if (u) setUser(JSON.parse(u))
    fetchAll()
    // Refresh every 15s
    const interval = setInterval(fetchAll, 15000)

    // Socket.io
    const io = require('socket.io-client')
    const socket = io(BACKEND)
    socket.on('location-update', (data: any) => {
      setMapAssets(prev => prev.map(a => String(a.asset_id) === String(data.asset_id) ? { ...a, lat: data.latitude, lng: data.longitude, speed: data.speed_kmh } : a))
      setAssets(prev => prev.map(a => String(a._id) === String(data.asset_id) ? { ...a, lastLocation: { lat: data.latitude, lng: data.longitude, speed: data.speed_kmh, timestamp: new Date().toISOString() } } : a))
    })
    socket.on('alert', (alert: any) => {
      setAlerts(prev => [alert, ...prev])
      toast.error(`Alert: ${alert.message}`, { duration: 6000 })
    })
    return () => { socket.disconnect(); clearInterval(interval) }
  }, [router, fetchAll])

  const resolveAlert = async (id: string) => {
    await fetch(`${BACKEND}/api/alerts/${id}`, { method:'PUT', headers: headers(), body: JSON.stringify({ is_resolved: 1 }) })
    setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, is_resolved: '1' } : a))
    toast.success('Alert resolved')
  }

  const logout = () => { localStorage.clear(); router.replace('/login') }

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    if (asset.lastLocation) setSelectedMapAsset({ asset_id: asset._id, asset_code: asset.licensePlate, asset_name: asset.name, status: asset.status, lat: asset.lastLocation.lat, lng: asset.lastLocation.lng, speed: asset.lastLocation.speed })
  }

  const kpiCards = summary ? [
    { label: 'Total Assets', value: summary.totalAssets, delta: 'tracked', color: '#3b82f6', icon: '◈' },
    { label: 'Active Deliveries', value: summary.activeDeliveries, delta: 'in transit', color: '#10b981', icon: '⬡' },
    { label: 'Avg Delivery Time', value: `${Math.round(summary.avgDeliveryMin)}m`, delta: 'minutes avg', color: '#f59e0b', icon: '◷' },
    { label: 'Open Alerts', value: summary.openAlerts, delta: 'unresolved', color: '#ef4444', icon: '⚠' },
  ] : []

  const navItems = [
    { id:'dashboard', label:'Dashboard', icon:'▦' },
    { id:'map', label:'Live Map', icon:'◎' },
    { id:'assets', label:'Assets', icon:'◈' },
    { id:'alerts', label:'Alerts', icon:'⚠' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'var(--font)', background:'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 64, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50, transition:'width 0.2s' }}>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg viewBox="0 0 24 24" style={{ width:16, height:16, fill:'white' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          {sidebarOpen && <div style={{ fontSize:15, fontWeight:600 }}>Track<span style={{ color:'var(--accent)' }}>Core</span></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>☰</button>
        </div>

        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setActiveNav(item.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, cursor:'pointer', background: activeNav === item.id ? 'var(--accent-glow)' : 'transparent', color: activeNav === item.id ? 'var(--accent)' : 'var(--text2)', fontSize:13.5, transition:'all 0.15s' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.id === 'alerts' && summary?.openAlerts ? <span style={{ marginLeft:'auto', background:'var(--accent4)', color:'white', fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:10 }}>{summary.openAlerts}</span> : null}
            </div>
          ))}
        </nav>

        {user && (
          <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent5))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white', flexShrink:0 }}>
                {user.name?.slice(0,2).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>Administrator</div>
                </div>
              )}
              {sidebarOpen && <button onClick={logout} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:12 }}>⏻</button>}
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ marginLeft: sidebarOpen ? 240 : 64, flex:1, display:'flex', flexDirection:'column', transition:'margin-left 0.2s' }}>
        {/* Topbar */}
        <header style={{ height:60, background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 24px', gap:16, position:'sticky', top:0, zIndex:40 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:500 }}>Dashboard</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>{new Date().toLocaleDateString('en-MY', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', width:200 }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>🔍</span>
            <input placeholder="Search assets…" style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, width:'100%' }} />
          </div>
          <button onClick={fetchAll} style={{ width:36, height:36, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontSize:16 }} title="Refresh">↻</button>
        </header>

        <div style={{ padding:24, flex:1, display:'flex', flexDirection:'column', gap:20 }}>
          {/* KPI row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {kpiCards.map((k, i) => (
              <div key={i} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.color, borderRadius:'12px 12px 0 0' }} />
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>{k.label}</div>
                <div style={{ fontSize:28, fontWeight:600, fontFamily:'var(--mono)', letterSpacing:'-0.02em', color:'var(--text)' }}>{k.value}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Middle row: chart + map */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Bar chart */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Delivery Activity</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>Last 7 days — in transit vs completed</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120, marginBottom:8 }}>
                {(summary?.weekly || []).map((w, i) => {
                  const max = Math.max(...(summary?.weekly || []).map(x => Math.max(x.inTransit, x.completed)), 1)
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:100 }}>
                        <div style={{ flex:1, background:'var(--accent)', borderRadius:'3px 3px 0 0', height:`${(w.inTransit/max)*100}%`, opacity:0.8, minHeight: w.inTransit>0?4:0 }} />
                        <div style={{ flex:1, background:'var(--accent2)', borderRadius:'3px 3px 0 0', height:`${(w.completed/max)*100}%`, opacity:0.8, minHeight: w.completed>0?4:0 }} />
                      </div>
                      <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>{w.day}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}><div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)' }}/> In Transit</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}><div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent2)' }}/> Completed</div>
              </div>
            </div>

            {/* Live map */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>Live Asset Map</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{mapAssets.length} assets tracked</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--accent2)' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent2)', animation:'pulse 2s infinite' }}/>
                  Live
                </div>
              </div>
              <div style={{ flex:1, minHeight:260 }}>
                <Map assets={mapAssets} selectedAsset={selectedMapAsset} />
              </div>
            </div>
          </div>

          {/* Bottom row: asset list + alerts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Asset list */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:14, fontWeight:500 }}>Assets</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{assets.length} total</div>
              </div>
              <div style={{ padding:'12px 14px', flex:1, overflow:'hidden' }}>
                <VehicleList assets={assets} selectedAsset={selectedAsset} onSelect={handleSelectAsset} filter={filter} onFilterChange={setFilter} />
              </div>
            </div>

            {/* Alert panel */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:500 }}>Alerts</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>Unresolved issues requiring attention</div>
              </div>
              <div style={{ padding:'12px 14px', flex:1, overflow:'hidden' }}>
                <AlertPanel alerts={alerts} onResolve={resolveAlert} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
