'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  Headphones, Plus, Search, MessageCircle, CheckCircle2,
  Clock, AlertCircle, XCircle, Phone, Mail, User, TrendingUp,
} from 'lucide-react'

const TICKETS = [
  { id: 'TKT-0128', client: 'مجمع السيدات',       issue: 'مشكلة في نظام الفوترة الإلكترونية',     priority: 'high',   status: 'open',       date: '٢٠٢٥/٠٦/٠٩', agent: 'سارة أحمد'    },
  { id: 'TKT-0127', client: 'شركة الرافدين',       issue: 'طلب إصدار فاتورة مصححة',               priority: 'medium', status: 'in_progress', date: '٢٠٢٥/٠٦/٠٨', agent: 'محمد حسن'     },
  { id: 'TKT-0126', client: 'مؤسسة دجلة',         issue: 'استفسار عن رصيد الحساب',               priority: 'low',    status: 'resolved',    date: '٢٠٢٥/٠٦/٠٧', agent: 'نور علي'      },
  { id: 'TKT-0125', client: 'شركة الفرات',         issue: 'خطأ في تطبيق الضريبة على الفاتورة',   priority: 'high',   status: 'open',        date: '٢٠٢٥/٠٦/٠٧', agent: 'أحمد كريم'    },
  { id: 'TKT-0124', client: 'مجموعة النخيل',       issue: 'طلب بيان حساب تفصيلي',               priority: 'medium', status: 'closed',      date: '٢٠٢٥/٠٦/٠٦', agent: 'سارة أحمد'    },
  { id: 'TKT-0123', client: 'شركة بابل للتجارة',   issue: 'تحديث بيانات الشركة في النظام',       priority: 'low',    status: 'resolved',    date: '٢٠٢٥/٠٦/٠٥', agent: 'محمد حسن'     },
  { id: 'TKT-0122', client: 'مصنع الأمل',          issue: 'مشكلة في الوصول للبوابة الإلكترونية', priority: 'urgent', status: 'in_progress', date: '٢٠٢٥/٠٦/٠٤', agent: 'خالد إبراهيم' },
]

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  open:        { label: 'مفتوح',        cls: 'badge-danger',  icon: AlertCircle  },
  in_progress: { label: 'قيد المعالجة', cls: 'badge-warning', icon: Clock        },
  resolved:    { label: 'تم الحل',      cls: 'badge-success', icon: CheckCircle2 },
  closed:      { label: 'مغلق',         cls: 'badge-gray',    icon: XCircle      },
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'عاجل',   cls: 'badge-danger'  },
  high:   { label: 'عالي',   cls: 'badge-warning' },
  medium: { label: 'متوسط',  cls: 'badge-info'    },
  low:    { label: 'منخفض',  cls: 'badge-gray'    },
}

const CLIENTS = [
  { name: 'مجمع السيدات',     phone: '07701111111', email: 'info@sidat.com',     tickets: 5, type: 'عميل رئيسي' },
  { name: 'شركة الرافدين',    phone: '07712222222', email: 'rafidain@email.com', tickets: 3, type: 'عميل نشط'   },
  { name: 'مؤسسة دجلة',       phone: '07723333333', email: 'dijla@email.com',    tickets: 2, type: 'عميل نشط'   },
  { name: 'شركة الفرات',      phone: '07734444444', email: 'furat@email.com',    tickets: 4, type: 'عميل رئيسي' },
  { name: 'مجموعة النخيل',    phone: '07745555555', email: 'nakhal@email.com',   tickets: 2, type: 'عميل نشط'   },
]

export default function CustomerServicePage() {
  const [tab,    setTab]    = useState<'tickets' | 'clients'>('tickets')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = TICKETS.filter(t => {
    const ms = !search || t.client.includes(search) || t.id.includes(search) || t.issue.includes(search)
    const mf = filter === 'all' || t.status === filter
    return ms && mf
  })

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي التذاكر', value: TICKETS.length,                                               unit: 'تذكرة', cls: 'navy'  },
            { label: 'تذاكر مفتوحة',  value: TICKETS.filter(t => t.status === 'open').length,               unit: 'تذكرة', cls: 'red'   },
            { label: 'قيد المعالجة',  value: TICKETS.filter(t => t.status === 'in_progress').length,        unit: 'تذكرة', cls: 'amber' },
            { label: 'تم الحل',       value: TICKETS.filter(t => t.status === 'resolved' || t.status === 'closed').length, unit: 'تذكرة', cls: 'green' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.unit}</p>
              <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {[
            { id: 'tickets', label: 'التذاكر',  icon: MessageCircle },
            { id: 'clients', label: 'العملاء',  icon: User          },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {tab === 'tickets' && (
          <div className="erp-card">
            <div className="action-bar">
              <button className="btn btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> تذكرة جديدة</button>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-52">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="flex items-center gap-1">
                {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                    {f === 'all' ? 'الكل' : STATUS_CONFIG[f]?.label ?? f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>رقم التذكرة</th>
                    <th>العميل</th>
                    <th>المشكلة</th>
                    <th>الأولوية</th>
                    <th>الحالة</th>
                    <th>الموظف المسؤول</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const st = STATUS_CONFIG[t.status]
                    const pr = PRIORITY_CONFIG[t.priority]
                    return (
                      <tr key={t.id}>
                        <td>
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {t.id}
                          </span>
                        </td>
                        <td className="font-medium text-gray-800 text-sm">{t.client}</td>
                        <td className="text-gray-600 text-sm max-w-xs">
                          <p className="truncate">{t.issue}</p>
                        </td>
                        <td><span className={`badge ${pr.cls}`}>{pr.label}</span></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <st.icon className="w-3.5 h-3.5" style={{ color: t.status === 'open' ? '#dc2626' : t.status === 'in_progress' ? '#d97706' : '#16a34a' }} />
                            <span className={`badge ${st.cls}`}>{st.label}</span>
                          </div>
                        </td>
                        <td className="text-gray-600 text-sm">{t.agent}</td>
                        <td className="text-gray-400 text-xs">{t.date}</td>
                        <td>
                          {(t.status === 'open' || t.status === 'in_progress') && (
                            <button className="btn btn-success btn-sm py-1 px-2 text-xs">
                              <CheckCircle2 className="w-3 h-3" /> حل
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clients */}
        {tab === 'clients' && (
          <div className="erp-card">
            <div className="action-bar">
              <button className="btn btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> عميل جديد</button>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>اسم العميل</th>
                    <th>الهاتف</th>
                    <th>البريد الإلكتروني</th>
                    <th className="col-num">عدد التذاكر</th>
                    <th>النوع</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIENTS.map(c => (
                    <tr key={c.name}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#1b3a6b,#2a5298)' }}>
                            {c.name[0]}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />{c.phone}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />{c.email}
                        </div>
                      </td>
                      <td className="col-num font-bold text-gray-800">{c.tickets}</td>
                      <td>
                        <span className={`badge ${c.type === 'عميل رئيسي' ? 'badge-amber' : 'badge-info'}`}>
                          {c.type === 'عميل رئيسي' && <TrendingUp className="w-3 h-3" />}
                          {c.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
