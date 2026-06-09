'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, X, Info, Search } from 'lucide-react'
import { ACCOUNT_TYPES_AR } from '@/types/accounting'
import { createAccount, deleteAccount } from './actions'
import type { Account, AccountType, Nature } from '@/types/accounting'

const TYPE_STYLE: Record<AccountType, string> = {
  asset:     'badge-info',
  liability: 'badge-danger',
  equity:    'badge-amber',
  revenue:   'badge-success',
  expense:   'badge-warning',
}

// Each account type has a conventional normal balance (nature)
const DEFAULT_NATURE: Record<AccountType, Nature> = {
  asset: 'debit', expense: 'debit',
  liability: 'credit', equity: 'credit', revenue: 'credit',
}

export default function CoaClient({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [code, setCode]       = useState('')
  const [nameAr, setNameAr]   = useState('')
  const [name, setName]       = useState('')
  const [type, setType]       = useState<AccountType>('expense')
  const [nature, setNature]   = useState<Nature>('debit')
  const [notes, setNotes]     = useState('')

  function flash(ok: boolean, text: string) { setMsg({ ok, text }); setTimeout(() => setMsg(null), 3500) }

  function pickType(t: AccountType) { setType(t); setNature(DEFAULT_NATURE[t]) }

  async function handleAdd() {
    setSaving(true)
    const r = await createAccount({ code, name_ar: nameAr, name, type, nature, notes })
    setSaving(false)
    if (!r.ok) { flash(false, r.error ?? 'خطأ'); return }
    flash(true, 'تمت إضافة الحساب بنجاح')
    setCode(''); setNameAr(''); setName(''); setNotes('')
    setShowForm(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الحساب؟')) return
    const r = await deleteAccount(id)
    if (!r.ok) flash(false, r.error ?? 'خطأ'); else { flash(true, 'تم الحذف'); router.refresh() }
  }

  const filtered = accounts.filter(a =>
    !search || a.code.includes(search) || a.name_ar.includes(search) || a.name.includes(search))

  // group by type for readable display
  const grouped = (['asset', 'liability', 'equity', 'revenue', 'expense'] as AccountType[])
    .map(t => ({ type: t, items: filtered.filter(a => a.type === t) }))
    .filter(g => g.items.length > 0)

  return (
    <main className="flex-1 p-6 space-y-5 page-enter">

      {/* Header */}
      <div className="erp-card">
        <div className="erp-card-body flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800">دليل الحسابات <span className="itag">IFRS</span></h1>
              <p className="text-gray-500 text-sm mt-0.5">{accounts.length} حساب · هيكل الحسابات وفق المعايير الدولية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(h => !h)} className="btn btn-outline btn-sm">
              <Info className="w-3.5 h-3.5" /> طريقة الاستخدام
            </button>
            <button onClick={() => setShowForm(f => !f)} className="btn btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> إضافة حساب
            </button>
          </div>
        </div>
      </div>

      {/* How-to */}
      {showHelp && (
        <div className="erp-card" style={{ borderColor: '#bfdbfe', background: '#f8fbff' }}>
          <div className="erp-card-body space-y-2 text-sm text-gray-700 leading-relaxed">
            <p className="font-black text-gray-800 text-base">📘 طريقة استخدام دليل الحسابات</p>
            <p><strong>1. رقم الحساب (code):</strong> رقم فريد يحدّد موقع الحساب. النظام يستخدم تصنيفاً رقمياً:
              <span className="font-mono"> 1xxx أصول</span>، <span className="font-mono">2xxx خصوم</span>،
              <span className="font-mono"> 3xxx حقوق ملكية</span>، <span className="font-mono">4xxx إيرادات</span>،
              <span className="font-mono"> 6xxx مصروفات</span>. مثال: <span className="font-mono">5401</span> لمصروف صيانة جديد.</p>
            <p><strong>2. النوع (type):</strong> يحدد القائمة المالية التي يظهر فيها الحساب — الأصول والخصوم وحقوق الملكية في <strong>المركز المالي</strong>، والإيرادات والمصروفات في <strong>قائمة الدخل</strong>.</p>
            <p><strong>3. الطبيعة (nature):</strong> الجانب الطبيعي لرصيد الحساب. الأصول والمصروفات <strong>مدينة</strong>، والخصوم وحقوق الملكية والإيرادات <strong>دائنة</strong>. النظام يقترحها تلقائياً حسب النوع.</p>
            <p><strong>4. بعد الإضافة:</strong> يظهر الحساب فوراً في قائمة اختيار الحسابات عند إنشاء <strong>قيد يومي جديد</strong>، ويُحتسب تلقائياً في ميزان المراجعة والقوائم المالية.</p>
            <p className="text-amber-700 bg-amber-50 rounded-lg px-3 py-2"><strong>ملاحظة:</strong> لا يمكن حذف حساب استُخدم في قيود محاسبية للحفاظ على سلامة البيانات.</p>
          </div>
        </div>
      )}

      {/* Flash */}
      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${msg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {msg.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{msg.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="erp-card">
          <div className="erp-card-header"><h2 className="font-bold text-gray-800 text-sm">إضافة حساب جديد</h2></div>
          <div className="erp-card-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className="erp-label">رقم الحساب *</label>
                <input value={code} onChange={e => setCode(e.target.value)} placeholder="مثال: 5401" dir="ltr" className="erp-input" /></div>
              <div><label className="erp-label">اسم الحساب بالعربية *</label>
                <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: مصروف صيانة" className="erp-input" /></div>
              <div><label className="erp-label">الاسم بالإنجليزية</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Maintenance Expense" dir="ltr" className="erp-input" /></div>
              <div><label className="erp-label">نوع الحساب *</label>
                <select value={type} onChange={e => pickType(e.target.value as AccountType)} className="erp-input">
                  {(Object.keys(ACCOUNT_TYPES_AR) as AccountType[]).map(t => <option key={t} value={t}>{ACCOUNT_TYPES_AR[t]}</option>)}
                </select></div>
              <div><label className="erp-label">طبيعة الرصيد</label>
                <select value={nature} onChange={e => setNature(e.target.value as Nature)} className="erp-input">
                  <option value="debit">مدين</option><option value="credit">دائن</option>
                </select></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className="erp-label">ملاحظات</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="وصف اختياري" className="erp-input" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving} className="btn btn-success">
                <Check className="w-4 h-4" /> {saving ? 'جاري الحفظ...' : 'إضافة الحساب'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn btn-outline">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 w-72">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالرقم أو الاسم..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
      </div>

      {/* Accounts grouped */}
      <div className="space-y-5">
        {grouped.map(g => (
          <div key={g.type} className="erp-card overflow-hidden">
            <div className="erp-card-header">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span className={`badge ${TYPE_STYLE[g.type]}`}>{ACCOUNT_TYPES_AR[g.type]}</span>
                <span className="text-gray-400 font-normal text-xs">{g.items.length} حساب</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead><tr>
                  <th style={{ width: 90 }}>الرقم</th><th>اسم الحساب</th>
                  <th style={{ width: 110 }}>الطبيعة</th><th style={{ width: 70 }}>المستوى</th><th style={{ width: 50 }}></th>
                </tr></thead>
                <tbody>
                  {g.items.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-xs text-gray-600">{a.code}</td>
                      <td className="text-gray-800 text-sm font-medium">{a.name_ar}
                        <span className="text-gray-400 text-xs mr-2">{a.name}</span></td>
                      <td><span className={`badge ${a.nature === 'debit' ? 'badge-info' : 'badge-amber'}`}>{a.nature === 'debit' ? 'مدين' : 'دائن'}</span></td>
                      <td className="text-gray-400 text-xs">{a.level}</td>
                      <td>
                        {a.level >= 3 && (
                          <button onClick={() => handleDelete(a.id)} className="btn btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
