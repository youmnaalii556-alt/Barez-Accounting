'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Trash2, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronLeft, Zap,
} from 'lucide-react'
import { fmt, postableAccounts } from '@/lib/accounting/engine'
import { createJournal, deleteJournal } from './actions'
import type { Account, Project, Journal, DraftLine } from '@/types/accounting'

interface Props {
  projects: Project[]
  accounts: Account[]
  journals: Journal[]
  nextNo: string
}

const EMPTY_LINE: DraftLine = { account_id: '', description: '', debit: '', credit: '' }

export default function JournalClient({ projects, accounts, journals, nextNo }: Props) {
  const router = useRouter()
  const [search,   setSearch]   = useState('')
  const [projF,    setProjF]    = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const accById = useMemo(() => {
    const m: Record<string, Account> = {}
    accounts.forEach(a => { m[a.id] = a })
    return m
  }, [accounts])

  const projById = useMemo(() => {
    const m: Record<string, Project> = {}
    projects.forEach(p => { m[p.id] = p })
    return m
  }, [projects])

  const filtered = journals.filter(j => {
    const ms = !search || j.entry_no.includes(search) || j.description.includes(search)
    const mp = projF === 'all' || j.project_id === projF
    return ms && mp
  })

  const journalTotal = (j: Journal) => (j.lines ?? []).reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalAmount  = journals.reduce((s, j) => s + journalTotal(j), 0)

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا القيد نهائياً؟')) return
    const r = await deleteJournal(id)
    if (!r.ok) alert(r.error); else router.refresh()
  }

  return (
    <main className="flex-1 p-6 space-y-5 page-enter">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي القيود', value: journals.length,                       unit: 'قيد',   cls: 'navy'  },
          { label: 'المشاريع',      value: projects.length,                       unit: 'مشروع', cls: 'green' },
          { label: 'الحسابات',      value: accounts.length,                       unit: 'حساب',  cls: 'amber' },
          { label: 'إجمالي المبالغ', value: (totalAmount / 1000).toFixed(1) + 'K', unit: 'ج.م',  cls: 'blue'  },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <p className="text-2xl font-black text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.unit}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="erp-card">
        <div className="action-bar flex flex-wrap items-center gap-2 p-3 border-b border-gray-100">
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> قيد جديد
          </button>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-52">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالرقم أو البيان..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400" />
          </div>
          <select value={projF} onChange={e => setProjF(e.target.value)} className="erp-input text-sm py-1.5 w-44">
            <option value="all">كل المشاريع</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>رقم القيد</th><th>التاريخ</th><th>المشروع</th><th>البيان</th>
                <th className="col-num">المبلغ (ج.م)</th><th>الحالة</th><th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-sm">لا توجد قيود — أنشئ قيدك الأول</td></tr>
              )}
              {filtered.map(j => {
                const open = expanded === j.id
                return [
                  <tr key={j.id} className="cursor-pointer" onClick={() => setExpanded(open ? null : j.id)}>
                    <td>{open ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />}</td>
                    <td><span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{j.entry_no}</span></td>
                    <td className="text-gray-600 text-sm">{j.entry_date}</td>
                    <td className="text-gray-500 text-xs">{j.project_id ? projById[j.project_id]?.name_ar ?? '—' : '—'}</td>
                    <td className="text-gray-800 font-medium text-sm">{j.description}</td>
                    <td className="col-num font-bold text-sm text-gray-800">{fmt(journalTotal(j))}</td>
                    <td><span className="badge badge-success">مرحّل</span></td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); handleDelete(j.id) }}
                        className="btn btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600" title="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>,
                  open && (
                    <tr key={`${j.id}-d`}>
                      <td colSpan={8} className="p-0">
                        <div className="bg-blue-50/60 border-y border-blue-100 px-6 py-3">
                          <p className="text-xs font-bold text-blue-700 mb-2">تفاصيل السطور المحاسبية</p>
                          <table className="w-full text-sm">
                            <thead><tr className="text-xs text-gray-500">
                              <th className="text-right pb-1.5">الحساب</th>
                              <th className="text-right pb-1.5">البيان</th>
                              <th className="col-num pb-1.5">مدين</th>
                              <th className="col-num pb-1.5">دائن</th>
                            </tr></thead>
                            <tbody>
                              {(j.lines ?? []).map(l => {
                                const a = accById[l.account_id]
                                return (
                                  <tr key={l.id} className="border-t border-blue-100">
                                    <td className="py-1.5 text-gray-700">
                                      <span className="font-mono text-xs text-blue-700">{a?.code}</span> {a?.name_ar ?? ''}
                                    </td>
                                    <td className="py-1.5 text-gray-500 text-xs">{l.description ?? '—'}</td>
                                    <td className={`col-num py-1.5 font-bold text-xs ${Number(l.debit) ? 'text-debit' : 'text-gray-300'}`}>{Number(l.debit) ? fmt(Number(l.debit)) : '—'}</td>
                                    <td className={`col-num py-1.5 font-bold text-xs ${Number(l.credit) ? 'text-credit' : 'text-gray-300'}`}>{Number(l.credit) ? fmt(Number(l.credit)) : '—'}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  ),
                ]
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <NewEntryModal projects={projects} accounts={accounts} nextNo={nextNo}
          onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); router.refresh() }} />
      )}
    </main>
  )
}

