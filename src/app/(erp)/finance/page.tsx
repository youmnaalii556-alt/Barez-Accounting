'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Plus,
  Download, Filter, Search, ChevronDown, AlertCircle,
  CheckCircle2, Clock, BarChart3, Wallet, CreditCard,
  ArrowUpRight, ArrowDownRight, Building2,
} from 'lucide-react'

/* ─── Mock Data ─── */
const KPI = [
  { label: 'إجمالي الإيرادات',   value: '٤٧٥,٢٣٠', sub: '+١٢.٤٪ عن الشهر الماضي', color: 'green',  icon: TrendingUp,   trend: 'up'   },
  { label: 'إجمالي المصروفات',   value: '٢٩١,٨٤٠', sub: '+٥.١٪ عن الشهر الماضي',  color: 'red',    icon: TrendingDown, trend: 'up'   },
  { label: 'صافي الربح',         value: '١٨٣,٣٩٠', sub: '+٢٣.٧٪ عن الشهر الماضي', color: 'blue',   icon: BarChart3,    trend: 'up'   },
  { label: 'الفواتير المعلقة',   value: '٨',        sub: 'إجمالي ٦٢,٤٠٠ ج.م',      color: 'amber',  icon: FileText,     trend: 'warn' },
]

const BUDGET = [
  { category: 'المرتبات والأجور',   budget: 120000, actual: 114500, pct: 95 },
  { category: 'الإيجارات والمرافق', budget: 45000,  actual: 43200,  pct: 96 },
  { category: 'التسويق والمبيعات',  budget: 30000,  actual: 18700,  pct: 62 },
  { category: 'المشتريات والموارد', budget: 80000,  actual: 76800,  pct: 96 },
  { category: 'الصيانة والتشغيل',   budget: 20000,  actual: 12400,  pct: 62 },
  { category: 'مصروفات إدارية',     budget: 15000,  actual: 26240,  pct: 175 },
]

const INVOICES = [
  { ref: 'INV-2024-0041', client: 'شركة النيل للتجارة',   amount: '١٨,٥٠٠', date: '٢٠٢٤/١١/٠١', due: '٢٠٢٤/١٢/٠١', status: 'معلقة'    },
  { ref: 'INV-2024-0040', client: 'مجموعة الهرم',          amount: '٩,٢٠٠',  date: '٢٠٢٤/١٠/٢٨', due: '٢٠٢٤/١١/٢٨', status: 'متأخرة'   },
  { ref: 'INV-2024-0039', client: 'شركة بارز للإنشاء',     amount: '٣٣,٧٥٠', date: '٢٠٢٤/١٠/٢٠', due: '٢٠٢٤/١١/٢٠', status: 'مدفوعة'   },
  { ref: 'INV-2024-0038', client: 'الشركة المصرية للطاقة', amount: '١٢,٠٠٠', date: '٢٠٢٤/١٠/١٥', due: '٢٠٢٤/١١/١٥', status: 'مدفوعة'   },
  { ref: 'INV-2024-0037', client: 'دلتا للمقاولات',        amount: '٧,٩٥٠',  date: '٢٠٢٤/١٠/١٠', due: '٢٠٢٤/١١/١٠', status: 'جزئية'    },
  { ref: 'INV-2024-0036', client: 'نايل ريالتي',           amount: '٢٥,٤٠٠', date: '٢٠٢٤/١٠/٠٥', due: '٢٠٢٤/١١/٠٥', status: 'معلقة'    },
]

const CASHFLOW_MONTHS = ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const CASHFLOW_IN  = [62000, 74000, 68000, 82000, 91000, 95000]
const CASHFLOW_OUT = [48000, 55000, 51000, 64000, 70000, 72000]

const CASH_ACCOUNTS = [
  { name: 'الصندوق الرئيسي',   balance: '٨,٤٢٠',  icon: Wallet,   color: '#16a34a' },
  { name: 'البنك الأهلي',      balance: '١٣٢,٨٠٠', icon: Building2, color: '#2563eb' },
  { name: 'بنك مصر',           balance: '٨٧,٥٥٠',  icon: Building2, color: '#7c3aed' },
  { name: 'بطاقة الشركة',       balance: '٥,٢٣٠',  icon: CreditCard, color: '#d97706' },
]

const STATUS_STYLE: Record<string, string> = {
  'مدفوعة': 'badge-success',
  'معلقة':  'badge-warning',
  'متأخرة': 'badge-danger',
  'جزئية':  'badge-info',
}

const TABS = ['نظرة عامة', 'الفواتير', 'الميزانية', 'التدفق النقدي'] as const
type Tab = typeof TABS[number]

