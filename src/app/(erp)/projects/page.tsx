'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  Plus, Search, Home, Truck, Building2,
  Calendar, Users, DollarSign,
} from 'lucide-react'

const PROJECTS = [
  {
    id: 'PRJ-001', name: 'مجمع السيدات السكني',    type: 'عقارات',  status: 'active',
    progress: 72, budget: 2800000, spent: 2016000, team: 12,
    start: '٢٠٢٤/٠١/٠١', end: '٢٠٢٥/١٢/٣١',
    desc: 'مشروع سكني يضم ٤٨ وحدة سكنية في منطقة الكرادة',
    icon: Home, color: '#2563eb', bg: '#eff6ff',
  },
  {
    id: 'PRJ-002', name: 'أسطول المركبات التجارية', type: 'مركبات', status: 'active',
    progress: 45, budget: 850000, spent: 382500, team: 6,
    start: '٢٠٢٥/٠٣/١٥', end: '٢٠٢٥/٠٩/٣٠',
    desc: 'إدارة وصيانة أسطول ٢٤ مركبة تجارية',
    icon: Truck, color: '#7c3aed', bg: '#faf5ff',
  },
  {
    id: 'PRJ-003', name: 'مبنى الإدارة المركزية',  type: 'عقارات', status: 'completed',
    progress: 100, budget: 1500000, spent: 1480000, team: 18,
    start: '٢٠٢٣/٠٤/٠١', end: '٢٠٢٥/٠٣/٣١',
    desc: 'بناء مقر إداري حديث على مساحة ٣٠٠٠ م٢',
    icon: Building2, color: '#16a34a', bg: '#f0fdf4',
  },
  {
    id: 'PRJ-004', name: 'توسعة الفرع الشمالي',    type: 'عقارات', status: 'planning',
    progress: 8, budget: 600000, spent: 48000, team: 4,
    start: '٢٠٢٥/٠٧/٠١', end: '٢٠٢٦/٠٦/٣٠',
    desc: 'توسعة وتطوير فرع الكرخ لاستيعاب الطاقة الجديدة',
    icon: Home, color: '#d97706', bg: '#fffbeb',
  },
  {
    id: 'PRJ-005', name: 'المجمع التجاري الجديد',  type: 'عقارات', status: 'active',
    progress: 35, budget: 3200000, spent: 1120000, team: 15,
    start: '٢٠٢٥/٠١/١٥', end: '٢٠٢٦/١٢/٣١',
    desc: 'تطوير مجمع تجاري متكامل في المنطقة الصناعية',
    icon: Building2, color: '#dc2626', bg: '#fef2f2',
  },
]

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:    { label: 'نشط',    cls: 'badge-success' },
  completed: { label: 'مكتمل', cls: 'badge-info'    },
  planning:  { label: 'تخطيط', cls: 'badge-warning' },
  paused:    { label: 'متوقف', cls: 'badge-danger'  },
}

export default function ProjectsPage() {
  const [view,   setView]   = useState<'cards' | 'table'>('cards')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = PROJECTS.filter(p => {
    const ms = !search || p.name.includes(search) || p.id.includes(search)
    const mf = filter === 'all' || p.status === filter
    return ms && mf
  })

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي المشاريع', value: PROJECTS.length,                                             unit: 'مشروع', cls: 'navy'  },
            { label: 'مشاريع نشطة',     value: PROJECTS.filter(p => p.status === 'active').length,          unit: 'مشروع', cls: 'green' },
            { label: 'إجمالي الميزانية', value: (PROJECTS.reduce((a,p) => a+p.budget, 0)/1000000).toFixed(1)+'M', unit: 'د.ع.', cls: 'blue'  },
            { label: 'المنصرف',         value: (PROJECTS.reduce((a,p) => a+p.spent,  0)/1000000).toFixed(1)+'M', unit: 'د.ع.', cls: 'amber' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <p className="text-xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.unit}</p>
              <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> مشروع جديد</button>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-52">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
          </div>
          <div className="flex items-center gap-1">
            {['all', 'active', 'planning', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {f === 'all' ? 'الكل' : STATUS_CONFIG[f]?.label ?? f}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button onClick={() => setView('cards')}
              className={`btn btn-sm ${view === 'cards' ? 'btn-primary' : 'btn-ghost'}`}>كروت</button>
            <button onClick={() => setView('table')}
              className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`}>جدول</button>
          </div>
        </div>

        {/* Cards */}
        {view === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => {
              const st  = STATUS_CONFIG[p.status]
              const pct = (p.spent / p.budget) * 100
              return (
                <div key={p.id} className="erp-card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="erp-card-body space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: p.bg }}>
                          <p.icon className="w-5 h-5" style={{ color: p.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm leading-tight">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.id} · {p.type}</p>
                        </div>
                      </div>
                      <span className={`badge ${st.cls} flex-shrink-0`}>{st.label}</span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">نسبة الإنجاز</span>
                        <span className="font-bold text-gray-800">{p.progress}٪</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${p.progress}%`,
                            background: p.progress >= 100 ? '#16a34a' : `linear-gradient(90deg,${p.color},${p.color}cc)`,
                          }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">الميزانية المستهلكة</span>
                        <span className={`font-bold ${pct > 90 ? 'text-debit' : 'text-gray-800'}`}>{pct.toFixed(0)}٪</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      {[
                        { icon: DollarSign, val: (p.budget/1000000).toFixed(1)+'M د.ع.' },
                        { icon: Users,      val: p.team + ' عضو فريق'                    },
                        { icon: Calendar,   val: p.start                                  },
                        { icon: Calendar,   val: p.end                                    },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <m.icon className="w-3.5 h-3.5" style={{ color: p.color }} />{m.val}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table */}
        {view === 'table' && (
          <div className="erp-card">
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>الرقم</th>
                    <th>المشروع</th>
                    <th>النوع</th>
                    <th className="col-num">الميزانية</th>
                    <th className="col-num">المنصرف</th>
                    <th>الإنجاز</th>
                    <th>الفريق</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const st = STATUS_CONFIG[p.status]
                    return (
                      <tr key={p.id}>
                        <td><span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{p.id}</span></td>
                        <td className="font-medium text-gray-800 text-sm">{p.name}</td>
                        <td><span className="badge badge-gray">{p.type}</span></td>
                        <td className="col-num text-sm">{p.budget.toLocaleString()}</td>
                        <td className="col-num text-sm text-debit">{p.spent.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{p.progress}٪</span>
                          </div>
                        </td>
                        <td className="text-sm text-gray-600">{p.team}</td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
