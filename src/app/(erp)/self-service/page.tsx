import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { UserCog, Calendar, FileText, DollarSign, Clock } from 'lucide-react'
import type { Profile } from '@/types'

const ACTIONS = [
  { label: 'بياناتي الشخصية',  icon: UserCog,   color: '#0f766e', desc: 'تحديث معلوماتك الشخصية'    },
  { label: 'طلب إجازة',        icon: Calendar,  color: '#8b5cf6', desc: 'تقديم طلب إجازة جديد'       },
  { label: 'قسائم الراتب',    icon: DollarSign, color: '#22c55e', desc: 'عرض وتنزيل قسائم الراتب'   },
  { label: 'سجل الدوام',       icon: Clock,     color: '#f59e0b', desc: 'عرض سجل الحضور والانصراف'   },
  { label: 'طلباتي',           icon: FileText,  color: '#3b82f6', desc: 'متابعة حالة طلباتك'          },
]

export default async function SelfServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const displayName = (profile as Profile | null)?.full_name_ar
    ?? (profile as Profile | null)?.full_name ?? 'مستخدم'

  return (
    <>
      <Header profile={profile as Profile | null} pageName="الخدمة الذاتية" />
      <main className="flex-1 p-6 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0f766e,#34d399)' }}>
            <UserCog className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">الخدمة الذاتية</h2>
            <p className="text-gray-500 text-sm">مرحباً {displayName} — إدارة بياناتك وطلباتك الشخصية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIONS.map(a => (
            <button key={a.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 flex items-center gap-4 text-right"
              style={{ transition: 'transform 200ms, box-shadow 200ms' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${a.color}15` }}>
                <a.icon className="w-6 h-6" style={{ color: a.color }} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{a.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#0f766e,#34d399)' }}>
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-gray-700 font-bold text-base mb-2">قيد التطوير</h3>
          <p className="text-gray-400 text-sm">سيتم إضافة محتوى هذه الوحدة قريباً</p>
        </div>

      </main>
    </>
  )
}
