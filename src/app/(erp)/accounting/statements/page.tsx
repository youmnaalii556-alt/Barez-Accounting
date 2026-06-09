import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getProjects, getAccounts, getJournals } from '@/lib/accounting/data'
import { profitLoss, balanceSheet, cashFlow, fmt } from '@/lib/accounting/engine'
import { TrendingUp, Building2, Coins } from 'lucide-react'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

type Tab = 'pl' | 'bs' | 'cf'

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; tab?: Tab }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { project: projectId = 'all', tab = 'pl' } = await searchParams
  const [projects, accounts, journals] = await Promise.all([
    getProjects(), getAccounts(), getJournals(projectId),
  ])

  const pl = profitLoss(journals, accounts)
  const bs = balanceSheet(journals, accounts)
  const cf = cashFlow(journals, accounts)

  const projName = projectId === 'all'
    ? 'Barez Company (مجمّعة)'
    : projects.find(p => p.id === projectId)?.name_ar ?? '—'

  const q = (t: Tab) => `?tab=${t}${projectId !== 'all' ? `&project=${projectId}` : ''}`

  const TABS: { id: Tab; label: string; std: string; icon: typeof TrendingUp }[] = [
    { id: 'pl', label: 'قائمة الدخل',       std: 'IAS 1', icon: TrendingUp },
    { id: 'bs', label: 'المركز المالي',      std: 'IAS 1', icon: Building2  },
    { id: 'cf', label: 'التدفقات النقدية',   std: 'IAS 7', icon: Coins      },
  ]

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        {/* Project filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/accounting/statements?tab=${tab}`}
            className={`btn btn-sm ${projectId === 'all' ? 'btn-primary' : 'btn-outline'}`}>كل المشاريع</Link>
          {projects.map(p => (
            <Link key={p.id} href={`/accounting/statements?tab=${tab}&project=${p.id}`}
              className={`btn btn-sm ${projectId === p.id ? 'btn-primary' : 'btn-outline'}`}>{p.name_ar}</Link>
          ))}
        </div>

        {/* Statement tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {TABS.map(t => (
            <Link key={t.id} href={q(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </Link>
          ))}
        </div>

        {/* ── Income Statement ── */}
        {tab === 'pl' && (
          <div className="erp-card max-w-2xl mx-auto">
            <FSHeader title="قائمة الدخل الشامل" subtitle={`${projName} · IAS 1`} />
            <div className="erp-card-body">
              <table className="erp-table">
                <tbody>
                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">الإيرادات</td></tr>
                  {pl.revenue.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 text-sm py-2">لا توجد إيرادات</td></tr>}
                  {pl.revenue.map(r => (
                    <tr key={r.code}><td className="text-gray-700 text-sm">{r.name}</td>
                      <td className="col-num text-credit font-bold text-sm">{fmt(r.amount)}</td></tr>
                  ))}
                  <tr className="bg-gray-50/60"><td className="font-bold text-gray-700 text-sm">إجمالي الإيرادات</td>
                    <td className="col-num font-black text-credit">{fmt(pl.totalRevenue)}</td></tr>

                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">المصروفات</td></tr>
                  {pl.expenses.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 text-sm py-2">لا توجد مصروفات</td></tr>}
                  {pl.expenses.map(e => (
                    <tr key={e.code}><td className="text-gray-700 text-sm">{e.name}</td>
                      <td className="col-num text-debit font-bold text-sm">({fmt(e.amount)})</td></tr>
                  ))}
                  <tr className="bg-gray-50/60"><td className="font-bold text-gray-700 text-sm">إجمالي المصروفات</td>
                    <td className="col-num font-black text-debit">({fmt(pl.totalExpenses)})</td></tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: '#0f2744' }}>
                    <td className="font-black" style={{ color: '#c5a028' }}>صافي الربح (الهامش {pl.margin}%)</td>
                    <td className="col-num font-black" style={{ color: '#c5a028' }}>{fmt(pl.net)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ── Balance Sheet ── */}
        {tab === 'bs' && (
          <div className="erp-card">
            <FSHeader title="قائمة المركز المالي" subtitle={`${projName} · IAS 1`} />
            <div className="erp-card-body grid grid-cols-1 md:grid-cols-2 gap-5">
              <table className="erp-table">
                <thead><tr><th colSpan={2}>الأصول</th></tr></thead>
                <tbody>
                  {bs.assets.map(a => (
                    <tr key={a.code}><td className="text-gray-700 text-sm">{a.name}</td>
                      <td className="col-num font-bold text-sm">{fmt(a.amount)}</td></tr>
                  ))}
                  {bs.assets.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 text-sm py-2">—</td></tr>}
                </tbody>
                <tfoot><tr style={{ background: '#0f2744' }}>
                  <td className="font-black" style={{ color: '#c5a028' }}>إجمالي الأصول</td>
                  <td className="col-num font-black" style={{ color: '#c5a028' }}>{fmt(bs.totalAssets)}</td>
                </tr></tfoot>
              </table>

              <table className="erp-table">
                <thead><tr><th colSpan={2}>الالتزامات وحقوق الملكية</th></tr></thead>
                <tbody>
                  {bs.liabilities.map(l => (
                    <tr key={l.code ?? l.name}><td className="text-gray-700 text-sm">{l.name}</td>
                      <td className="col-num text-debit font-bold text-sm">{fmt(l.amount)}</td></tr>
                  ))}
                  {bs.equity.map(e => (
                    <tr key={e.code ?? e.name}><td className="text-gray-700 text-sm">{e.name}</td>
                      <td className="col-num text-credit font-bold text-sm">{fmt(e.amount)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ background: '#0f2744' }}>
                  <td className="font-black" style={{ color: '#c5a028' }}>الإجمالي</td>
                  <td className="col-num font-black" style={{ color: '#c5a028' }}>{fmt(bs.totalLiabilities + bs.totalEquity)}</td>
                </tr></tfoot>
              </table>
            </div>
            <div className={`mx-5 mb-5 px-4 py-2.5 rounded-xl text-sm font-semibold text-center ${bs.balanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {bs.balanced ? '✓ الميزانية متوازنة — الأصول = الالتزامات + حقوق الملكية' : '⚠ غير متوازنة'}
            </div>
          </div>
        )}

        {/* ── Cash Flow ── */}
        {tab === 'cf' && (
          <div className="erp-card max-w-2xl mx-auto">
            <FSHeader title="قائمة التدفقات النقدية" subtitle={`${projName} · الطريقة المباشرة · IAS 7`} />
            <div className="erp-card-body">
              <table className="erp-table">
                <tbody>
                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">الأنشطة التشغيلية</td></tr>
                  <tr><td className="text-gray-700 text-sm">إجمالي الإيرادات المحصّلة</td>
                    <td className="col-num text-credit font-bold text-sm">{fmt(cf.operatingInflow)}</td></tr>
                  <tr><td className="text-gray-700 text-sm">إجمالي المصروفات المدفوعة</td>
                    <td className="col-num text-debit font-bold text-sm">({fmt(cf.operatingOutflow)})</td></tr>
                  <tr className="bg-gray-50/60"><td className="font-bold text-gray-700 text-sm">صافي التدفقات التشغيلية</td>
                    <td className="col-num font-black text-sm">{fmt(cf.netOperating)}</td></tr>
                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">الأنشطة الاستثمارية</td></tr>
                  <tr><td className="text-gray-400 text-sm">لا توجد حركات</td><td className="col-num text-gray-400">—</td></tr>
                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">الأنشطة التمويلية</td></tr>
                  <tr><td className="text-gray-400 text-sm">لا توجد حركات</td><td className="col-num text-gray-400">—</td></tr>
                </tbody>
                <tfoot><tr style={{ background: '#0f2744' }}>
                  <td className="font-black" style={{ color: '#c5a028' }}>صافي الزيادة في النقدية</td>
                  <td className="col-num font-black" style={{ color: '#c5a028' }}>{fmt(cf.netChange)}</td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

function FSHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-5 border-b-2 border-gray-800">
      <h2 className="text-lg font-black text-gray-800">{title}</h2>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">
        {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}
