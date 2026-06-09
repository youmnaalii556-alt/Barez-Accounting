'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, ChevronLeft, X, Settings, LogOut, User } from 'lucide-react'
import type { Profile } from '@/types'

const LABELS: Record<string, string> = {
  dashboard:           'الرئيسية',
  accounting:          'الحسابات',
  journal:             'القيود اليومية',
  'chart-of-accounts': 'دليل الحسابات',
  'trial-balance':     'ميزان المراجعة',
  statements:          'القوائم المالية',
  reports:             'التقارير',
  hr:                  'الموارد البشرية',
  employees:           'الموظفون',
  leaves:              'الإجازات',
  payroll:             'الرواتب',
  projects:            'المشاريع',
  finance:             'المالية',
  'customer-service':  'خدمة العملاء',
  'self-service':      'الخدمة الذاتية',
  admin:               'الإدارة',
  modules:             'الوحدات',
}

const NOTIFICATIONS = [
  { id: 1, text: 'قيد يومي جديد بانتظار الاعتماد', time: 'منذ 5 دقائق',  dot: 'bg-blue-500'   },
  { id: 2, text: 'طلب إجازة من أحمد السيد',         time: 'منذ 30 دقيقة', dot: 'bg-amber-500'  },
  { id: 3, text: 'تقرير شهري جاهز للتحميل',         time: 'منذ ساعة',     dot: 'bg-green-500'  },
]

interface HeaderProps {
  profile: Profile | null
  pageName?: string
}

export default function Header({ profile }: HeaderProps) {
  const pathname    = usePathname()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser,  setShowUser]  = useState(false)
  const [search,    setSearch]    = useState('')
  const notifRef    = useRef<HTMLDivElement>(null)
  const userRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUser(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const segments = pathname.split('/').filter(Boolean)
  const crumbs   = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg,
    href:  '/' + segments.slice(0, i + 1).join('/'),
  }))

  const dateAr   = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const initials = (profile?.full_name_ar ?? profile?.full_name ?? '؟')[0]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
      <div className="flex items-center justify-between px-6 h-14 gap-4">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronLeft className="w-3 h-3 text-gray-300 flex-shrink-0" />}
              {i === crumbs.length - 1
                ? <span className="font-bold text-gray-800 truncate">{c.label}</span>
                : <Link href={c.href} className="text-gray-400 hover:text-blue-600 transition-colors truncate">{c.label}</Link>
              }
            </span>
          ))}
          {crumbs.length === 0 && <span className="font-bold text-gray-800">لوحة التحكم</span>}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5
                          bg-gray-50 text-sm text-gray-400 w-52 focus-within:border-blue-400
                          focus-within:bg-white focus-within:shadow-sm transition-all">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث سريع..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm" />
            {search && (
              <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-gray-600" /></button>
            )}
          </div>

          <span className="hidden lg:block text-xs text-gray-400 font-medium">{dateAr}</span>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotif(p => !p); setShowUser(false) }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg
                         bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {showNotif && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-gray-800 text-sm">الإشعارات</p>
                  <span className="badge badge-info">3 جديد</span>
                </div>
                {NOTIFICATIONS.map(n => (
                  <div key={n.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                    <div>
                      <p className="text-sm text-gray-700 leading-snug">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-center">
                  <button className="text-xs text-blue-600 hover:underline font-medium">عرض كل الإشعارات</button>
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative" ref={userRef}>
            <button onClick={() => { setShowUser(p => !p); setShowNotif(false) }}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50
                         border border-transparent hover:border-gray-200 transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#1b3a6b,#2a5298)' }}>
                {initials}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-gray-800 leading-none">
                  {profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{profile?.department ?? 'الإدارة'}</p>
              </div>
            </button>
            {showUser && (
              <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <p className="font-bold text-gray-800 text-sm">
                    {profile?.full_name_ar ?? profile?.full_name ?? 'مستخدم'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{profile?.department ?? ''}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/self-service"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-400" />الملف الشخصي
                  </Link>
                  <Link href="/admin/modules"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />الإعدادات
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right">
                    <LogOut className="w-4 h-4" />تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
