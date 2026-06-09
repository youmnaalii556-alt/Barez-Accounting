import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Users, UserPlus, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'
import type { Profile } from '@/types'

const QUICK_LINKS = [
  { label: 'إضافة موظف',      icon: UserPlus,    href: '#', color: '#3b82f6' },
  { label: 'إدارة الرواتب',   icon: DollarSign,  href: '#', color: '#22c55e' },
  { label: 'طلبات الإجازة',   icon: Calendar,    href: '#', color: '#f59e0b' },
  { label: 'الدوام والحضور',  icon: Clock,        href: '#', color: '#8b5cf6' },
]

export default async function HRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Header profile={profile as Profile | null} pageName="الموارد البشرية" />
      <main className="flex-1 p-6 space-y-6">

        {/* Page header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#eff6ff' }}>
            <Users className="w-7 h-7" style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">إدارة الموارد البشرية</h2>
            <p className="text-gray-500 text-sm">إدارة الموظفين، الرواتب، والإجازات</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الموظفين',  value: '—', icon: Users,      color: '#3b82f6' },
            { label: 'موظفون نشطون',     value: '—', icon: TrendingUp,  color: '#22c55e' },
            { label: 'إجازات معلقة',     value: '—', icon: Calendar,   color: '#f59e0b' },
            { label: 'كشف الرواتب',       value: '—', icon: DollarSign, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-gray-700 font-bold text-base mb-4">الإجراءات السريعة</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map(l => (
              <button key={l.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                           hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center
                           gap-3 text-center group"
                style={{ transition: 'transform 200ms, box-shadow 200ms' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${l.color}15` }}>
                  <l.icon className="w-6 h-6" style={{ color: l.color }} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {l.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#eff6ff' }}>
            <Users className="w-8 h-8" style={{ color: '#3b82f6' }} />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