function NewEntryModal({
  projects, accounts, nextNo, onClose, onSaved,
}: {
  projects: Project[]; accounts: Account[]; nextNo: string
  onClose: () => void; onSaved: () => void
}) {
  const postable = useMemo(() => postableAccounts(accounts), [accounts])
  const byCode   = useMemo(() => {
    const m: Record<string, Account> = {}; accounts.forEach(a => { m[a.code] = a }); return m
  }, [accounts])

  const [date, setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [entryNo, setEntryNo]= useState(nextNo)
  const [projectId, setProj] = useState(projects[0]?.id ?? '')
  const [reference, setRef]  = useState('')
  const [desc, setDesc]      = useState('')
  const [lines, setLines]    = useState<DraftLine[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE }])
  const [saving, setSaving]  = useState(false)
  const [error, setError]    = useState<string | null>(null)

  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const diff = Math.abs(totalDebit - totalCredit)
  const balanced = diff < 0.01 && totalDebit > 0

  const setLine = (i: number, patch: Partial<DraftLine>) =>
    setLines(p => p.map((l, j) => j === i ? { ...l, ...patch } : l))
  const addLine = () => setLines(p => [...p, { ...EMPTY_LINE }])
  const removeLine = (i: number) => { if (lines.length > 2) setLines(p => p.filter((_, j) => j !== i)) }

  function loadSample(type: 'rev' | 'exp') {
    const id = (code: string) => byCode[code]?.id ?? ''
    if (type === 'rev') {
      setLines([
        { account_id: id('1101'), description: 'استلام نقدي', debit: '500', credit: '' },
        { account_id: id('4101'), description: 'إيراد مبيعات', debit: '', credit: '500' },
      ])
      setDesc('إيراد مبيعات نقدية')
    } else {
      setLines([
        { account_id: id('6202'), description: 'فاتورة كهرباء', debit: '321.55', credit: '' },
        { account_id: id('1102'), description: 'دفع من البنك', debit: '', credit: '321.55' },
      ])
      setDesc('سداد فاتورة كهرباء')
    }
  }

  async function handleSave() {
    setSaving(true); setError(null)
    const r = await createJournal({
      entry_no: entryNo, entry_date: date,
      project_id: projectId || null, description: desc, reference, lines,
    })
    setSaving(false)
    if (!r.ok) { setError(r.error ?? 'خطأ غير متوقع'); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-800 text-lg">قيد يومي جديد</h2>
            <p className="text-xs text-gray-400 mt-0.5">مجموع المدين يجب أن يساوي مجموع الدائن قبل الترحيل</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm p-2 rounded-xl"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="erp-label">تاريخ القيد</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="erp-input" /></div>
            <div><label className="erp-label">رقم القيد</label>
              <input value={entryNo} onChange={e => setEntryNo(e.target.value)} className="erp-input" dir="ltr" /></div>
            <div><label className="erp-label">المشروع</label>
              <select value={projectId} onChange={e => setProj(e.target.value)} className="erp-input">
                <option value="">— بدون —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
              </select></div>
            <div><label className="erp-label">مرجع المستند</label>
              <input value={reference} onChange={e => setRef(e.target.value)} placeholder="فاتورة / إيصال" className="erp-input" /></div>
          </div>

          <div><label className="erp-label">البيان العام</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="مثال: إيراد مبيعات نقدية" className="erp-input" /></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="erp-label mb-0">أسطر القيد</p>
              <div className="flex gap-2">
                <button onClick={() => loadSample('rev')} className="btn btn-outline btn-sm"><Zap className="w-3 h-3" /> نموذج إيراد</button>
                <button onClick={() => loadSample('exp')} className="btn btn-outline btn-sm"><Zap className="w-3 h-3" /> نموذج مصروف</button>
                <button onClick={addLine} className="btn btn-outline btn-sm"><Plus className="w-3 h-3" /> سطر</button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="erp-table">
                <thead><tr>
                  <th style={{ width: '34%' }}>الحساب</th><th>البيان</th>
                  <th className="col-num" style={{ width: '17%' }}>مدين</th>
                  <th className="col-num" style={{ width: '17%' }}>دائن</th>
                  <th style={{ width: 36 }}></th>
                </tr></thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td>
                        <select value={l.account_id} onChange={e => setLine(i, { account_id: e.target.value })}
                          className="erp-input text-xs py-1.5">
                          <option value="">-- اختر --</option>
                          {postable.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name_ar}</option>)}
                        </select>
                      </td>
                      <td><input value={l.description} onChange={e => setLine(i, { description: e.target.value })}
                        placeholder="بيان" className="erp-input text-xs py-1.5" /></td>
                      <td><input type="number" value={l.debit} placeholder="0" dir="ltr"
                        onChange={e => setLine(i, { debit: e.target.value, credit: '' })}
                        className="erp-input text-xs py-1.5 text-debit font-bold" /></td>
                      <td><input type="number" value={l.credit} placeholder="0" dir="ltr"
                        onChange={e => setLine(i, { credit: e.target.value, debit: '' })}
                        className="erp-input text-xs py-1.5 text-credit font-bold" /></td>
                      <td>
                        <button onClick={() => removeLine(i)} disabled={lines.length <= 2}
                          className="btn btn-ghost btn-sm p-1 text-red-400 hover:text-red-600 disabled:opacity-30">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`mt-3 flex items-center justify-between gap-2 p-3 rounded-xl text-sm font-medium ${balanced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              <span>مدين: <strong>{fmt(totalDebit)}</strong></span>
              <span>دائن: <strong>{fmt(totalCredit)}</strong></span>
              <span>الفرق: <strong>{fmt(diff)}</strong></span>
              <span className="flex items-center gap-1.5">{balanced ? <><CheckCircle2 className="w-4 h-4" /> متوازن</> : <><Clock className="w-4 h-4" /> غير متوازن</>}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 gap-3">
          <button onClick={onClose} className="btn btn-outline">إلغاء</button>
          <button onClick={handleSave} disabled={!balanced || saving} className="btn btn-success">
            <CheckCircle2 className="w-4 h-4" /> {saving ? 'جاري الترحيل...' : 'ترحيل القيد'}
          </button>
        </div>
      </div>
    </div>
  )
}
