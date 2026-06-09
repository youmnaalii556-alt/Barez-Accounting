import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getIcon, getGradient } from '@/lib/icons'
import { TrendingUp, Users, Briefcase, DollarSign, ArrowUpRight } from 'lucide-react'
import type { Module, Profile } from '@/types'

const KPI = [
  { label: 'إجمالي الموظفين',   value: '—', sub: 'موظف نشط',     icon: Users,      color: '#1b3a6b', bg: '#EEF2FF' },
  { label: 'المشاريع النشطة',   value: '—', sub: 'مشروع جارٍ',   icon: Briefcase,  color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'الإيرادات الشهرية', value: '—', sub: 'هذا الشهر',    icon: TrendingUp, color: '#059669', bg: '#ECFDF5' },
  { label: 'التذاكر المفتوحة',  value: '—', sub: 'تذكرة معلقة',  icon: DollarSign, color: '#D97706', bg: '#FFFBEB' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const role = (profile as Profile | null)?.role ?? 'employee'

  const { data: modules } = await supabase
    .from('modules').select('*').eq('is_active', true)
    .contains('allowed_roles', [role]).order('order_index', { ascending: true })

  const list        = (modules as Module[]) ?? []
  const displayName = (profile as Profile | null)?.full_name_ar
    ?? (profile as Profile | null)?.full_name ?? 'مستخدم'

  return (
    <>
      <Header profile={profile as Profile | null} pageName="لوحة التحكم" />

      <main style={{ flex: 1, padding: '28px', background: '#F5F7FA', minHeight: 'calc(100vh - 64px)' }}>

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg,#0f2744 0%,#1b3a6b 60%,#2a5298 100%)',
          borderRadius: '20px', padding: '28px 32px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(27,58,107,0.25)',
        }}>
          <div>
            <p style={{ color: 'rgba(148,163,184,1)', fontSize: '13px', marginBottom: '4px' }}>
              مرحباً بك في Barez ERP
            </p>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
              أهلاً، {displayName} 👋
            </h1>
            <p style={{ color: 'rgba(148,163,184,1)', fontSize: '13px' }}>
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(197,160,40,0.2)', border: '1.5px solid rgba(197,160,40,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#c5a028', fontSize: '32px' }}>B</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px',
        }} className="kpi-grid">
          {KPI.map(k => (
            <div key={k.label} style={{
              background: '#fff', borderRadius: '16px', padding: '20px',
              border: '1px solid #E4E6EF',
              boxShadow: '0 2px 12px rgba(82,63,105,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px', background: k.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <k.icon size={20} color={k.color} />
                </div>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: '#F5F8FA', border: '1px solid #E4E6EF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <ArrowUpRight size={14} color="#A1A5B7" />
                </div>
              </div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#181C32', marginBottom: '2px' }}>{k.value}</p>
              <p style={{ fontSize: '12px', color: '#A1A5B7' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#181C32' }}>الوحدات المتاحة</h2>
          <span style={{ fontSize: '12px', color: '#A1A5B7' }}>{list.length} وحدة</span>
        </div>

        {/* Module Tiles — SAP Fiori style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          {list.map((mod, i) => {
            const Icon     = getIcon(mod.icon)
            const gradient = getGradient(mod.slug, i)
            return (
              <Link key={mod.id} href={`/${mod.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  aspectRatio: '1 / 1', borderRadius: '20px',
                  background: gradient,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-4px) scale(1.02)'
                  el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'none'
                  el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'
                }}>
                  {/* Gloss overlay */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(180deg,rgba(255,255,255,0.18),transparent)',
                    borderRadius: '20px 20px 0 0', pointerEvents: 'none',
                  }} />

                  {/* Icon circle */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Icon size={28} color="#fff" />
                  </div>

                  {/* Label */}
                  <span style={{
                    color: '#fff', fontWeight: 700, fontSize: '13px',
                    textAlign: 'center', padding: '0 12px', lineHeight: 1.3,
                    textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }}>
                    {mod.name_ar}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {list.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '60px',
            textAlign: 'center', border: '1px solid #E4E6EF',
          }}>
            <p style={{ color: '#A1A5B7', fontSize: '15px' }}>لا توجد وحدات متاحة لصلاحيتك</p>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}
