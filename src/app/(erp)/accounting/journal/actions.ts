'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DraftLine } from '@/types/accounting'

export interface CreateJournalInput {
  entry_no: string
  entry_date: string
  project_id: string | null
  description: string
  reference: string
  lines: DraftLine[]
}

export interface ActionResult { ok: boolean; error?: string }

export async function createJournal(input: CreateJournalInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح — سجّل الدخول' }

  const totalDebit  = input.lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0)
  const totalCredit = input.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)

  if (!input.description.trim()) return { ok: false, error: 'أدخل بيان القيد' }
  if (input.lines.some(l => !l.account_id)) return { ok: false, error: 'اختر الحساب لكل سطر' }
  if (totalDebit <= 0) return { ok: false, error: 'أدخل مبالغ القيد' }
  if (Math.abs(totalDebit - totalCredit) > 0.01)
    return { ok: false, error: 'القيد غير متوازن — المدين لا يساوي الدائن' }

  const { data: entry, error: jErr } = await supabase
    .from('journal_entries')
    .insert({
      entry_no: input.entry_no,
      entry_date: input.entry_date,
      project_id: input.project_id,
      description: input.description.trim(),
      reference: input.reference || null,
      status: 'posted',
      posted_by: user.id,
      posted_at: new Date().toISOString(),
      created_by: user.id,
    })
    .select('id')
    .single()

  if (jErr || !entry) return { ok: false, error: `فشل حفظ القيد: ${jErr?.message ?? ''}` }

  const lines = input.lines.map((l, i) => ({
    entry_id: entry.id,
    account_id: l.account_id,
    debit: parseFloat(l.debit) || 0,
    credit: parseFloat(l.credit) || 0,
    description: l.description || null,
    line_order: i,
  }))

  const { error: lErr } = await supabase.from('journal_lines').insert(lines)
  if (lErr) {
    await supabase.from('journal_entries').delete().eq('id', entry.id)
    return { ok: false, error: `فشل حفظ السطور: ${lErr.message}` }
  }

  revalidatePath('/accounting/journal')
  revalidatePath('/accounting/trial-balance')
  revalidatePath('/accounting/statements')
  revalidatePath('/accounting')
  return { ok: true }
}

export async function deleteJournal(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/accounting/journal')
  revalidatePath('/accounting/trial-balance')
  revalidatePath('/accounting/statements')
  return { ok: true }
}
