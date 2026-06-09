'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  Users, UserPlus, DollarSign, Calendar, Clock, Search, Filter,
  ChevronDown, Mail, Phone, MapPin, Building2, Star,
  TrendingUp, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'

const EMPLOYEES = [
  { id: 'EMP-001', name: 'محمد عبد الله الحسن',  dept: 'المحاسبة',      position: 'محاسب أول',       salary: 850000, status: 'active', leave: false,  join: '٢٠٢١/٠٣/١٥', phone: '07701234567', email: 'mohammed@barez.com' },
  { id: 'EMP-002', name: 'سارة أحمد العلي',       dept: 'الموارد البشرية',position: 'مدير موارد بشرية', salary: 950000, status: 'active', leave: false,  join: '٢٠٢٠/٠٧/٠١', phone: '07712345678', email: 'sara@barez.com'     },
  { id: 'EMP-003', name: 'علي حسين الجبوري',      dept: 'المشاريع',       position: 'مهندس مشاريع',    salary: 780000, status: 'active', leave: true,   join: '٢٠٢٢/٠١/١٠', phone: '07723456789', email: 'ali@barez.com'      },
  { id: 'EMP-004', name: 'نور محمد الزبيدي',      dept: 'المحاسبة',      position: 'محاسبة',           salary: 650000, status: 'active', leave: false,  join: '٢٠٢٣/٠٥/٢٠', phone: '07734567890', email: 'nour@barez.com'     },
  { id: 'EMP-005', name: 'أحمد عبد الرحمن',       dept: 'تقنية المعلومات',position: 'مطور برمجيات',    salary: 900000, status: 'active', leave: false,  join: '٢٠٢١/١١/٠٥', phone: '07745678901', email: 'ahmed@barez.com'    },
  { id: 'EMP-006', name: 'فاطمة علي الموسى',      dept: 'خدمة العملاء',  position: 'ممثل خدمة عملاء',  salary: 580000, status: 'inactive', leave: false, join: '٢٠٢٢/٠٩/١٢', phone: '07756789012', email: 'fatima@barez.com'   },
  { id: 'EMP-007', name: 'خالد إبراهيم الشمري',   dept: 'المشاريع',      position: 'مشرف مشاريع',      salary: 820000, status: 'active', leave: false,  join: '٢٠٢٠/٠٢/٢٨', phone: '07767890123', email: 'khalid@barez.com'   },
  { id: 'EMP-008', name: 'زينب حسن الكريمي',      dept: 'المحاسبة',      position: 'محاسبة',           salary: 670000, status: 'active', leave: true,   join: '٢٠٢٣/٠٨/٠١', phone: '07778901234', email: 'zainab@barez.com'   },
]

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  'المحاسبة':       { bg: '#eff6ff', color: '#2563eb' },
  'الموارد البشرية': { bg: '#f0fdf4', color: '#16a34a' },
  'المشاريع':       { bg: '#faf5ff', color: '#7c3aed' },
  'تقنية المعلومات': { bg: '#f0fdfa', color: '#0d9488' },
  'خدمة العملاء':   { bg: '#fef2f2', color: '#dc2626' },
}

const LEAVE_REQUESTS = [
  { emp: 'علي حسين الجبوري',  type: 'إجازة اعتيادية', from: '٢٠٢٥/٠٦/١٠', to: '٢٠٢٥/٠٦/١٥', days: 5, status: 'pending'  },
  { emp: 'زينب حسن الكريمي',  type: 'إجازة مرضية',    from: '٢٠٢٥/٠٦/٠٨', to: '٢٠٢٥/٠٦/١٠', days: 3, status: 'approved' },
  { emp: 'نور محمد الزبيدي',  type: 'إجازة اعتيادية', from: '٢٠٢٥/٠٦/٢٠', to: '٢٠٢٥/٠٦/٢٤', days: 5, status: 'pending'  },
]

const LEAVE_STATUS = {
  pending:  { cls: 'badge-warning',  label: 'قيد المراجعة', icon: AlertCircle  },
  approved: { cls: 'badge-success',  label: 'معتمد',        icon: CheckCircle2 },
  rejected: { cls: 'badge-danger',   label: 'مرفوض',        icon: XCircle      },
}

