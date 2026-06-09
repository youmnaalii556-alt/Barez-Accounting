'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  UserCog, Calendar, FileText, DollarSign, Clock,
  CheckCircle2, XCircle, AlertCircle, Download,
  ChevronDown, ChevronUp, Star, Phone, Mail,
  MapPin, Shield, Edit3, Plus, Send, X, Check,
} from 'lucide-react'

/* ─── Mock employee data ─── */
const EMPLOYEE = {
  name: 'يمنى علي محمد',
  name_en: 'Yomna Ali',
  id: 'EMP-0024',
  dept: 'الإدارة المالية',
  title: 'محاسب أول',
  phone: '01012345678',
  email: 'youmnaalii556@gmail.com',
  location: 'القاهرة، مصر',
  join_date: '٢٠٢٢/٠٣/١٥',
  rating: 4.7,
  avatar_initials: 'ي.ع',
}

const LEAVE_BALANCE = [
  { type: 'إجازة سنوية',    used: 8,  total: 21, color: '#3b82f6' },
  { type: 'إجازة مرضية',   used: 2,  total: 10, color: '#22c55e' },
  { type: 'إجازة طارئة',   used: 1,  total: 6,  color: '#f59e0b' },
  { type: 'إجازة رسمية',   used: 0,  total: 14, color: '#8b5cf6' },
]

const PAYSLIPS = [
  { month: 'أكتوبر ٢٠٢٤',   gross: '١٢,٥٠٠', net: '١٠,٨٧٠', date: '٢٠٢٤/١١/٠١', status: 'مدفوع'   },
  { month: 'سبتمبر ٢٠٢٤',  gross: '١٢,٥٠٠', net: '١٠,٨٧٠', date: '٢٠٢٤/١٠/٠١', status: 'مدفوع'   },
  { month: 'أغسطس ٢٠٢٤',   gross: '١٣,٢٠٠', net: '١١,٤٠٠', date: '٢٠٢٤/٠٩/٠١', status: 'مدفوع'   },
  { month: 'يوليو ٢٠٢٤',   gross: '١٢,٥٠٠', net: '١٠,٨٧٠', date: '٢٠٢٤/٠٨/٠١', status: 'مدفوع'   },
]

const ATTENDANCE = [
  { day: 'الأحد',    date: '٣',  status: 'حاضر',  in: '٨:٠٢', out: '١٧:١٥' },
  { day: 'الاثنين',  date: '٤',  status: 'حاضر',  in: '٨:٠٠', out: '١٧:٣٠' },
  { day: 'الثلاثاء', date: '٥',  status: 'حاضر',  in: '٧:٥٥', out: '١٧:٠٠' },
  { day: 'الأربعاء', date: '٦',  status: 'حاضر',  in: '٨:١٠', out: '١٧:٢٠' },
  { day: 'الخميس',  date: '٧',  status: 'حاضر',  in: '٨:٠٥', out: '١٧:٤٥' },
  { day: 'الجمعة',  date: '٨',  status: 'عطلة',  in: '—',     out: '—'     },
  { day: 'السبت',   date: '٩',  status: 'عطلة',  in: '—',     out: '—'     },
]

const MY_REQUESTS = [
  { ref: 'REQ-2024-0031', type: 'إجازة سنوية',  from: '٢٠٢٤/١١/٢٠', to: '٢٠٢٤/١١/٢٤', days: '٥', status: 'موافق'    },
  { ref: 'REQ-2024-0027', type: 'إجازة طارئة',  from: '٢٠٢٤/١٠/١٠', to: '٢٠٢٤/١٠/١٠', days: '١', status: 'موافق'    },
  { ref: 'REQ-2024-0018', type: 'تعديل بيانات', from: '٢٠٢٤/٠٨/٠٥', to: '—',             days: '—', status: 'قيد المراجعة' },
  { ref: 'REQ-2024-0012', type: 'شهادة عمل',    from: '٢٠٢٤/٠٦/١٢', to: '—',             days: '—', status: 'مكتمل'    },
]

const STATUS_STYLE: Record<string, string> = {
  'موافق':          'badge-success',
  'مرفوض':         'badge-danger',
  'قيد المراجعة':  'badge-warning',
  'مكتمل':         'badge-info',
}
const ATT_STYLE: Record<string, string> = {
  'حاضر': 'text-green-600',
  'غائب': 'text-red-500',
  'عطلة': 'text-gray-400',
  'متأخر': 'text-amber-500',
}

