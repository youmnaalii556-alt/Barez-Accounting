'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Search, Plus, ChevronDown, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react'

type AccType = 'أصول' | 'خصوم' | 'حقوق ملكية' | 'إيرادات' | 'مصروفات'

interface Account {
  code: string
  name: string
  type: AccType
  balance: number
  nature: 'debit' | 'credit'
  level: number
  children?: Account[]
}

const CHART: Account[] = [
  {
    code: '١', name: 'الأصول', type: 'أصول', balance: 384200, nature: 'debit', level: 1,
    children: [
      {
        code: '١١', name: 'الأصول المتداولة', type: 'أصول', balance: 187600, nature: 'debit', level: 2,
        children: [
          { code: '١١٠١', name: 'الصندوق',                  type: 'أصول', balance: 42300,  nature: 'debit', level: 3 },
          { code: '١١٠٢', name: 'البنك - الحساب الجاري',   type: 'أصول', balance: 98500,  nature: 'debit', level: 3 },
          { code: '١١٠٣', name: 'صندوق العملات الأجنبية',  type: 'أصول', balance: 12800,  nature: 'debit', level: 3 },
          { code: '١٢٠١', name: 'ذمم مدينة - عملاء',        type: 'أصول', balance: 34000,  nature: 'debit', level: 3 },
        ],
      },
      {
        code: '١٢', name: 'الأصول غير المتداولة', type: 'أصول', balance: 196600, nature: 'debit', level: 2,
        children: [
          { code: '١٥٠١', name: 'المباني والمنشآت',          type: 'أصول', balance: 150000, nature: 'debit', level: 3 },
          { code: '١٥٠٢', name: 'الأثاث والمعدات',           type: 'أصول', balance: 28500,  nature: 'debit', level: 3 },
          { code: '١٥٠٣', name: 'السيارات والمركبات',        type: 'أصول', balance: 18100,  nature: 'debit', level: 3 },
        ],
      },
    ],
  },
  {
    code: '٢', name: 'الخصوم', type: 'خصوم', balance: 142800, nature: 'credit', level: 1,
    children: [
      {
        code: '٢١', name: 'الخصوم المتداولة', type: 'خصوم', balance: 98300, nature: 'credit', level: 2,
        children: [
          { code: '٢١٠١', name: 'رواتب مستحقة',              type: 'خصوم', balance: 42000,  nature: 'credit', level: 3 },
          { code: '٢١٠٢', name: 'ذمم دائنة - موردون',        type: 'خصوم', balance: 35600,  nature: 'credit', level: 3 },
          { code: '٢١٠٣', name: 'ضريبة القيمة المضافة',      type: 'خصوم', balance: 20700,  nature: 'credit', level: 3 },
        ],
      },
      {
        code: '٢٢', name: 'الخصوم غير المتداولة', type: 'خصوم', balance: 44500, nature: 'credit', level: 2,
        children: [
          { code: '٢٢٠١', name: 'قروض بنكية طويلة الأجل',  type: 'خصوم', balance: 44500,  nature: 'credit', level: 3 },
        ],
      },
    ],
  },
  {
    code: '٣', name: 'حقوق الملكية', type: 'حقوق ملكية', balance: 241400, nature: 'credit', level: 1,
    children: [
      { code: '٣١٠١', name: 'رأس المال',                     type: 'حقوق ملكية', balance: 200000, nature: 'credit', level: 2 },
      { code: '٣١٠٢', name: 'الأرباح المحتجزة',              type: 'حقوق ملكية', balance: 41400,  nature: 'credit', level: 2 },
    ],
  },
  {
    code: '٤', name: 'الإيرادات', type: 'إيرادات', balance: 245800, nature: 'credit', level: 1,
    children: [
      { code: '٤١٠١', name: 'إيرادات المبيعات',              type: 'إيرادات', balance: 198400, nature: 'credit', level: 2 },
      { code: '٤١٠٢', name: 'إيرادات الخدمات',               type: 'إيرادات', balance: 47400,  nature: 'credit', level: 2 },
    ],
  },
  {
    code: '٦', name: 'المصروفات', type: 'مصروفات', balance: 181320, nature: 'debit', level: 1,
    children: [
      { code: '٦١٠١', name: 'مصروف الرواتب',                 type: 'مصروفات', balance: 126000, nature: 'debit', level: 2 },
      { code: '٦٢٠١', name: 'إيجار المكاتب',                 type: 'مصروفات', balance: 24000,  nature: 'debit', level: 2 },
      { code: '٦٢٠٢', name: 'مصروفات كهرباء وماء',          type: 'مصروفات', balance: 8400,   nature: 'debit', level: 2 },
      { code: '٦٢٩٩', name: 'مصروفات متنوعة',                type: 'مصروفات', balance: 22920,  nature: 'debit', level: 2 },
    ],
  },
]

