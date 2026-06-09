import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Headphones, MessageCircle, Phone, Star, Clock, CheckCircle } from 'lucide-react'
import type { Profile } from '@/types'

const QUICK = [
  { label: 'تذاكر جديدة',    icon: MessageCircle, color: '#3b82f6' },
  { label: 'مكالمات اليوم',  icon: Phone,         color: '#22c55e' },
  { label: 'قيد المعالجة',   icon: Clock,         color: '#f59e0b' },
  { label: 'مُغلقة اليوم',   icon: CheckCircle,   color: '#8b5cf6' },
]

export default async function CustomerServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <Header profile={profile as Profile | null} pageName="خدمة العملاء" />
      <main className="flex-1 p-6 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#15803d,#4ade80)' }}>
            <Headphones className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">خدمة العملاء</h2>
            <p className="text-gray-500 text-sm">إدارة التذاكر، الشكاوى، وطلبات العملاء</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK.map(q => (
            <div key={q.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${q.color}15` }}>
                <q.icon className="w-5 h-5" style={{ color: q.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800">—</p>
              <p className="text-gray-500 text-xs mt-1">{q.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#15803d,#4ade80)' }}>
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
