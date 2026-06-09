import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import {
  Users, DollarSign, Briefcase, BookOpen, Settings,
  LayoutDashboard, BarChart3, FileText, Calendar,
  Building2, Truck, Home, Shield, TrendingUp, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import type { Module, Profile } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  'users':            Users,
  'dollar-sign':      DollarSign,
  'briefcase':        Briefcase,
  'book-open':        BookOpen,
  'settings':         Settings,
  'layout-dashboard': LayoutDashboard,
  'bar-chart':        BarChart3,
  'file-text':        FileText,
  'calendar':         Calendar,
  'building':         Building2,
  'truck':            Truck,
  'home':             Home,
  'shield':           Shield,
}

const MODULE_COLORS: Record<string, { bg: string; icon: string; shadow: string }> = {
  hr:         { bg: '#eff6ff', icon: '#3b82f6', shadow: '#3b82f620' },
  finance:    { bg: '#f0fdf4', icon: '#22c55e', shadow: '#22c55e20' },
  projects:   { bg: '#faf5ff', icon: '#8b5cf6', shadow: '#8b5cf620' },
  accounting: { bg: '#fffbeb', icon: '#f59e0b', shadow: '#f59e0b20' },
  admin:      { bg: '#f8fafc', icon: '#64748b', shadow: '#64748b20' },
}

const STATS = [
  { label: 'إجمالي الموظفين',    value: '—', icon: Users,       color: '#3b82f6' },
  { label: 'المشاريع النشطة',     value: '—', icon: Briefcase,   color: '#8b5cf6' },
  { label: 'الإيرادات (الشهر)',   value: '—', icon: TrendingUp,  color: '#22c55e' },
  { label: 'الفواتير المعلقة',    value: '—', icon: FileText,    color: '#f59e0b' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = (profile as Profile | null)?.role ?? 'employee'

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .contains('allowed_roles', [role])
    .order('order_index', { ascending: true })

  const displayName = (profile as Profile | null)?.full_name_ar
    ?? (profile as Profile | null)?.full_name
    ?? 'مستخدم'

  return (
    <>
      <Header profile={profile as Profile | null} pageName="لوحة التحكم الرئيسية" />
      <main className="flex-1 p-6 space-y-6">

        {/* Welcome */}
        <div className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1b3a6b 60%, #2a5298 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">مرحباً بك في Barez ERP</p>
              <h2 className="text-2xl font-bold">{displayName} 👋</h2>
              <p className="text-blue-300 text-sm mt-1">
                {new Date().toLocaleDateString('ar-SA', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center"
              style={{ background: 'rgba(197,160,40,0.2)' }}>
              <LayoutDashboard className="w-8 h-8" style={{ color: '#c5a028' }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Module Cards */}
        <div>
          <h3 className="text-gray-700 font-bold text-base mb-4">الوحدات المتاحة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(modules as Module[] ?? []).map(mod => {
              const Icon    = ICON_MAP[mod.icon] ?? LayoutDashboard
              const colors  = MODULE_COLORS[mod.slug] ?? MODULE_COLORS.admin
              return (
                <Link key={mod.id} href={`/${mod.slug}`}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
                             hover:shadow-md hover:-translate-y-0.5 group block"
                  style={{ transition: 'transform 200ms, box-shadow 200ms' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: colors.bg }}>
                      <Icon className="w-6 h-6" style={{ color: colors.icon }} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">{mod.name_ar}</h4>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                    {mod.description_ar ?? mod.description ?? ''}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

      </main>
    </>
  )
}
