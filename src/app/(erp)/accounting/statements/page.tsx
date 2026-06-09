import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getProjects, getAccounts, getJournals, getCompany } from '@/lib/accounting/data'
import { profitLoss, balanceSheet, cashFlow, filterJournals, fmt } from '@/lib/accounting/engine'
import { TrendingUp, Building2, Coins } from 'lucide-react'
import StatementControls, { MONTHS } from './StatementControls'
import type { Profile } from '@/types'
import type { CompanySettings, Project } from '@/types/accounting'

export const dynamic = 'force-dynamic'

type Tab = 'pl' | 'bs' | 'cf'
type Mode = 'monthly' | 'annual'

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; tab?: Tab; mode?: Mode; month?: string; year?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const sp = await searchParams
  const project = sp.project ?? 'all'
  const tab: Tab = sp.tab ?? 'pl'
  const mode: Mode = sp.mode ?? 'monthly'
  const month = sp.month ?? String(new Date().getMonth() + 1).padStart(2, '0')
  const year  = sp.year ?? String(new Date().getFullYear())

  const [projects, accounts, allJournals, company] = await Promise.all([
    getProjects(), getAccounts(), getJournals(project), getCompany(),
  ])

  // period filter
  const journals = filterJournals(allJournals, { month: mode === 'monthly' ? month : null, year })

  const pl = profitLoss(journals, accounts)
  const bs = balanceSheet(journals, accounts)
  const cf = cashFlow(journals, accounts)

  const proj = project === 'all' ? null : projects.find(p => p.id === project)
  const titleName = proj ? proj.name_ar : company.name_ar
  const periodLabel = mode === 'annual'
    ? `السنة المالية ${year}`
    : `${MONTHS[parseInt(month) - 1]} ${year}`
  const cur = company.currency_ar

  const q = (t: Tab) => {
    const p = new URLSearchParams({ tab: t, project, mode, month, year })
    return `?${p.toString()}`
  }

  const TABS: { id: Tab; label: string; std: string; icon: typeof TrendingUp }[] = [
    { id: 'pl', label: 'قائمة الدخل',      std: 'IAS 1', icon: TrendingUp },
    { id: 'bs', label: 'المركز المالي',     std: 'IAS 1', icon: Building2  },
    { id: 'cf', label: 'التدفقات النقدية',  std: 'IAS 7', icon: Coins      },
  ]

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 p-6 space-y-5 page-enter">

        <StatementControls projects={projects as Project[]} project={project} mode={mode} month={month} year={year} tab={tab} />

        {/* Statement tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm w-fit no-print">
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
            <FSHeader company={company} title={titleName} statement="قائمة الدخل الشامل" period={periodLabel} std="IAS 1" consolidated={project === 'all'} />
            <div className="erp-card-body">
              <table className="erp-table">
                <tbody>
                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">الإيرادات</td></tr>
                  {pl.revenue.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 text-sm py-2">لا توجد إيرادات مسجّلة</td></tr>}
                  {pl.revenue.map(r => (
                    <tr key={r.code}><td className="text-gray-700 text-sm">{r.name}</td>
                      <td className="col-num text-credit font-bold text-sm">{fmt(r.amount)}</td></tr>
                  ))}
                  <tr className="bg-gray-50/60"><td className="font-bold text-gray-700 text-sm">إجمالي الإيرادات</td>
                    <td className="col-num font-black text-credit">{fmt(pl.totalRevenue)}</td></tr>

                  <tr className="bg-gray-50"><td colSpan={2} className="font-black text-gray-700">المصروفات</td></tr>
                  {pl.expenses.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 text-sm py-2">لا توجد مصروفات مسجّلة</td></tr>}
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
              <FSFooter cur={cur} period={periodLabel} />
            </div>
          </div>
        )}

        {/* ── Balance Sheet ── */}
        {tab === 'bs' && (
          <div className="erp-card">
            <FSHeader company={company} title={titleName} statement="قائمة المركز المالي" period={periodLabel} std="IAS 1" consolidated={project === 'all'} />
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
            <FSHeader company={company} title={titleName} statement="قائمة التدفقات النقدية" period={periodLabel} std="IAS 7 · الطريقة المباشرة" consolidated={project === 'all'} />
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
              <FSFooter cur={cur} period={periodLabel} />
            </div>
          </div>
        )}
      </main>
    </>
  )
}

function FSHeader({ company, title, statement, period, std, consolidated }: {
  company: CompanySettings; title: string; statement: string; period: string; std: string; consolidated: boolean
}) {
  return (
    <div className="text-center py-5 border-b-2 border-gray-800 relative">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: company.logo_url ? '#fff' : 'linear-gradient(135deg,#c5a028,#e2b93b)' }}>
          {company.logo_url
            ? <img src={company.logo_url} alt="logo" className="w-full h-full object-cover" />
            : <span className="text-white font-black text-xl">B</span>}
        </div>
        <div className="text-right">
          <p className="font-black text-gray-800 text-base leading-tight">{title}</p>
          {consolidated && <p className="text-[10px] text-gray-400">قوائم مجمّعة — جميع المشاريع</p>}
        </div>
      </div>
      <h2 className="text-lg font-black text-gray-800">{statement}</h2>
      <p className="text-xs text-gray-500 mt-1">للفترة: {period} <span className="itag mr-1">{std}</span></p>
    </div>
  )
}

function FSFooter({ cur, period }: { cur: string; period: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 mt-3 pt-3 px-1">
      <span>المبالغ بالـ {cur}</span>
      <span>المحاسب: ____________</span>
      <span>المدير المالي: ____________</span>
      <span>{period}</span>
    </div>
  )
}
