import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('admin@trackcore.my')
  const [password, setPassword] = useState('admin123')
  const [name, setName]         = useState('')
  const [isReg, setIsReg]       = useState(false)
  const [loading, setLoading]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const endpoint = isReg ? '/api/auth/register' : '/api/auth/login'
    const body: any = { email, password }
    if (isReg) body.name = name
    try {
      const res  = await fetch(`${BACKEND}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message || 'Failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.replace('/')
    } catch { toast.error('Cannot connect to server') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:'var(--font)' }}>
      <div style={{ width:420, background:'var(--panel)', border:'1px solid var(--border)', borderRadius:16, padding:40 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
          <div style={{ width:40, height:40, background:'var(--accent)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:'white' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:600, color:'var(--text)' }}>Track<span style={{ color:'var(--accent)' }}>Core</span></div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>Tracking Management System</div>
          </div>
        </div>

        <h2 style={{ fontSize:18, fontWeight:500, marginBottom:24, color:'var(--text)' }}>{isReg ? 'Create account' : 'Sign in to continue'}</h2>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {isReg && (
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6 }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                style={{ width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, outline:'none' }} />
            </div>
          )}
          <div>
            <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, outline:'none' }} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, outline:'none' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ marginTop:8, padding:'12px', background:'var(--accent)', border:'none', borderRadius:8, color:'white', fontSize:14, fontWeight:500, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait…' : isReg ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop:20, fontSize:13, color:'var(--text3)', textAlign:'center' }}>
          {isReg ? <>Already have an account?{' '}<button onClick={() => setIsReg(false)} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Sign in</button></>
                 : <>New user?{' '}<button onClick={() => setIsReg(true)} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}>Create account</button></>}
        </div>

        <div style={{ marginTop:24, padding:'12px 14px', background:'rgba(59,130,246,0.08)', borderRadius:8, border:'1px solid rgba(59,130,246,0.2)', fontSize:12, color:'var(--text2)' }}>
          <strong style={{ color:'var(--accent)' }}>Demo credentials:</strong><br />
          Email: admin@trackcore.my &nbsp;·&nbsp; Password: admin123
        </div>
      </div>
    </div>
  )
}
