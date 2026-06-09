import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getIcon, getGradient } from '@/lib/icons'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Briefcase,
  BookOpen, ArrowLeft, Activity, Clock, CheckCircle2,
} from 'lucide-react'
import type { Module, Profile } from '@/types'

const KPI = [
  { label: 'إجمالي الإيرادات',  value: '٢٤٥,٨٠٠', unit: 'د.ع.', change: '+٨.٢٪',  positive: true,  icon: DollarSign,  cls: 'green',  bg: '#f0fdf4', clr: '#16a34a' },
  { label: 'إجمالي المصروفات', value: '١٨١,٣٢٠', unit: 'د.ع.', change: '+٣.١٪',  positive: false, icon: TrendingDown, cls: 'red',    bg: '#fef2f2', clr: '#dc2626' },
  { label: 'صافي الربح',        value: '٦٤,٤٨٠',  unit: 'د.ع.', change: '+١٢.٤٪', positive: true,  icon: TrendingUp,  cls: 'blue',   bg: '#eff6ff', clr: '#2563eb' },
  { label: 'عدد الموظفين',      value: '١٢٧',      unit: 'موظف', change: '+٤',     positive: true,  icon: Users,       cls: 'purple', bg: '#faf5ff', clr: '#7c3aed' },
  { label: 'المشاريع النشطة',  value: '١٨',       unit: 'مشروع', change: '+٢',    positive: true,  icon: Briefcase,   cls: 'amber',  bg: '#fffbeb', clr: '#d97706' },
  { label: 'قيود اليوم',        value: '٣٤',       unit: 'قيد',  change: '+٧',     positive: true,  icon: BookOpen,    cls: 'teal',   bg: '#f0fdfa', clr: '#0d9488' },
]

const RECENT_ENTRIES = [
  { id: 'JV-2025-0342', desc: 'مبيعات نقدية - الفرع الرئيسي', amount: '٨,٤٠٠',  type: 'credit', date: '٢٠٢٥/٠٦/٠٩' },
  { id: 'JV-2025-0341', desc: 'رواتب شهر مايو',                amount: '٤٢,٠٠٠', type: 'debit',  date: '٢٠٢٥/٠٦/٠٩' },
  { id: 'JV-2025-0340', desc: 'دفع فاتورة كهرباء',             amount: '١,٢٠٠',  type: 'debit',  date: '٢٠٢٥/٠٦/٠٨' },
  { id: 'JV-2025-0339', desc: 'استلام دفعة من عميل',            amount: '١٥,٠٠٠', type: 'credit', date: '٢٠٢٥/٠٦/٠٨' },
  { id: 'JV-2025-0338', desc: 'مصاريف تشغيلية متنوعة',         amount: '٢,٦٠٠',  type: 'debit',  date: '٢٠٢٥/٠٦/٠٧' },
]

const RECENT_ACTIVITY = [
  { icon: CheckCircle2, color: '#16a34a', text: 'اعتماد قيد رقم JV-2025-0342', time: 'منذ ١٥ دقيقة' },
  { icon: Users,        color: '#2563eb', text: 'إضافة موظف جديد: سارة أحمد',  time: 'منذ ٤٥ دقيقة' },
  { icon: Activity,     color: '#d97706', text: 'طلب إجازة بانتظار الاعتماد',   time: 'منذ ساعة'     },
  { icon: Clock,        color: '#7c3aed', text: 'إنشاء تقرير ميزان المراجعة',   time: 'منذ ٣ ساعات'  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const role = (profile as Profile | null)?.role ?? 'employee'

  const { data: modules } = await supabase
    .from('modules').select('*')
    .eq('is_active', true)
    .contains('allowed_roles', [role])
    .order('order_index', { ascending: true })

  const list        = (modules as Module[]) ?? []
  const displayName = (profile as Profile | null)?.full_name_ar ?? (profile as Profile | null)?.full_name ?? 'مستخدم'
  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور'

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 p-6 space-y-6 page-enter">

        {/* Welcome banner */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#0f2744 0%,#1b3a6b 50%,#2a5298 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%,#c5a028,transparent 50%),radial-gradient(circle at 80% 20%,#fff,transparent 40%)' }} />
          <div className="relative px-8 py-6 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">{greeting}،</p>
              <h1 className="text-white text-2xl font-black">{displayName}</h1>
              <p className="text-blue-200 text-sm mt-1">
                {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {[{ n: '٣٤', l: 'قيد اليوم' }, { n: '٧', l: 'مهام معلقة' }, { n: '٩٨٪', l: 'نسبة الإنجاز', gold: true }].map((s, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-10 bg-white/20" />}
                  <div className="text-center">
                    <p className={`text-2xl font-black ${s.gold ? '' : 'text-white'}`}
                      style={s.gold ? { color: '#e2b93b' } : {}}>
                      {s.n}
                    </p>
                    <p className="text-blue-200 text-xs mt-0.5">{s.l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {KPI.map(k => (
            <div key={k.label} className={`stat-card ${k.cls}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <k.icon className="w-5 h-5" style={{ color: k.clr }} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${k.positive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                  {k.positive ? '▲' : '▼'} {k.change}
                </span>
              </div>
              <p className="text-xl font-black text-gray-800">{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.unit}</p>
              <p className="text-xs font-semibold text-gray-600 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent entries */}
          <div className="xl:col-span-2 erp-card">
            <div className="erp-card-header">
              <div>
                <h2 className="font-bold text-gray-800 text-sm">آخر القيود اليومية</h2>
                <p className="text-xs text-gray-400 mt-0.5">آخر ٥ قيود محاسبية</p>
              </div>
              <Link href="/accounting/journal"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>رقم القيد</th>
                    <th>البيان</th>
                    <th className="col-num">المبلغ (د.ع.)</th>
                    <th>النوع</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ENTRIES.map(e => (
                    <tr key={e.id}>
                      <td>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {e.id}
                        </span>
                      </td>
                      <td className="text-gray-700 text-sm">{e.desc}</td>
                      <td className={`col-num font-bold text-sm ${e.type === 'credit' ? 'text-credit' : 'text-debit'}`}>
                        {e.amount}
                      </td>
                      <td>
                        <span className={`badge ${e.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                          {e.type === 'credit' ? 'دائن' : 'مدين'}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <div className="erp-card">
            <div className="erp-card-header">
              <div>
                <h2 className="font-bold text-gray-800 text-sm">النشاط الأخير</h2>
                <p className="text-xs text-gray-400 mt-0.5">آخر الإجراءات في النظام</p>
              </div>
            </div>
            <div className="erp-card-body space-y-4">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${a.color}18` }}>
                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className="erp-card">
          <div className="erp-card-header">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">وحدات النظام</h2>
              <p className="text-xs text-gray-400 mt-0.5">الوحدات المتاحة لك</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {list.map((mod, i) => {
              const Icon     = getIcon(mod.icon)
              const gradient = getGradient(mod.slug, i)
              return (
                <Link key={mod.id} href={`/${mod.slug}`}
                  className="group flex flex-col items-center justify-center gap-2.5 py-5 px-3
                             rounded-xl hover:scale-105 active:scale-95 cursor-pointer transition-transform"
                  style={{
                    background: gradient,
                    boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                  }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,.2)' }}>
                    <Icon className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <span className="text-white font-bold text-xs text-center leading-tight">{mod.name_ar}</span>
                </Link>
              )
            })}
            {list.length === 0 && (
              <p className="col-span-full text-center py-8 text-gray-400 text-sm">لا توجد وحدات متاحة</p>
            )}
          </div>
        </div>

      </main>
    </>
  )
}
