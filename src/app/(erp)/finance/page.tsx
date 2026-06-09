import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { DollarSign, TrendingUp, TrendingDown, PieChart, FileText, Plus } from 'lucide-react'
import type { Profile } from '@/types'

export default async function FinancePage() {
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
      <Header profile={profile as Profile | null} pageName="الإدارة المالية" />
      <main className="flex-1 p-6 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#f0fdf4' }}>
            <DollarSign className="w-7 h-7" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">الإدارة المالية</h2>
            <p className="text-gray-500 text-sm">الميزانية، المصروفات، والتقارير المالية</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'الإيرادات',    value: '—', icon: TrendingUp,   color: '#22c55e' },
            { label: 'المصروفات',   value: '—', icon: TrendingDown,  color: '#ef4444' },
            { label: 'صافي الربح',  value: '—', icon: PieChart,      color: '#3b82f6' },
            { label: 'الفواتير',    value: '—', icon: FileText,      color: '#f59e0b' },
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

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f0fdf4' }}>
            <DollarSign className="w-8 h-8" style={{ color: '#22c55e' }} />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
