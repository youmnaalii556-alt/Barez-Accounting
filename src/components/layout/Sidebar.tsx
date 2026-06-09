'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, LogOut, ChevronDown, ChevronLeft,
  ClipboardList, Scale, FileText, BarChart3, List, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getIcon, getGradient } from '@/lib/icons'
import type { Module, Profile } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدير النظام',
  manager:     'مدير قسم',
  employee:    'موظف',
}

const SUB_NAV: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  accounting: [
    { label: 'القيود اليومية',   href: '/accounting/journal',           icon: ClipboardList },
    { label: 'دليل الحسابات',   href: '/accounting/chart-of-accounts', icon: List          },
    { label: 'ميزان المراجعة',  href: '/accounting/trial-balance',     icon: Scale         },
    { label: 'القوائم المالية', href: '/accounting/statements',        icon: FileText      },
    { label: 'تقارير الحسابات', href: '/accounting/reports',           icon: BarChart3     },
  ],
}

interface SidebarProps {
  modules: Module[]
  profile: Profile | null
}

export default function Sidebar({ modules, profile }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    Object.keys(SUB_NAV).forEach(slug => { init[slug] = pathname.startsWith(`/${slug}`) })
    return init
  })

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
    <aside className="fixed top-0 right-0 h-screen w-64 flex flex-col z-50"
      style={{
        background: 'linear-gradient(180deg,#0a1e3d 0%,#0f2744 50%,#0a1e3d 100%)',
        boxShadow: '0 0 40px rgba(0,0,0,.4)',
        borderLeft: '1px solid rgba(255,255,255,.05)',
      }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#c5a028,#e2b93b)' }}>
          <span className="text-white font-black text-xl">B</span>
        </div>
        <div>
          <p className="font-black text-white text-base leading-none">Barez ERP</p>
          <p className="text-xs mt-0.5" style={{ color: '#7a9cc8' }}>إدارة الموارد المؤسسية</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 sidebar-scroll space-y-0.5">
        {navItems.map((item) => {
          const subs    = SUB_NAV[item.slug] ?? []
          const hasSubs = subs.length > 0
          const isOpen  = expanded[item.slug] ?? false
          const Icon    = item.slug === 'dashboard' ? LayoutDashboard : getIcon(item.icon)
          const gradient = getGradient(item.slug, item.index)
          const isActive = item.slug === 'dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(`/${item.slug}`)

          if (hasSubs) {
            return (
              <div key={item.slug}>
                <button onClick={() => setExpanded(p => ({ ...p, [item.slug]: !p[item.slug] }))}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium relative"
                  style={{
                    background: isActive ? 'rgba(255,255,255,.09)' : 'transparent',
                    color: isActive ? '#fff' : '#8eabd0',
                  }}>
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                      style={{ background: '#c5a028' }} />
                  )}
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ background: isActive ? gradient : 'rgba(255,255,255,.06)' }}>
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : '#4d7ab5' }} />
                  </span>
                  <span className="flex-1 text-right">{item.name_ar}</span>
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    : <ChevronLeft className="w-3.5 h-3.5 opacity-60" />}
                </button>

                {isOpen && (
                  <div className="mr-5 mt-0.5 mb-1 space-y-0.5">
                    {subs.map(sub => {
                      const subActive = pathname === sub.href || pathname.startsWith(sub.href + '/')
                      return (
                        <Link key={sub.href} href={sub.href}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium"
                          style={{
                            background: subActive ? 'rgba(197,160,40,.12)' : 'transparent',
                            color: subActive ? '#e2b93b' : '#7a9cc8',
                            borderRight: subActive ? '2px solid #c5a028' : '2px solid transparent',
                          }}>
                          <sub.icon className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: subActive ? '#c5a028' : '#4d7ab5' }} />
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.slug} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium relative"
              style={{
                background: isActive ? 'rgba(255,255,255,.09)' : 'transparent',
                color: isActive ? '#fff' : '#8eabd0',
              }}>
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                  style={{ background: '#c5a028' }} />
              )}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: isActive ? gradient : 'rgba(255,255,255,.06)' }}>
                <Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : '#4d7ab5' }} />
              </span>
              <span>{item.name_ar}</span>
            </Link>
          )
        })}

        <div className="mx-2 my-3 h-px" style={{ background: 'rgba(255,255,255,.07)' }} />

        {profile?.role === 'super_admin' && (
          <>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#4d6a8a' }}>إدارة النظام</p>
            <Link href="/admin/modules"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium relative"
              style={{
                background: pathname.startsWith('/admin') ? 'rgba(255,255,255,.09)' : 'transparent',
                color: pathname.startsWith('/admin') ? '#fff' : '#8eabd0',
              }}>
              {pathname.startsWith('/admin') && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                  style={{ background: '#c5a028' }} />
              )}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: pathname.startsWith('/admin') ? 'linear-gradient(135deg,#1e293b,#475569)' : 'rgba(255,255,255,.06)' }}>
                <Settings className="w-4 h-4"
                  style={{ color: pathname.startsWith('/admin') ? '#fff' : '#4d7ab5' }} />
              </span>
              <span>إدارة الوحدات</span>
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#c5a028,#e2b93b)' }}>
            {(profile?.full_name_ar ?? profile?.full_name ?? '؟')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'}
            </p>
            <p className="text-xs" style={{ color: '#7a9cc8' }}>
              {ROLE_LABELS[profile?.role ?? 'employee']}
            </p>
          </div>
          <button onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400
                       hover:text-red-300 hover:bg-red-500/10 transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
