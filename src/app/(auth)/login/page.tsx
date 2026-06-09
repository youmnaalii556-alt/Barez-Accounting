'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'إدارة الموارد البشرية والرواتب',
  'الإدارة المالية والحسابات',
  'إدارة المشاريع والعقارات',
  'خدمة العملاء والتذاكر',
]

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة'); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit' }}>

      {/* ── RIGHT PANEL — Branding ── */}
      <div style={{
        width: '45%', display: 'none', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg,#050d1c 0%,#0f2744 45%,#1b3a6b 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="lg-panel">
        {/* decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(197,160,40,0.12),transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(42,82,152,0.35),transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 48px' }}>
          {/* Logo */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '28px', margin: '0 auto 28px',
            background: 'linear-gradient(135deg,#c5a028,#e2b93b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(197,160,40,0.4)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '40px' }}>B</span>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '36px', marginBottom: '8px' }}>Barez ERP</h1>
          <p style={{ color: 'rgba(148,163,184,1)', fontSize: '15px', marginBottom: '40px' }}>
            نظام إدارة الموارد المؤسسية المتكامل
          </p>

          {/* Feature list */}
          <div style={{ textAlign: 'right' }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px',
                justifyContent: 'flex-end', marginBottom: '14px' }}>
                <span style={{ color: 'rgba(203,213,225,1)', fontSize: '14px' }}>{f}</span>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(197,160,40,0.15)', border: '1.5px solid rgba(197,160,40,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={13} color="#c5a028" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{
            marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px', padding: '8px 20px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: 'rgba(203,213,225,1)', fontSize: '12px' }}>النظام يعمل بكفاءة</span>
          </div>
        </div>
      </div>

      {/* ── LEFT PANEL — Login Form ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff', padding: '48px 32px',
      }}>
        {/* Mobile logo */}
        <div className="mobile-logo" style={{
          width: '64px', height: '64px', borderRadius: '20px', marginBottom: '24px',
          background: 'linear-gradient(135deg,#c5a028,#e2b93b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(197,160,40,0.35)',
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '28px' }}>B</span>
        </div>

        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#181C32', marginBottom: '6px' }}>
              مرحباً بعودتك
            </h2>
            <p style={{ fontSize: '14px', color: '#7E8299' }}>سجّل دخولك للوصول إلى نظام Barez ERP</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FFF5F8', border: '1px solid #FFD0DF',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
              color: '#F1416C', fontSize: '13px',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                color: '#3F4254', marginBottom: '8px' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@barez.com" dir="ltr"
                  style={{
                    width: '100%', height: '48px',
                    background: '#F5F8FA', border: '1.5px solid #E4E6EF',
                    borderRadius: '12px', padding: '0 16px 0 44px',
                    fontSize: '14px', color: '#181C32', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1b3a6b'}
                  onBlur={e => e.target.style.borderColor = '#E4E6EF'}
                />
                <Mail size={16} style={{
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  color: '#A1A5B7', pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600,
                color: '#3F4254', marginBottom: '8px' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" dir="ltr"
                  style={{
                    width: '100%', height: '48px',
                    background: '#F5F8FA', border: '1.5px solid #E4E6EF',
                    borderRadius: '12px', padding: '0 44px',
                    fontSize: '14px', color: '#181C32', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1b3a6b'}
                  onBlur={e => e.target.style.borderColor = '#E4E6EF'}
                />
                <Lock size={16} style={{
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  color: '#A1A5B7', pointerEvents: 'none',
                }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#A1A5B7', padding: '4px',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', height: '50px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700,
              background: loading ? '#A1A5B7' : 'linear-gradient(135deg,#1b3a6b 0%,#2a5298 100%)',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(27,58,107,0.4)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  جاري التحقق...
                </>
              ) : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '40px', fontSize: '12px', color: '#A1A5B7' }}>
          © {new Date().getFullYear()} Barez Company — جميع الحقوق محفوظة
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  )
}
