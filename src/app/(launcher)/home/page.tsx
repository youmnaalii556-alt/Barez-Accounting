import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCompany } from '@/lib/accounting/data'
import { getIcon, getGradient } from '@/lib/icons'
import LiveClock from '@/components/launcher/LiveClock'
import LogoutButton from '@/components/launcher/LogoutButton'
import { UserCircle, ChevronLeft } from 'lucide-react'
import type { Module, Profile } from '@/types'

export const dynamic = 'force-dynamic'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

export default async function LauncherHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const role = (profile as Profile | null)?.role ?? 'employee'

  const [{ data: modules }, company] = await Promise.all([
    supabase.from('modules').select('*').eq('is_active', true)
      .contains('allowed_roles', [role]).order('order_index', { ascending: true }),
    getCompany(),
  ])

  const depts = (modules as Module[]) ?? []
  const displayName = (profile as Profile | null)?.full_name_ar
    ?? (profile as Profile | null)?.full_name ?? 'مستخدم'

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg,#0a1628 0%,#0f2044 55%,#1e3a6e 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
        backgroundSize: '46px 46px',
      }} />
      {/* gold glow */}
      <div style={{
        position: 'absolute', top: '-12%', right: '-6%', width: 460, height: 460,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(201,162,39,.12),transparent 65%)',
      }} />

      {/* ── Top bar ── */}
      <header style={{
        position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '16px 36px',
        background: 'rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.08)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: company.logo_url ? '#fff' : 'linear-gradient(135deg,#c9a227,#e8bc3a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(201,162,39,.35)',
          }}>
            {company.logo_url
              ? <img src={company.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#0a1628', fontWeight: 900, fontSize: 20 }}>B</span>}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{company.name_ar}</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Enterprise Resource Planning · IFRS</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LiveClock />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 20, padding: '6px 14px', color: 'rgba(255,255,255,.75)', fontSize: 12,
          }}>
            <UserCircle size={15} style={{ color: '#e8bc3a' }} />
            <span>{displayName}</span>
            <span style={{ color: 'rgba(255,255,255,.35)' }}>· {ROLE_LABELS[role]}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* ── Hero ── */}
      <main style={{
        position: 'relative', zIndex: 2, flex: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 36px',
      }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: '#e8bc3a', textTransform: 'uppercase', marginBottom: 8 }}>
          Enterprise Resource Planning
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
          أقسام {company.name_ar}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 40 }}>
          مرحباً {displayName} — اختر القسم الذي تريد الدخول إليه
        </p>

        {/* Department grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 18, width: '100%', maxWidth: 880,
        }} className="dept-grid">
          {depts.map((d, i) => {
            const Icon = getIcon(d.icon)
            const grad = getGradient(d.slug, i)
            return (
              <Link key={d.id} href={`/${d.slug}`} className="dept-card" style={{
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 16, padding: '26px 20px', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="dept-icon" style={{
                  width: 60, height: 60, borderRadius: 16, background: grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                  boxShadow: '0 8px 24px rgba(0,0,0,.25)',
                }}>
                  <Icon size={28} color="#fff" />
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{d.name_ar}</div>
                <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginBottom: 12 }}>{d.name}</div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, lineHeight: 1.6, minHeight: 34 }}>
                  {d.description_ar ?? ''}
                </p>
                <span className="dept-enter" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12,
                  color: '#e8bc3a', fontSize: 11, fontWeight: 700, opacity: 0,
                }}>
                  دخول <ChevronLeft size={13} />
                </span>
              </Link>
            )
          })}
        </div>

        {depts.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>لا توجد أقسام متاحة لصلاحيتك</p>
        )}
      </main>

      <footer style={{
        position: 'relative', zIndex: 2, textAlign: 'center', padding: '14px',
        color: 'rgba(255,255,255,.25)', fontSize: 11, borderTop: '1px solid rgba(255,255,255,.06)',
      }}>
        © {new Date().getFullYear()} {company.name_ar} — جميع الحقوق محفوظة
      </footer>

      <style>{`
        .dept-card { transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s, border-color .25s, box-shadow .25s; }
        .dept-card:hover { transform: translateY(-6px); background: rgba(255,255,255,.11); border-color: rgba(232,188,58,.35); box-shadow: 0 18px 50px rgba(0,0,0,.35); }
        .dept-card:hover .dept-icon { transform: scale(1.08); }
        .dept-card:hover .dept-enter { opacity: 1; }
        .dept-icon { transition: transform .25s; }
        .dept-enter { transition: opacity .25s; }
        @media (max-width: 880px) { .dept-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .dept-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