const TABS = ['ملفي الشخصي', 'الإجازات', 'قسائم الراتب', 'الدوام', 'طلباتي'] as const
type Tab = typeof TABS[number]

export default function SelfServicePage() {
  const [tab, setTab] = useState<Tab>('ملفي الشخصي')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ type: '', from: '', to: '', reason: '' })
  const [leaveSubmitted, setLeaveSubmitted] = useState(false)

  function submitLeave() {
    setLeaveSubmitted(true)
    setTimeout(() => { setShowLeaveModal(false); setLeaveSubmitted(false); setLeaveForm({ type: '', from: '', to: '', reason: '' }) }, 1500)
  }

  return (
    <>
      <Header profile={null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* Profile Hero */}
        <div className="erp-card overflow-hidden">
          <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg,#0f2744 0%,#1b3a6b 50%,#2a5298 100%)' }} />
          <div className="erp-card-body pt-0 -mt-10 flex flex-wrap items-end gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg border-4 border-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#c5a028,#e2b93b)' }}>
              {EMPLOYEE.avatar_initials}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-black text-gray-800">{EMPLOYEE.name}</h1>
                <span className="badge badge-info">{EMPLOYEE.title}</span>
                <span className="badge badge-gray">{EMPLOYEE.id}</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{EMPLOYEE.dept} · انضم {EMPLOYEE.join_date}</p>
            </div>
            <div className="flex items-center gap-1 pb-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(EMPLOYEE.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
              ))}
              <span className="text-xs text-gray-500 mr-1">{EMPLOYEE.rating}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'ملفي الشخصي' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">البيانات الشخصية</h2>
                <button className="btn btn-ghost btn-sm"><Edit3 className="w-3.5 h-3.5" /> تعديل</button>
              </div>
              <div className="erp-card-body space-y-4">
                {[
                  { label: 'الاسم الكامل',   value: EMPLOYEE.name,      icon: UserCog  },
                  { label: 'الاسم بالإنجليزية', value: EMPLOYEE.name_en, icon: UserCog  },
                  { label: 'رقم الهاتف',     value: EMPLOYEE.phone,     icon: Phone    },
                  { label: 'البريد الإلكتروني', value: EMPLOYEE.email,  icon: Mail     },
                  { label: 'الموقع',         value: EMPLOYEE.location,  icon: MapPin   },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                      <f.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{f.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="erp-card">
                <div className="erp-card-header">
                  <h2 className="font-bold text-gray-800 text-sm">بيانات الوظيفة</h2>
                </div>
                <div className="erp-card-body space-y-3">
                  {[
                    { label: 'القسم',      value: EMPLOYEE.dept  },
                    { label: 'المسمى',     value: EMPLOYEE.title },
                    { label: 'تاريخ التعيين', value: EMPLOYEE.join_date },
                    { label: 'الصلاحية',  value: 'موظف'         },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-gray-400">{f.label}</span>
                      <span className="text-sm font-semibold text-gray-700">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="erp-card">
                <div className="erp-card-header">
                  <h2 className="font-bold text-gray-800 text-sm">الأمان والخصوصية</h2>
                </div>
                <div className="erp-card-body space-y-2">
                  {[
                    { label: 'كلمة المرور',        action: 'تغيير',    icon: Shield },
                    { label: 'التحقق بخطوتين',     action: 'تفعيل',    icon: Shield },
                    { label: 'سجل تسجيل الدخول',  action: 'عرض',      icon: Clock  },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2">
                        <s.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{s.label}</span>
                      </div>
                      <button className="text-xs text-blue-600 hover:underline font-semibold">{s.action}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Leave Tab ── */}
        {tab === 'الإجازات' && (
          <div className="space-y-5">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {LEAVE_BALANCE.map(lb => {
                const remaining = lb.total - lb.used
                const pct = (remaining / lb.total) * 100
                return (
                  <div key={lb.type} className="erp-card">
                    <div className="erp-card-body text-center space-y-2">
                      <p className="text-xs text-gray-500 font-medium">{lb.type}</p>
                      <p className="text-3xl font-black" style={{ color: lb.color }}>{remaining}</p>
                      <p className="text-xs text-gray-400">متبقي من {lb.total} يوم</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mx-4">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: lb.color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Request Leave Button */}
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-700">طلبات الإجازة السابقة</h2>
              <button onClick={() => setShowLeaveModal(true)} className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" /> طلب إجازة جديدة
              </button>
            </div>

            <div className="erp-card overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>النوع</th>
                    <th>من</th>
                    <th>إلى</th>
                    <th className="col-num">الأيام</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {MY_REQUESTS.filter(r => r.type.includes('إجازة')).map(r => (
                    <tr key={r.ref}>
                      <td className="font-mono text-xs text-blue-600">{r.ref}</td>
                      <td className="font-semibold text-sm">{r.type}</td>
                      <td className="text-gray-500 text-sm">{r.from}</td>
                      <td className="text-gray-500 text-sm">{r.to}</td>
                      <td className="col-num font-bold">{r.days}</td>
                      <td><span className={`badge ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leave Request Modal */}
            {showLeaveModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-800">طلب إجازة جديدة</h3>
                    <button onClick={() => setShowLeaveModal(false)} className="btn btn-ghost btn-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {leaveSubmitted ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <p className="text-green-600 font-bold">تم إرسال الطلب بنجاح!</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="erp-label">نوع الإجازة *</label>
                        <select value={leaveForm.type}
                          onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value }))}
                          className="erp-input">
                          <option value="">اختر النوع</option>
                          {LEAVE_BALANCE.map(lb => <option key={lb.type} value={lb.type}>{lb.type}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="erp-label">من تاريخ *</label>
                          <input type="date" value={leaveForm.from}
                            onChange={e => setLeaveForm(f => ({ ...f, from: e.target.value }))}
                            className="erp-input" dir="ltr" />
                        </div>
                        <div>
                          <label className="erp-label">إلى تاريخ *</label>
                          <input type="date" value={leaveForm.to}
                            onChange={e => setLeaveForm(f => ({ ...f, to: e.target.value }))}
                            className="erp-input" dir="ltr" />
                        </div>
                      </div>
                      <div>
                        <label className="erp-label">سبب الطلب</label>
                        <textarea value={leaveForm.reason} rows={3}
                          onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                          placeholder="اكتب سبب الإجازة باختصار..."
                          className="erp-input resize-none" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={submitLeave} className="btn btn-primary flex-1">
                          <Send className="w-4 h-4" /> إرسال الطلب
                        </button>
                        <button onClick={() => setShowLeaveModal(false)} className="btn btn-outline">
                          إلغاء
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Payslips Tab ── */}
        {tab === 'قسائم الراتب' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'الراتب الأساسي',    value: '١٠,٠٠٠', note: 'شهرياً', color: '#1b3a6b'  },
                { label: 'إجمالي البدلات',   value: '٢,٥٠٠',  note: 'مواصلات + سكن + إنتاجية', color: '#22c55e'  },
                { label: 'إجمالي الاستقطاع', value: '١,٦٣٠',  note: 'تأمين + ضريبة', color: '#dc2626'  },
              ].map(c => (
                <div key={c.label} className="erp-card">
                  <div className="erp-card-body text-center">
                    <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="erp-card overflow-x-auto">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">سجل قسائم الراتب</h2>
              </div>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>الشهر</th>
                    <th className="col-num">الإجمالي</th>
                    <th className="col-num">الصافي</th>
                    <th>تاريخ الدفع</th>
                    <th>الحالة</th>
                    <th>تنزيل</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYSLIPS.map(p => (
                    <tr key={p.month}>
                      <td className="font-semibold text-gray-800">{p.month}</td>
                      <td className="col-num text-gray-700">{p.gross}</td>
                      <td className="col-num font-black text-green-600">{p.net}</td>
                      <td className="text-gray-500 text-sm">{p.date}</td>
                      <td><span className="badge badge-success">{p.status}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Latest Payslip Detail */}
            <div className="erp-card">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">تفاصيل قسيمة أكتوبر ٢٠٢٤</h2>
                <button className="btn btn-outline btn-sm"><Download className="w-3.5 h-3.5" /> PDF</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 divide-x-reverse">
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">الإيرادات</p>
                  {[
                    { label: 'الراتب الأساسي',    val: '١٠,٠٠٠' },
                    { label: 'بدل مواصلات',       val: '٨٠٠'    },
                    { label: 'بدل سكن',           val: '١,٢٠٠'  },
                    { label: 'بدل إنتاجية',       val: '٥٠٠'    },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{r.label}</span>
                      <span className="font-semibold col-num text-green-700">+{r.val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-gray-700">الإجمالي</span>
                    <span className="col-num text-green-700">١٢,٥٠٠</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">الاستقطاعات</p>
                  {[
                    { label: 'التأمين الاجتماعي', val: '٨٣٠'  },
                    { label: 'ضريبة الدخل',      val: '٨٠٠'  },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{r.label}</span>
                      <span className="font-semibold col-num text-red-600">-{r.val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-gray-700">إجمالي الاستقطاع</span>
                    <span className="col-num text-red-600">-١,٦٣٠</span>
                  </div>
                  <div className="flex justify-between text-base font-black pt-4 border-t-2 border-gray-200 mt-2">
                    <span className="text-gray-800">صافي الراتب</span>
                    <span className="col-num text-blue-700">١٠,٨٧٠ ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Attendance Tab ── */}
        {tab === 'الدوام' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'أيام حضور',   value: '٢٢', color: '#22c55e' },
                { label: 'أيام غياب',   value: '٠',  color: '#dc2626' },
                { label: 'ساعات عمل',  value: '١٨٤', color: '#2563eb' },
                { label: 'تأخيرات',    value: '١',  color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="erp-card">
                  <div className="erp-card-body text-center">
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="erp-card overflow-x-auto">
              <div className="erp-card-header">
                <h2 className="font-bold text-gray-800 text-sm">سجل الدوام — الأسبوع الحالي</h2>
              </div>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>اليوم</th>
                    <th className="col-num">التاريخ</th>
                    <th>الحالة</th>
                    <th className="col-num">وقت الدخول</th>
                    <th className="col-num">وقت الخروج</th>
                    <th className="col-num">ساعات العمل</th>
                  </tr>
                </thead>
                <tbody>
                  {ATTENDANCE.map(a => {
                    const isWorking = a.status === 'حاضر' || a.status === 'متأخر'
                    const hours = isWorking
                      ? (() => {
                          const [hi, mi] = a.in.split(':').map(Number)
                          const [ho, mo] = a.out.split(':').map(Number)
                          const diff = ((ho * 60 + mo) - (hi * 60 + mi)) / 60
                          return `${diff.toFixed(1)} س`
                        })()
                      : '—'
                    return (
                      <tr key={a.day}>
                        <td className="font-semibold text-gray-800">{a.day}</td>
                        <td className="col-num text-gray-500">{a.date} نوفمبر</td>
                        <td>
                          <span className={`text-xs font-bold ${ATT_STYLE[a.status]}`}>
                            {a.status === 'حاضر' && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />}
                            {a.status === 'غائب' && <XCircle className="w-3.5 h-3.5 inline ml-1" />}
                            {a.status === 'متأخر' && <AlertCircle className="w-3.5 h-3.5 inline ml-1" />}
                            {a.status}
                          </span>
                        </td>
                        <td className="col-num text-gray-600">{a.in}</td>
                        <td className="col-num text-gray-600">{a.out}</td>
                        <td className="col-num font-bold text-blue-600">{hours}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── My Requests Tab ── */}
        {tab === 'طلباتي' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-700">جميع طلباتي</h2>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> طلب جديد</button>
            </div>

            <div className="erp-card overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>النوع</th>
                    <th>من</th>
                    <th>إلى</th>
                    <th>الأيام</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {MY_REQUESTS.map(r => (
                    <tr key={r.ref}>
                      <td className="font-mono text-xs text-blue-600">{r.ref}</td>
                      <td className="font-semibold text-sm text-gray-800">{r.type}</td>
                      <td className="text-gray-500 text-sm">{r.from}</td>
                      <td className="text-gray-500 text-sm">{r.to}</td>
                      <td className="col-num font-bold">{r.days}</td>
                      <td><span className={`badge ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm text-xs">عرض</button>
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
