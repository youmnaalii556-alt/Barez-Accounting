import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Briefcase, Building2, Truck, Home, BarChart3 } from 'lucide-react'
import type { Profile } from '@/types'

const PROJECT_TYPES = [
  { label: 'مشاريع عقارية',  icon: Building2, color: '#8b5cf6' },
  { label: 'أسطول مركبات',   icon: Truck,     color: '#f59e0b' },
  { label: 'مشاريع سكنية',  icon: Home,       color: '#3b82f6' },
  { label: 'تقارير المشاريع', icon: BarChart3, color: '#22c55e' },
]

export default async function ProjectsPage() {
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
      <Header profile={profile as Profile | null} pageName="إدارة المشاريع" />
      <main className="flex-1 p-6 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#faf5ff' }}>
            <Briefcase className="w-7 h-7" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">إدارة المشاريع</h2>
            <p className="text-gray-500 text-sm">العقارات، المركبات، والمشاريع الأخرى</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PROJECT_TYPES.map(t => (
            <button key={t.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center gap-3"
              style={{ transition: 'transform 200ms, box-shadow 200ms' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${t.color}15` }}>
                <t.icon className="w-6 h-6" style={{ color: t.color }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#faf5ff' }}>
            <Briefcase className="w-8 h-8" style={{ color: '#8b5cf6' }} />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
