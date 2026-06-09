import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { BookOpen, FileText, BarChart3, Scale, ClipboardList } from 'lucide-react'
import type { Profile } from '@/types'

const ACCOUNTING_MODULES = [
  { label: 'القيود اليومية',     icon: ClipboardList, color: '#f59e0b', desc: 'تسجيل وإدارة القيود المحاسبية' },
  { label: 'ميزان المراجعة',    icon: Scale,          color: '#3b82f6', desc: 'التحقق من التوازن المحاسبي'     },
  { label: 'القوائم المالية',   icon: FileText,        color: '#22c55e', desc: 'قوائم IFRS المالية الدورية'     },
  { label: 'تقارير الحسابات',   icon: BarChart3,       color: '#8b5cf6', desc: 'تحليل وتقارير الحسابات'         },
]

export default async function AccountingPage() {
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
      <Header profile={profile as Profile | null} pageName="الحسابات المالية" />
      <main className="flex-1 p-6 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#fffbeb' }}>
            <BookOpen className="w-7 h-7" style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">الحسابات المالية</h2>
            <p className="text-gray-500 text-sm">القيود، ميزان المراجعة، والقوائم المالية IFRS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACCOUNTING_MODULES.map(m => (
            <button key={m.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 flex items-center gap-4 text-right"
              style={{ transition: 'transform 200ms, box-shadow 200ms' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${m.color}15` }}>
                <m.icon className="w-6 h-6" style={{ color: m.color }} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{m.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#fffbeb' }}>
            <BookOpen className="w-8 h-8" style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