const TYPE_COLORS: Record<AccType, { bg: string; color: string; cls: string }> = {
  'أصول':        { bg: '#eff6ff', color: '#2563eb', cls: 'badge-info'    },
  'خصوم':        { bg: '#fef2f2', color: '#dc2626', cls: 'badge-danger'  },
  'حقوق ملكية': { bg: '#faf5ff', color: '#7c3aed', cls: 'badge-info'    },
  'إيرادات':    { bg: '#f0fdf4', color: '#16a34a', cls: 'badge-success'  },
  'مصروفات':    { bg: '#fef2f2', color: '#dc2626', cls: 'badge-warning'  },
}

function AccountRow({ acc, search }: { acc: Account; search: string }) {
  const [open, setOpen] = useState(acc.level === 1)
  const hasSubs   = (acc.children?.length ?? 0) > 0
  const tc        = TYPE_COLORS[acc.type]
  const isDebit   = acc.nature === 'debit'
  const pad       = (acc.level - 1) * 24

  return (
    <>
      <tr className={`${acc.level === 1 ? 'bg-slate-50' : ''}`}>
        <td style={{ paddingRight: `${pad + 14}px` }}>
          <div className="flex items-center gap-2">
            {hasSubs && (
              <button onClick={() => setOpen(p => !p)}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 flex-shrink-0">
                {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
            {!hasSubs && <span className="w-5 flex-shrink-0" />}
            <span className={`font-mono text-xs ${acc.level === 1 ? 'font-black text-gray-700' : 'text-blue-600'}`}>
              {acc.code}
            </span>
          </div>
        </td>
        <td className={`${acc.level === 1 ? 'font-black text-gray-800' : acc.level === 2 ? 'font-bold text-gray-700' : 'text-gray-700'} text-sm`}>
          {acc.name}
        </td>
        <td>
          <span className={`badge ${tc.cls}`} style={{ background: tc.bg, color: tc.color }}>
            {acc.type}
          </span>
        </td>
        <td className={`col-num font-bold text-sm ${isDebit ? 'text-debit' : 'text-credit'}`}>
          {isDebit
            ? <><TrendingDown className="w-3 h-3 inline ml-1" />{acc.balance.toLocaleString()}</>
            : <><TrendingUp className="w-3 h-3 inline ml-1" />{acc.balance.toLocaleString()}</>}
        </td>
        <td>
          <span className={`badge ${isDebit ? 'badge-danger' : 'badge-success'}`}>
            {isDebit ? 'مدين' : 'دائن'}
          </span>
        </td>
        <td>
          <span className={`badge ${acc.level === 1 ? 'badge-amber' : acc.level === 2 ? 'badge-info' : 'badge-gray'}`}>
            المستوى {acc.level}
          </span>
        </td>
      </tr>
      {open && acc.children?.map(child => (
        <AccountRow key={child.code} acc={child} search={search} />
      ))}
    </>
  )
}

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<AccType | 'all'>('all')

  const totalAssets     = 384200
  const totalLiabilities = 142800
  const totalEquity     = 241400

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الحسابات',   value: '٢٤٨',                               unit: 'حساب', cls: 'navy'  },
            { label: 'إجمالي الأصول',     value: totalAssets.toLocaleString(),          unit: 'د.ع.', cls: 'blue'  },
            { label: 'إجمالي الخصوم',     value: totalLiabilities.toLocaleString(),     unit: 'د.ع.', cls: 'red'   },
            { label: 'حقوق الملكية',      value: totalEquity.toLocaleString(),          unit: 'د.ع.', cls: 'green' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <p className="text-xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.unit}</p>
              <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="erp-card">
          <div className="action-bar">
            <button className="btn btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> إضافة حساب</button>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-52">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالرقم أو الاسم..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'أصول', 'خصوم', 'حقوق ملكية', 'إيرادات', 'مصروفات'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`}>
                  {t === 'all' ? 'الكل' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>رقم الحساب</th>
                  <th>اسم الحساب</th>
                  <th>النوع</th>
                  <th className="col-num">الرصيد (د.ع.)</th>
                  <th>الطبيعة</th>
                  <th>المستوى</th>
                </tr>
              </thead>
              <tbody>
                {CHART.map(acc => (
                  <AccountRow key={acc.code} acc={acc} search={search} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Accounting equation */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-l from-blue-50 to-indigo-50">
            <p className="text-xs font-bold text-gray-600 mb-2">معادلة الميزانية</p>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="text-blue-700">{totalAssets.toLocaleString()} الأصول</span>
              <span className="text-gray-400">=</span>
              <span className="text-red-700">{totalLiabilities.toLocaleString()} الخصوم</span>
              <span className="text-gray-400">+</span>
              <span className="text-green-700">{totalEquity.toLocaleString()} حقوق الملكية</span>
              <span className={`badge mr-auto ${totalAssets === totalLiabilities + totalEquity ? 'badge-success' : 'badge-danger'}`}>
                {totalAssets === totalLiabilities + totalEquity ? '✓ متوازن' : '✗ غير متوازن'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
