import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import Link from 'next/link'

export interface DeptModule {
  id: string
  title: string
  desc: string
  icon: LucideIcon
  color: string
  gradient: string
  tags: string[]
  href?: string          // if provided, it's a live link; otherwise "coming soon"
  highlight?: boolean
}

interface Props {
  name: string
  nameEn: string
  desc: string
  icon: LucideIcon
  iconGradient: string
  iconGlow: string
  modules: DeptModule[]
  note?: React.ReactNode   // optional callout box below hero
  badge?: string           // default "تحت الإنشاء"
  stats?: { label: string; val: string }[]
}

export default function DeptShell({
  name, nameEn, desc, icon: HeroIcon, iconGradient, iconGlow,
  modules, note, badge = 'تحت الإنشاء', stats = [],
}: Props) {
  const live  = modules.filter(m => m.href)
  const soon  = modules.filter(m => !m.href)

  return (
    <main className="flex-1 page-enter" style={{ background: '#f0f2f5' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0a1628 0%,#0f2744 55%,#1b3a6b 100%)',
        padding: '36px 32px', position: 'relative', overflow: 'hidden',
      }}>
        {/* glow blob */}
        <div style={{
          position: 'absolute', top: -80, left: -60, width: 320, height: 320, borderRadius: '50%',
          background: `radial-gradient(circle,${iconGlow},transparent 65%)`, pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: stats.length ? 18 : 0 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 16, flexShrink: 0,
              background: iconGradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${iconGlow}`,
            }}>
              <HeroIcon size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: 0 }}>{name}</h1>
                <span style={{
                  background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.4)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 11, color: '#fbbf24', fontWeight: 700,
                }}>{badge}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, margin: '4px 0 0' }}>
                {nameEn} · {desc}
              </p>
            </div>
          </div>

          {stats.length > 0 && (
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 4 }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#e2b93b', fontWeight: 800, fontSize: 20 }}>{s.val}</div>
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {note && <div style={{ marginTop: 16 }}>{note}</div>}
        </div>
      </div>

      <div style={{ padding: '28px 32px 48px' }}>

        {/* Live modules */}
        {live.length > 0 && (
          <>
            <p style={{ fontSize: 11, letterSpacing: 3, color: '#22c55e', textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
              الوحدات المتاحة الآن · {live.length}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16, marginBottom: 32 }}>
              {live.map(m => <ModuleCard key={m.id} m={m} />)}
            </div>
          </>
        )}

        {/* Coming soon */}
        {soon.length > 0 && (
          <>
            <p style={{ fontSize: 11, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
              قيد التطوير · {soon.length} وحدة
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
              {soon.map(m => <ModuleCard key={m.id} m={m} />)}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function ModuleCard({ m }: { m: DeptModule }) {
  const inner = (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: m.href ? `1px solid ${m.color}30` : '1px solid #e2e8f0',
      boxShadow: m.href ? `0 4px 16px ${m.color}15` : '0 1px 3px rgba(0,0,0,.05)',
      padding: '20px', position: 'relative', overflow: 'hidden',
      cursor: m.href ? 'pointer' : 'default',
      transition: 'transform .2s, box-shadow .2s',
      textDecoration: 'none', display: 'block',
      ...(m.highlight ? { border: `1px solid ${m.color}40`, boxShadow: `0 4px 20px ${m.color}18` } : {}),
    }}
    className={m.href ? 'dept-module-card' : ''}
    >
      {/* side bar */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 4, height: '100%',
        borderRadius: '0 14px 14px 0', background: m.gradient,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: m.gradient, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${m.color}30`,
        }}>
          <m.icon size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{m.title}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {m.tags.map(t => (
              <span key={t} style={{
                background: `${m.color}12`, color: m.color, border: `1px solid ${m.color}25`,
                borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        </div>
        {m.href
          ? <span style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#16a34a', fontWeight: 700, flexShrink: 0,
            }}>متاح</span>
          : <span style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#92400e', fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Construction size={9} /> قريباً
            </span>
        }
      </div>
      <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
    </div>
  )

  return m.href ? <Link href={m.href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}