const maxBar = Math.max(...CASHFLOW_IN, ...CASHFLOW_OUT)

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('نظرة عامة')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('الكل')

  const filteredInvoices = INVOICES.filter(inv => {
    const matchSearch = !search || inv.ref.includes(search) || inv.client.includes(search)
    const matchStatus = statusFilter === 'الكل' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* Page Header */}
        <div className="erp-card">
          <div className="erp-card-body flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-800">الإدارة المالية</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  نوفمبر ٢٠٢٤ · السنة المالية ٢٠٢٤/٢٠٢٥
                  <span className="itag mr-2">IAS 1</span>
                  <span className="itag">IFRS 15</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline btn-sm"><Download className="w-4 h-4" /> تصدير PDF</button>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> فاتورة جديدة</button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI.map(k => (
            <div key={k.label} className={`stat-card ${k.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: k.color==='green'?'#f0fdf4':k.color==='red'?'#fef2f2':k.color==='blue'?'#eff6ff':'#fffbeb'
                  }}>
                  <k.icon className="w-5 h-5"
                    style={{
                      color: k.color==='green'?'#16a34a':k.color==='red'?'#dc2626':k.color==='blue'?'#2563eb':'#d97706'
                    }} />
                </div>
                {k.trend === 'up'
                  ? <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                      <ArrowUpRight className="w-3.5 h-3.5" /> {k.sub.split(' ')[0]}
                    </span>
                  : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-2xl font-black text-gray-800 mb-1">{k.value}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'نظرة عامة' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Cash Position */}
            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">المركز النقدي</h2>
                <span className="badge badge-success">محدّث</span>
              </div>
              <div className="erp-card-body space-y-3">
                {CASH_ACCOUNTS.map(acc => (
                  <div key={acc.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${acc.color}18` }}>
                        <acc.icon className="w-4 h-4" style={{ color: acc.color }} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{acc.name}</span>
                    </div>
                    <span className="text-sm font-black col-num" style={{ color: acc.color }}>{acc.balance}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500">الإجمالي</span>
                  <span className="font-black text-gray-800 text-sm col-num">٢٣٤,٠٠٠ ج.م</span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">توزيع المصروفات</h2>
                <span className="text-xs text-gray-400">نوفمبر ٢٠٢٤</span>
              </div>
              <div className="erp-card-body space-y-3">
                {[
                  { label: 'مرتبات وأجور', pct: 39, color: '#3b82f6' },
                  { label: 'إيجارات',      pct: 15, color: '#8b5cf6' },
                  { label: 'مشتريات',      pct: 26, color: '#22c55e' },
                  { label: 'تسويق',        pct: 6,  color: '#f59e0b' },
                  { label: 'أخرى',         pct: 14, color: '#64748b' },
                ].map(e => (
                  <div key={e.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{e.label}</span>
                      <span className="text-xs font-bold" style={{ color: e.color }}>{e.pct}٪</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${e.pct}%`, background: e.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">آخر المعاملات</h2>
                <button className="text-xs text-blue-600 hover:underline">عرض الكل</button>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { desc: 'دفع مرتبات أكتوبر',    amount: '-١١٤,٥٠٠', type: 'out', date: 'اليوم'  },
                  { desc: 'تحصيل INV-0039',        amount: '+٣٣,٧٥٠',  type: 'in',  date: 'أمس'   },
                  { desc: 'إيجار المكتب الرئيسي',  amount: '-١٢,٠٠٠',  type: 'out', date: '٢ يوم'  },
                  { desc: 'تحصيل INV-0038',        amount: '+١٢,٠٠٠',  type: 'in',  date: '٣ أيام' },
                  { desc: 'فاتورة كهرباء',          amount: '-٢,٤٠٠',   type: 'out', date: '٤ أيام' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        t.type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {t.type === 'in'
                          ? <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                          : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{t.desc}</p>
                        <p className="text-[10px] text-gray-400">{t.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black col-num ${
                      t.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Invoices Tab ── */}
        {tab === 'الفواتير' && (
          <div className="space-y-4">
            <div className="action-bar flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                  className="erp-input pr-9" />
              </div>
              <div className="flex gap-1">
                {['الكل', 'معلقة', 'مدفوعة', 'متأخرة', 'جزئية'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>{s}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm mr-auto">
                <Plus className="w-4 h-4" /> فاتورة جديدة
              </button>
            </div>

            <div className="erp-card overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>العميل</th>
                    <th className="col-num">المبلغ (ج.م)</th>
                    <th>تاريخ الإصدار</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-10 text-sm">لا توجد فواتير مطابقة</td></tr>
                  ) : filteredInvoices.map(inv => (
                    <tr key={inv.ref}>
                      <td className="font-mono text-xs text-blue-600">{inv.ref}</td>
                      <td className="font-semibold text-gray-800">{inv.client}</td>
                      <td className="col-num font-bold">{inv.amount}</td>
                      <td className="text-gray-500 text-sm">{inv.date}</td>
                      <td className={`text-sm font-medium ${inv.status==='متأخرة'?'text-red-600':'text-gray-500'}`}>{inv.due}</td>
                      <td><span className={`badge ${STATUS_STYLE[inv.status]}`}>{inv.status}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm"><Download className="w-3.5 h-3.5" /></button>
                          <button className="btn btn-ghost btn-sm"><ChevronDown className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Budget Tab ── */}
        {tab === 'الميزانية' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'الميزانية الإجمالية', value: '٣١٠,٠٠٠', color: '#1b3a6b' },
                { label: 'المنصرف الفعلي',     value: '٢٩١,٨٤٠', color: '#dc2626' },
                { label: 'المتبقي',             value: '١٨,١٦٠',  color: '#16a34a' },
              ].map(c => (
                <div key={c.label} className="erp-card">
                  <div className="erp-card-body text-center">
                    <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">الميزانية مقابل الفعلي — نوفمبر ٢٠٢٤</h2>
                <span className="badge badge-info">٩٤٪ مستخدم</span>
              </div>
              <div className="erp-card-body space-y-4">
                {BUDGET.map(b => {
                  const over = b.pct > 100
                  const bar  = Math.min(b.pct, 100)
                  return (
                    <div key={b.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">{b.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">الميزانية: {b.budget.toLocaleString('ar-EG')} ج.م</span>
                          <span className={`text-xs font-bold ${over?'text-red-600':'text-gray-700'}`}>
                            الفعلي: {b.actual.toLocaleString('ar-EG')} ج.م
                          </span>
                          {over && <span className="badge badge-danger">تجاوز {b.pct - 100}٪</span>}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${bar}%`,
                            background: over ? '#dc2626' : b.pct > 85 ? '#f59e0b' : '#16a34a',
                          }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Cash Flow Tab ── */}
        {tab === 'التدفق النقدي' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'تدفقات داخلة (الشهر)',  value: '٩٥,٠٠٠', color: '#16a34a', icon: ArrowUpRight   },
                { label: 'تدفقات خارجة (الشهر)',  value: '٧٢,٠٠٠', color: '#dc2626', icon: ArrowDownRight },
                { label: 'صافي التدفق',           value: '٢٣,٠٠٠', color: '#2563eb', icon: BarChart3      },
                { label: 'متوسط شهري (٦ أشهر)',  value: '١٨,١٦٧', color: '#7c3aed', icon: TrendingUp     },
              ].map(c => (
                <div key={c.label} className="erp-card">
                  <div className="erp-card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <c.icon className="w-4 h-4" style={{ color: c.color }} />
                      <span className="text-xs text-gray-500">{c.label}</span>
                    </div>
                    <p className="text-xl font-black col-num" style={{ color: c.color }}>{c.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ج.م</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">التدفق النقدي — آخر ٦ أشهر</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" /> داخل
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-red-400 inline-block" /> خارج
                  </span>
                </div>
              </div>
              <div className="erp-card-body">
                <div className="flex items-end gap-3 h-48 pt-4">
                  {CASHFLOW_MONTHS.map((month, i) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-1 h-36">
                        <div className="flex-1 rounded-t-md transition-all"
                          style={{
                            height: `${(CASHFLOW_IN[i] / maxBar) * 100}%`,
                            background: 'linear-gradient(180deg,#22c55e,#16a34a)',
                          }} />
                        <div className="flex-1 rounded-t-md transition-all"
                          style={{
                            height: `${(CASHFLOW_OUT[i] / maxBar) * 100}%`,
                            background: 'linear-gradient(180deg,#f87171,#dc2626)',
                          }} />
                      </div>
                      <span className="text-[10px] text-gray-400">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">قائمة التدفقات النقدية <span className="itag mr-1">IAS 7</span></h2>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="stmt-section-title">الأنشطة التشغيلية</div>
                {[
                  { label: 'تحصيل من العملاء',          val: '+٩٥,٠٠٠',  pos: true  },
                  { label: 'مدفوعات للموردين والموظفين', val: '-٦٨,٥٠٠',  pos: false },
                  { label: 'مدفوعات ضريبية',            val: '-٣,٥٠٠',   pos: false },
                ].map(r => (
                  <div key={r.label} className="stmt-row">
                    <span className="flex-1 text-sm text-gray-700">{r.label}</span>
                    <span className={`text-sm font-bold col-num ${r.pos ? 'text-credit' : 'text-debit'}`}>{r.val}</span>
                  </div>
                ))}
                <div className="stmt-total">
                  <span className="flex-1 text-sm">صافي الأنشطة التشغيلية</span>
                  <span className="text-sm font-black col-num text-credit">+٢٣,٠٠٠</span>
                </div>

                <div className="stmt-section-title">الأنشطة الاستثمارية</div>
                {[
                  { label: 'شراء أصول ثابتة',  val: '-٤,٢٠٠', pos: false },
                  { label: 'عائد استثمارات',    val: '+١,٨٠٠', pos: true  },
                ].map(r => (
                  <div key={r.label} className="stmt-row">
                    <span className="flex-1 text-sm text-gray-700">{r.label}</span>
                    <span className={`text-sm font-bold col-num ${r.pos ? 'text-credit' : 'text-debit'}`}>{r.val}</span>
                  </div>
                ))}
                <div className="stmt-total">
                  <span className="flex-1 text-sm">صافي الأنشطة الاستثمارية</span>
                  <span className="text-sm font-black col-num text-debit">-٢,٤٠٠</span>
                </div>

                <div className="stmt-grand-total">
                  <span className="flex-1 text-sm">صافي الزيادة في النقدية</span>
                  <span className="font-black col-num">+٢٠,٦٠٠ ج.م</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
