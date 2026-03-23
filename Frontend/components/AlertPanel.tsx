type Alert = { alert_id: string; alert_type: string; severity: string; message: string; asset_code?: string; is_resolved: string; triggered_at: string }

const SEV: Record<string, { bg: string; color: string }> = {
  critical: { bg: 'rgba(239,68,68,0.08)',   color: '#ef4444' },
  warning:  { bg: 'rgba(245,158,11,0.08)',  color: '#f59e0b' },
  info:     { bg: 'rgba(59,130,246,0.08)',  color: '#3b82f6' },
}

export default function AlertPanel({ alerts, onResolve }: { alerts: Alert[]; onResolve: (id: string) => void }) {
  const open = alerts.filter(a => a.is_resolved === '0')
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:500 }}>Active Alerts</span>
        {open.length > 0 && <span style={{ fontSize:10, background:'rgba(239,68,68,0.12)', color:'#ef4444', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{open.length}</span>}
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {open.map(alert => {
          const s = SEV[alert.severity] || SEV.info
          return (
            <div key={alert.alert_id} style={{ padding:'10px 12px', borderRadius:8, background:s.bg, border:`1px solid ${s.color}22` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:s.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{alert.alert_type.replace(/_/g,' ')}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{alert.message}</div>
                  {alert.asset_code && <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:3 }}>{alert.asset_code}</div>}
                </div>
                <button onClick={() => onResolve(alert.alert_id)} style={{ fontSize:10, padding:'3px 8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, color:'var(--text3)', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>Resolve</button>
              </div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:4, fontFamily:'var(--mono)' }}>
                {new Date(alert.triggered_at).toLocaleString('en-MY', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
              </div>
            </div>
          )
        })}
        {open.length === 0 && <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:20 }}>No active alerts</div>}
      </div>
    </div>
  )
}
