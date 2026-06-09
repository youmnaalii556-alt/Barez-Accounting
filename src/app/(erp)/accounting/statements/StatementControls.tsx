'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Printer } from 'lucide-react'
import type { Project } from '@/types/accounting'

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const YEARS = ['2026', '2025', '2024']

interface Props {
  projects: Project[]
  project: string
  mode: 'monthly' | 'annual'
  month: string
  year: string
  tab: string
}

export default function StatementControls({ projects, project, mode, month, year, tab }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function update(patch: Record<string, string>) {
    const q = new URLSearchParams(params.toString())
    Object.entries(patch).forEach(([k, v]) => q.set(k, v))
    router.push(`${pathname}?${q.toString()}`)
  }

  const selStyle = 'erp-input text-sm py-1.5'

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      {/* Project / consolidated */}
      <select value={project} onChange={e => update({ project: e.target.value })} className={`${selStyle} w-52`}>
        <option value="all">⊕ مجمّعة — كل المشاريع (الشركة)</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
      </select>

      {/* Period mode */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
        {(['monthly', 'annual'] as const).map(m => (
          <button key={m} onClick={() => update({ mode: m })}
            className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}>
            {m === 'monthly' ? 'شهري' : 'سنوي'}
          </button>
        ))}
      </div>

      {mode === 'monthly' && (
        <select value={month} onChange={e => update({ month: e.target.value })} className={selStyle}>
          {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>
      )}

      <select value={year} onChange={e => update({ year: e.target.value })} className={selStyle}>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      <button onClick={() => window.print()} className="btn btn-outline btn-sm">
        <Printer className="w-3.5 h-3.5" /> طباعة
      </button>
    </div>
  )
}

export { MONTHS }
