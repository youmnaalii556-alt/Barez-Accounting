'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getIcon, getGradient } from '@/lib/icons'
import type { Module, Profile } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

interface SidebarProps {
  modules: Module[]
  profile: Profile | null
}

export default function Sidebar({ modules, profile }: SidebarProps) {
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

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 flex flex-col z-50 shadow-2xl"
      style={{ background: '#0f2744' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow"
          style={{ background: 'linear-gradient(135deg,#c5a028,#e2b93b)' }}>
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">Barez ERP</p>
          <p className="text-blue-300 text-xs">إدارة الموارد</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const Icon     = item.slug === 'dashboard' ? LayoutDashboard : getIcon(item.icon)
          const isActive = item.slug === 'dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(`/${item.slug}`)
          const gradient = getGradient(item.slug, item.index)

          return (
            <Link key={item.slug} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         group relative overflow-hidden"
              style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color:      isActive ? '#fff' : '#94a3b8',
              }}>

              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                  style={{ background: '#c5a028' }} />
              )}

              {/* Colored icon tile */}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: isActive ? gradient : 'rgba(255,255,255,0.06)' }}>
                <Icon className="w-4 h-4"
                  style={{ color: isActive ? '#fff' : '#64748b' }} />
              </span>

              <span className="group-hover:text-white">{item.name_ar}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                          font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#1b3a6b,#2a5298)' }}>
            {(profile?.full_name_ar ?? profile?.full_name ?? '؟')[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'}
            </p>
            <p className="text-blue-300 text-xs">
              {ROLE_LABELS[profile?.role ?? 'employee']}
            </p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm
                     text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
