import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getProjects, getAccounts, getJournals } from '@/lib/accounting/data'
import { trialBalance, fmt } from '@/lib/accounting/engine'
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { project: projectId = 'all' } = await searchParams
  const [projects, accounts, journals] = await Promise.all([
    getProjects(), getAccounts(), getJournals(projectId),
  ])

  const tb = trialBalance(journals, accounts)

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        <div className="erp-card">
          <div className="erp-card-body flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-800">ميزان المراجعة <span className="itag">IAS 1</span></h1>
                <p className="text-gray-500 text-sm mt-0.5">أرصدة جميع الحسابات والتحقق من التوازن المحاسبي</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/accounting/trial-balance"
                className={`btn btn-sm ${projectId === 'all' ? 'btn-primary' : 'btn-outline'}`}>كل المشاريع</Link>
              {projects.map(p => (
                <Link key={p.id} href={`/accounting/trial-balance?project=${p.id}`}
                  className={`btn btn-sm ${projectId === p.id ? 'btn-primary' : 'btn-outline'}`}>{p.name_ar}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Balance status banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
          tb.balanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {tb.balanced
            ? <><CheckCircle2 className="w-4 h-4" /> الميزان متوازن — مجموع المدين يساوي مجموع الدائن</>
            : <><AlertTriangle className="w-4 h-4" /> الميزان غير متوازن — الفرق: {fmt(tb.difference)} ج.م</>}
        </div>

        <div className="erp-card overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>رقم الحساب</th>
                <th>اسم الحساب</th>
                <th className="col-num">مجموع مدين</th>
                <th className="col-num">مجموع دائن</th>
                <th className="col-num">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {tb.rows.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-10 text-sm">لا توجد حركات مسجّلة</td></tr>
              )}
              {tb.rows.map(r => (
                <tr key={r.code}>
                  <td className="font-mono text-xs">{r.code}</td>
                  <td className="text-gray-800 text-sm">{r.name}</td>
                  <td className="col-num text-debit font-bold text-sm">{fmt(r.debit)}</td>
                  <td className="col-num text-credit font-bold text-sm">{fmt(r.credit)}</td>
                  <td className={`col-num font-black text-sm ${r.net >= 0 ? 'text-credit' : 'text-debit'}`}>{fmt(r.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="font-black text-gray-700">الإجمالي</td>
                <td className="col-num font-black text-debit">{fmt(tb.totalDebit)}</td>
                <td className="col-num font-black text-credit">{fmt(tb.totalCredit)}</td>
                <td className="col-num font-black">{fmt(tb.difference)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </>
  )
}
