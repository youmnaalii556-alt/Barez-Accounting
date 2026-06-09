import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import {
  ClipboardList, List, Scale, FileText, BarChart3,
  TrendingUp, TrendingDown, DollarSign, BookOpen,
} from 'lucide-react'
import type { Profile } from '@/types'

const MODULES = [
  {
    href: '/accounting/journal',
    icon: ClipboardList,
    label: 'القيود اليومية',
    desc: 'تسجيل واعتماد القيود المحاسبية اليومية',
    color: '#2563eb', bg: '#eff6ff',
    stat: '٣٤ قيد هذا الشهر',
  },
  {
    href: '/accounting/chart-of-accounts',
    icon: List,
    label: 'دليل الحسابات',
    desc: 'هيكل الحسابات وفق المعايير المحاسبية',
    color: '#7c3aed', bg: '#faf5ff',
    stat: '٢٤٨ حساب نشط',
  },
  {
    href: '/accounting/trial-balance',
    icon: Scale,
    label: 'ميزان المراجعة',
    desc: 'التحقق من توازن الحسابات بالأرصدة',
    color: '#0d9488', bg: '#f0fdfa',
    stat: 'آخر تحديث اليوم',
  },
  {
    href: '/accounting/statements',
    icon: FileText,
    label: 'القوائم المالية',
    desc: 'قائمة الدخل، المركز المالي، التدفق النقدي (IFRS)',
    color: '#d97706', bg: '#fffbeb',
    stat: 'معايير IFRS/IAS 1',
  },
  {
    href: '/accounting/reports',
    icon: BarChart3,
    label: 'تقارير الحسابات',
    desc: 'تحليل الأداء المالي والتقارير الدورية',
    color: '#be185d', bg: '#fdf2f8',
    stat: '١٢ تقرير متاح',
  },
]

const SUMMARY = [
  { label: 'إجمالي الإيرادات',  value: '٢٤٥,٨٠٠', unit: 'د.ع.',  icon: TrendingUp,   color: '#16a34a', bg: '#f0fdf4' },
  { label: 'إجمالي المصروفات', value: '١٨١,٣٢٠', unit: 'د.ع.',  icon: TrendingDown, color: '#dc2626', bg: '#fef2f2' },
  { label: 'صافي الربح',        value: '٦٤,٤٨٠',  unit: 'د.ع.',  icon: DollarSign,   color: '#2563eb', bg: '#eff6ff' },
  { label: 'القيود هذا الشهر',  value: '١٢٦',      unit: 'قيد',   icon: BookOpen,     color: '#7c3aed', bg: '#faf5ff' },
]

export default async function AccountingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <Header profile={profile as Profile | null} />
      <main className="flex-1 p-6 space-y-6 page-enter">

        {/* Page header */}
        <div className="erp-card">
          <div className="erp-card-body">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-black text-gray-800">الحسابات المالية</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  نظام محاسبي متكامل وفق معايير IFRS — IAS 1 · IAS 7 · IFRS 15 · IFRS 16
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="badge badge-success">نشط</span>
                <span className="badge badge-info">IFRS Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY.map(s => (
            <div key={s.label} className="erp-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-xs font-semibold text-gray-500">{s.label}</p>
              </div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.unit}</p>
            </div>
          ))}
        </div>

        {/* Sub-module navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {MODULES.map(m => (
            <Link key={m.href} href={m.href}
              className="erp-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: m.bg }}>
                  <m.icon className="w-5 h-5" style={{ color: m.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{m.desc}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold" style={{ color: m.color }}>{m.stat}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Standards notice */}
        <div className="erp-card p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#fffbeb' }}>
              <Scale className="w-5 h-5" style={{ color: '#d97706' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">معايير المحاسبة الدولية المطبقة</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { code: 'IAS 1',   name: 'عرض القوائم المالية' },
                  { code: 'IAS 7',   name: 'قائمة التدفق النقدي' },
                  { code: 'IAS 16',  name: 'الأصول الثابتة' },
                  { code: 'IFRS 15', name: 'الإيرادات من العقود' },
                  { code: 'IFRS 16', name: 'عقود الإيجار' },
                ].map(s => (
                  <span key={s.code}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                    <span className="font-black">{s.code}</span>
                    <span className="text-amber-600">·</span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