export default function HRPage() {
  const [search,  setSearch]  = useState('')
  const [tab,     setTab]     = useState<'employees' | 'leaves' | 'payroll'>('employees')
  const [deptF,   setDeptF]   = useState('all')
  const [expand,  setExpand]  = useState<string | null>(null)

  const totalSalaries = EMPLOYEES.filter(e => e.status === 'active').reduce((a, e) => a + e.salary, 0)
  const depts         = [...new Set(EMPLOYEES.map(e => e.dept))]

  const filtered = EMPLOYEES.filter(e => {
    const ms = !search || e.name.includes(search) || e.id.includes(search) || e.position.includes(search)
    const md = deptF === 'all' || e.dept === deptF
    return ms && md
  })

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الموظفين',  value: EMPLOYEES.length,                                            unit: 'موظف',   cls: 'navy'  },
            { label: 'موظفون نشطون',     value: EMPLOYEES.filter(e => e.status === 'active').length,         unit: 'موظف',   cls: 'green' },
            { label: 'في إجازة',          value: EMPLOYEES.filter(e => e.leave).length,                      unit: 'موظف',   cls: 'amber' },
            { label: 'كشف الرواتب',       value: (totalSalaries / 1000000).toFixed(2) + 'M',                 unit: 'د.ع.',   cls: 'blue'  },
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
            { id: 'employees', label: 'الموظفون',      icon: Users       },
            { id: 'leaves',    label: 'طلبات الإجازة', icon: Calendar    },
            { id: 'payroll',   label: 'كشف الرواتب',  icon: DollarSign  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* EMPLOYEES TAB */}
        {tab === 'employees' && (
          <div className="erp-card">
            <div className="action-bar">
              <button className="btn btn-primary btn-sm"><UserPlus className="w-3.5 h-3.5" /> موظف جديد</button>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-52">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الرقم..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <select value={deptF} onChange={e => setDeptF(e.target.value)}
                className="erp-input erp-select py-1.5 text-sm w-44">
                <option value="all">كل الأقسام</option>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
              <div className="flex-1" />
              <button className="btn btn-outline btn-sm"><Filter className="w-3.5 h-3.5" /> تصفية</button>
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}></th>
                    <th>الموظف</th>
                    <th>القسم</th>
                    <th>المسمى الوظيفي</th>
                    <th className="col-num">الراتب (د.ع.)</th>
                    <th>تاريخ الالتحاق</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => [
                    <tr key={emp.id} className="cursor-pointer"
                      onClick={() => setExpand(expand === emp.id ? null : emp.id)}>
                      <td>
                        {expand === emp.id
                          ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                          : <ChevronDown className="w-3.5 h-3.5 text-gray-300 -rotate-90" />}
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                            style={{ background: `linear-gradient(135deg,${DEPT_COLORS[emp.dept]?.color ?? '#64748b'},${DEPT_COLORS[emp.dept]?.color ?? '#64748b'}aa)` }}>
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: DEPT_COLORS[emp.dept]?.bg ?? '#f8fafc',
                          color:      DEPT_COLORS[emp.dept]?.color ?? '#475569',
                          border: `1px solid ${DEPT_COLORS[emp.dept]?.color ?? '#e2e8f0'}33`,
                        }}>
                          <Building2 className="w-3 h-3" />{emp.dept}
                        </span>
                      </td>
                      <td className="text-gray-700 text-sm">{emp.position}</td>
                      <td className="col-num font-bold text-gray-800 text-sm">{emp.salary.toLocaleString()}</td>
                      <td className="text-gray-500 text-xs">{emp.join}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                          {emp.leave && <span className="badge badge-amber"><Clock className="w-2.5 h-2.5" /> إجازة</span>}
                        </div>
                      </td>
                    </tr>,
                    expand === emp.id && (
                      <tr key={`${emp.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <div className="bg-blue-50/50 border-y border-blue-100 px-6 py-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                <span>{emp.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-3.5 h-3.5 text-blue-500" />
                                <span>{emp.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                <span>بغداد، العراق</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span>تقييم: ممتاز</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ])}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="font-bold text-gray-700 text-sm">المجموع ({filtered.length} موظف)</td>
                    <td className="col-num font-black text-gray-800 text-sm">
                      {filtered.reduce((a, e) => a + e.salary, 0).toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* LEAVES TAB */}
        {tab === 'leaves' && (
          <div className="erp-card">
            <div className="action-bar">
              <button className="btn btn-primary btn-sm"><Calendar className="w-3.5 h-3.5" /> طلب إجازة جديد</button>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>نوع الإجازة</th>
                    <th>من</th>
                    <th>إلى</th>
                    <th className="col-num">الأيام</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {LEAVE_REQUESTS.map((l, i) => {
                    const st = LEAVE_STATUS[l.status as keyof typeof LEAVE_STATUS]
                    return (
                      <tr key={i}>
                        <td className="font-medium text-gray-800 text-sm">{l.emp}</td>
                        <td><span className="badge badge-info">{l.type}</span></td>
                        <td className="text-gray-500 text-sm">{l.from}</td>
                        <td className="text-gray-500 text-sm">{l.to}</td>
                        <td className="col-num font-bold text-gray-800">{l.days}</td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td>
                          {l.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <button className="btn btn-success btn-sm py-1 px-2 text-xs">
                                <CheckCircle2 className="w-3 h-3" /> اعتماد
                              </button>
                              <button className="btn btn-danger btn-sm py-1 px-2 text-xs">
                                <XCircle className="w-3 h-3" /> رفض
                              </button>
                            </div>
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

        {/* PAYROLL TAB */}
        {tab === 'payroll' && (
          <div className="erp-card">
            <div className="action-bar">
              <button className="btn btn-success btn-sm"><DollarSign className="w-3.5 h-3.5" /> إنشاء كشف الرواتب</button>
              <span className="badge badge-amber">يونيو ٢٠٢٥ — قيد المعالجة</span>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>القسم</th>
                    <th className="col-num">الراتب الأساسي</th>
                    <th className="col-num">البدلات</th>
                    <th className="col-num">الخصومات</th>
                    <th className="col-num">صافي الراتب</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.filter(e => e.status === 'active').map(emp => {
                    const allowances  = Math.round(emp.salary * 0.15)
                    const deductions  = Math.round(emp.salary * 0.05)
                    const net         = emp.salary + allowances - deductions
                    return (
                      <tr key={emp.id}>
                        <td className="font-medium text-gray-800 text-sm">{emp.name}</td>
                        <td><span className="badge badge-gray text-xs">{emp.dept}</span></td>
                        <td className="col-num text-gray-700 text-sm">{emp.salary.toLocaleString()}</td>
                        <td className="col-num text-credit text-sm">{allowances.toLocaleString()}</td>
                        <td className="col-num text-debit text-sm">{deductions.toLocaleString()}</td>
                        <td className="col-num font-black text-gray-800 text-sm">{net.toLocaleString()}</td>
                        <td><span className="badge badge-warning">قيد التحضير</span></td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="font-black text-gray-700">الإجمالي</td>
                    <td className="col-num font-black text-gray-800 text-sm">
                      {EMPLOYEES.filter(e => e.status === 'active')
                        .reduce((a, e) => a + Math.round(e.salary * 1.10), 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
