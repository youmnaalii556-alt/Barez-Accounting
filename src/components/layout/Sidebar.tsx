'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getIcon, getGradient } from '@/lib/icons'
import type { Module, Profile } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

const S = {
  sidebar: {
    position: 'fixed' as const, top: 0, right: 0, height: '100vh', width: '260px',
    background: '#0f2744', display: 'flex', flexDirection: 'column' as const,
    zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,0.25)',
  },
  logoArea: {
    height: '64px', display: 'flex', alignItems: 'center', gap: '12px',
    padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg,#c5a028,#e2b93b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(197,160,40,0.4)',
  },
  nav: { flex: 1, overflowY: 'auto' as const, padding: '12px 10px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    padding: '12px 12px 6px',
  },
  userArea: {
    padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg,#1b3a6b,#2a5298)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '13px', fontWeight: 700,
  },
}

export default function Sidebar({ modules, profile }: { modules: Module[]; profile: Profile | null }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { slug: 'dashboard', name_ar: 'الرئيسية', icon: 'layout-dashboard', href: '/dashboard', index: -1 },
    ...modules.map((m, i) => ({ ...m, href: `/${m.slug}`, index: i })),
  ]

  const mainItems  = navItems.filter(i => i.slug !== 'admin' && i.slug !== 'admin/modules')
  const adminItems = navItems.filter(i => i.slug === 'admin' || i.slug === 'admin/modules')

  function NavItem({ item }: { item: typeof navItems[0] }) {
    const Icon     = item.slug === 'dashboard' ? LayoutDashboard : getIcon(item.icon)
    const isActive = item.slug === 'dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(`/${item.slug}`)

    return (
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '10px', marginBottom: '2px',
        background: isActive ? 'rgba(197,160,40,0.12)' : 'transparent',
        color: isActive ? '#e2b93b' : 'rgba(255,255,255,0.5)',
        textDecoration: 'none', position: 'relative', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' } }}>

        {isActive && (
          <div style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: '3px', height: '20px', borderRadius: '2px 0 0 2px',
            background: '#c5a028',
          }} />
        )}

        {/* Icon tile */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? getGradient(item.slug, item.index) : 'rgba(255,255,255,0.06)',
          transition: 'all 0.15s',
        }}>
          <Icon size={15} color={isActive ? '#fff' : 'rgba(255,255,255,0.4)'} />
        </div>

        <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 400, flex: 1 }}>
          {item.name_ar}
        </span>

        {isActive && <ChevronLeft size={14} style={{ opacity: 0.6 }} />}
      </Link>
    )
  }

  return (
    <aside style={S.sidebar}>

      {/* Logo */}
      <div style={S.logoArea}>
        <div style={S.logoIcon}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>B</span>
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>Barez ERP</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Enterprise Edition</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={S.nav}>
        <div style={S.sectionLabel}>القائمة الرئيسية</div>
        {mainItems.map(item => <NavItem key={item.slug} item={item} />)}

        {adminItems.length > 0 && (
          <>
            <div style={{ ...S.sectionLabel, marginTop: '8px' }}>الإدارة</div>
            {adminItems.map(item => <NavItem key={item.slug} item={item} />)}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div style={S.userArea}>
        <div style={S.userCard}>
          <div style={S.avatar}>
            {(profile?.full_name_ar ?? profile?.full_name ?? '؟')[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
              {ROLE_LABELS[profile?.role ?? 'employee']}
            </p>
          </div>
          <button onClick={handleLogout} title="تسجيل الخروج" style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'rgba(255,100,100,0.6)', borderRadius: '6px', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,100,100,0.6)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
