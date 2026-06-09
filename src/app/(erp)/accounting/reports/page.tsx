'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Download, BarChart3, FileText, TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react'

const REPORTS = [
  { id: 1, name: 'تقرير الإيرادات الشهري',        icon: TrendingUp,   color: '#16a34a', period: 'يونيو ٢٠٢٥',   status: 'ready'   },
  { id: 2, name: 'تحليل المصروفات التشغيلية',      icon: BarChart3,    color: '#2563eb', period: 'يونيو ٢٠٢٥',   status: 'ready'   },
  { id: 3, name: 'مقارنة الأداء السنوي',            icon: TrendingUp,   color: '#7c3aed', period: '٢٠٢٤ vs ٢٠٢٥', status: 'ready'   },
  { id: 4, name: 'تقرير توزيع المصروفات',           icon: DollarSign,   color: '#d97706', period: 'الربع الثاني',  status: 'pending' },
  { id: 5, name: 'تقرير إيرادات المشاريع',          icon: Briefcase,    color: '#0d9488', period: 'يونيو ٢٠٢٥',   status: 'ready'   },
  { id: 6, name: 'تحليل التدفق النقدي',              icon: FileText,     color: '#dc2626', period: 'الربع الثاني',  status: 'pending' },
  { id: 7, name: 'تقرير الرواتب والمستحقات',        icon: Users,        color: '#6d28d9', period: 'مايو ٢٠٢٥',    status: 'ready'   },
  { id: 8, name: 'ميزانية مقارنة بالفعلي',           icon: BarChart3,    color: '#0891b2', period: 'يونيو ٢٠٢٥',   status: 'ready'   },
]

const MONTHLY_DATA = [
  { month: 'يناير',   revenue: 36500, expenses: 28200 },
  { month: 'فبراير',  revenue: 42100, expenses: 31500 },
  { month: 'مارس',    revenue: 38800, expenses: 29700 },
  { month: 'أبريل',   revenue: 44200, expenses: 33100 },
  { month: 'مايو',    revenue: 40600, expenses: 30800 },
  { month: 'يونيو',   revenue: 43600, expenses: 28020 },
]

const MAX_VAL = Math.max(...MONTHLY_DATA.flatMap(d => [d.revenue, d.expenses]))

export default function AccountingReportsPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* Bar chart – revenue vs expenses */}
        <div className="erp-card">
          <div className="erp-card-header">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">الإيرادات والمصروفات — النصف الأول ٢٠٢٥</h2>
              <p className="text-xs text-gray-400 mt-0.5">مقارنة شهرية بالدينار العراقي</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background:'#22c55e' }} /> إيرادات</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background:'#ef4444' }} /> مصروفات</span>
            </div>
          </div>
          <div className="erp-card-body">
            <div className="flex items-end gap-4 h-48">
              {MONTHLY_DATA.map(d => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full h-36">
                    <div className="flex-1 rounded-t-sm transition-all hover:opacity-90"
                      style={{ height: `${(d.revenue / MAX_VAL) * 100}%`, background: '#22c55e', minHeight: 4 }}
                      title={`${d.revenue.toLocaleString()} د.ع.`} />
                    <div className="flex-1 rounded-t-sm transition-all hover:opacity-90"
                      style={{ height: `${(d.expenses / MAX_VAL) * 100}%`, background: '#ef4444', minHeight: 4 }}
                      title={`${d.expenses.toLocaleString()} د.ع.`} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{d.month}</span>
                  <span className={`text-xs font-bold ${d.revenue > d.expenses ? 'text-credit' : 'text-debit'}`}>
                    {(d.revenue - d.expenses).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {[
                { l: 'إجمالي الإيرادات',   v: MONTHLY_DATA.reduce((a,d) => a+d.revenue,0),   c: 'text-credit' },
                { l: 'إجمالي المصروفات',   v: MONTHLY_DATA.reduce((a,d) => a+d.expenses,0),  c: 'text-debit'  },
                { l: 'صافي الربح',          v: MONTHLY_DATA.reduce((a,d) => a+d.revenue-d.expenses,0), c: 'text-blue-700' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className={`text-lg font-black ${s.c}`}>{s.v.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{s.l} — د.ع.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report list */}
        <div className="erp-card">
          <div className="erp-card-header">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">التقارير المتاحة</h2>
              <p className="text-xs text-gray-400 mt-0.5">{REPORTS.length} تقرير</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {REPORTS.map(r => (
              <div key={r.id}
                onClick={() => setSelected(r.id)}
                className={`erp-card p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${selected === r.id ? 'border-blue-400' : 'border-transparent'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${r.color}18` }}>
                    <r.icon className="w-5 h-5" style={{ color: r.color }} />
                  </div>
                  <span className={`badge ${r.status === 'ready' ? 'badge-success' : 'badge-warning'}`}>
                    {r.status === 'ready' ? 'جاهز' : 'قيد الإعداد'}
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-sm leading-snug mb-1">{r.name}</p>
                <p className="text-xs text-gray-400">{r.period}</p>
                {r.status === 'ready' && (
                  <button className="btn btn-outline btn-sm w-full mt-3" onClick={e => e.stopPropagation()}>
                    <Download className="w-3 h-3" /> تحميل
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
